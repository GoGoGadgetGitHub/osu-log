const calc = require("rosu-pp-js");
const { pgp, db, dbQuery } = require("../database.js");
const err = require("../errors.js");

async function calculatePerformanceForScores(scores) {
  const performanceForScore = [];
  const newAttributes = [];

  console.log("Starting performance calculations...");

  let maps;
  try {
    maps = await getMapsFromDatabase(scores);
    await addNewMaps(scores, maps);
  } catch (e) {
    console.log("Error in map handeling...", e);
    throw e;
  }

  for (const score of scores) {
    const mapData = maps[score.beatmap.id];
    const stats = score.statistics;

    const { modCombo, modHasSettings, lazer } = parseMods(score.mods);
    const attributes = getOrCalcAttributes(
      mapData,
      newAttributes,
      score,
      modCombo,
      modHasSettings,
    );

    performanceOptions = {
      combo: score.max_combo,
      n300: stats.great,
      n100: stats.ok,
      n50: stats.meh,
      mods: score.mods,
      lazer,
      passedObjects: (stats.great ?? 0) + (stats.ok ?? 0) + (stats.meh ?? 0) +
        (stats.miss ?? 0),
      misses: stats.miss,
      largeTickHits: stats.large_tick_hit,
      sliderEndHits: stats.slider_tail_hit,
    };

    //I'm calculating the performance attributes for failed scores based off the beatmap object here because there seems to be a massive
    //diffrence in the difficulty attributes based on the amount of passed objects.
    //The saved attributes are all calculated on the entire map, so using that for failed scores does not seem to work.
    //There might be somthing i'm missing...
    perf = score.passed
      ? new calc.Performance(performanceOptions).calculate(attributes)
      : new calc.Performance(performanceOptions).calculate(
        new calc.Beatmap(mapData.bytes),
      );

    performanceForScore.push({ perf, attributes });
  }

  try {
    await pushNewAttributes(newAttributes);
  } catch (e) {
    console.error("Error when updating attributes...", e);
    throw e;
  }
  return performanceForScore;
}

async function pushNewAttributes(newAttributes) {
  console.log("Updating attributes..");
  if (newAttributes.length > 0) {
    const { update, ColumnSet } = pgp.helpers;
    const columnTemplate = new ColumnSet([
      "?id",
      {
        name: "difficulty_attributes",
        cast: "jsonb",
      },
    ], { table: "maps" });

    try {
      await dbQuery(
        update(newAttributes, columnTemplate) + "WHERE v.id = t.id",
        db.none,
      );
    } catch (e) {
      throw e;
    }
  }
}

async function addNewMaps(scores, maps) {
  //TODO: use a set for downloaded maps instead of an array
  //First gather all maps from a set of scores O(n)
  //Then test !maps[score.beatmap.id] O(1)
  //Then download the missing beatmap (async O(n))
  console.log("Checking for missing beatmaps..");
  const newMaps = [];
  const downloaded = [];

  for (const score of scores) {
    if (!maps[score.beatmap.id] && !downloaded.includes(score.beatmap.id)) {
      let bytes;
      try {
        bytes = await downloadMissingBeatmap(score.beatmap.id);
      } catch (e) {
        console.log(e);
        continue;
      }

      downloaded.push(score.beatmap.id);

      const mapObject = new calc.Beatmap(bytes);
      const nm = new calc.Difficulty({ mods: "NM" }).calculate(mapObject);
      const cl = new calc.Difficulty({ mods: "CL" }).calculate(mapObject);

      newMaps.push({
        id: score.beatmap.id,
        bytes,
        difficulty_attributes: { nm, cl },
      });
      maps[score.beatmap.id] = { bytes, attributes: { nm, cl } };
    }
    continue;
  }

  if (!newMaps.length) {
    console.log("No missing maps!");
    return;
  }

  const columnTemplate = new pgp.helpers.ColumnSet([
    "id",
    "difficulty_attributes",
    "bytes",
  ], { table: "maps" });

  console.log("Adding maps...");
  try {
    result = await dbQuery(
      pgp.helpers.insert(newMaps, columnTemplate),
      db.none,
    );
  } catch (e) {
    console.log("Error in adding new maps to db...");
    throw e;
  }
}

async function downloadMissingBeatmap(id) {
  console.log(`Downloading ${id}...`);
  let res;
  try {
    res = await fetch(`https://osu.ppy.sh/osu/${id}`);
  } catch (e) {
    console.error(`Failed to download map ${id}...`, e);
    throw (err.FAIL_API);
  }

  let mapBytes = "";
  for await (const chunk of res.body) {
    const text = new TextDecoder().decode(chunk);
    mapBytes += text;
  }
  return mapBytes;
}

function parseMods(mods) {
  //TODO: I need to account for NC = DT here
  let modCombo = "";
  let modHasSettings = false;
  let lazer = true;
  for (const mod of mods) {
    if (mod.settings) {
      modHasSettings = true;
      break;
    }
    if (mod.acronym === "CL") {
      lazer = false;
    }
    modCombo += mod.acronym.toLowerCase();
  }
  return { modCombo, modHasSettings, lazer };
}

async function getMapsFromDatabase(scores) {
  if (scores.length === 0) {
    return;
  }

  const ids = scores.map((score) => score.beatmap.id);

  let query = "select * from maps where ";
  let part = "";

  scores.forEach((score, index) => {
    if (index === ids.length - 1) {
      part = `id = '${score.beatmap.id}'`;
    } else {
      part = `id = '${score.beatmap.id}' or `;
    }
    query += part;
  });

  let rows;
  try {
    rows = await dbQuery(query, db.query);
  } catch (e) {
    console.error("Error in fetching maps from db...");
    throw e;
  }

  const mapData = {};
  for (const row of rows) {
    mapData[`${row.id}`] = {
      bytes: row.bytes,
      attributes: row.difficulty_attributes,
    };
  }

  return mapData;
}

function getOrCalcAttributes(
  mapData,
  newAttributes,
  score,
  modCombo,
  modHasSettings,
) {
  let attributes = mapData.attributes[`${modCombo}`];
  let shouldSave = false;

  if (!attributes) {
    const beatmap = new calc.Beatmap(mapData.bytes);
    attributes = new calc.Difficulty({ mods: score.mods }).calculate(beatmap);
    beatmap.free();
    shouldSave = !modHasSettings;
  }
  if (shouldSave) {
    const attributesToInsert = mapData.attributes;
    attributesToInsert[`${modCombo}`] = attributes;
    newAttributes.push({
      id: score.beatmap.id.toString(),
      difficulty_attributes: attributesToInsert,
    });
  }
  return attributes;
}

module.exports = {
  calculatePerformanceForScores,
  getMapsFromDatabase,
};
