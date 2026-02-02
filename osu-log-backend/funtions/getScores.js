const { db, dbQuery } = require("../database.js");
const { NO_SCORES } = require("../errors.js");
const { generateStats, getStats } = require(
  "./stats.js",
);
const err = require("../errors.js");

const VALID_MODS = [
  "NM",
  "TD",
  "DT",
  "NC",
  "HD",
  "HR",
  "FL",
  "PF",
  "SD",
  "NF",
  "EZ",
  "HT",
  "SO",
  "AT",
  "RX",
  "AL",
  "AC",
  "AS",
  "AD",
  "BL",
  "MF",
  "NS",
  "SG",
  "ST",
  "WU",
  "DC",
  "DF",
  "WD",
  "BR",
  "BM",
  "BU",
  "DP",
  "DS",
  "FR",
  "GR",
  "MG",
  "MR",
  "MU",
  "RD",
  "RP",
  "SR",
  "SI",
  "SY",
  "TC",
  "WG",
  "CL",
  "DA",
  "TP",
  "TR",
];

async function getScoresAndStats(osu_user_id, filter) {
  console.log(`Getting Scores for ${filter.sessions}`);
  const { where, params } = buildWhereClause(filter, osu_user_id);

  let scores;
  try {
    scores = await getScores(
      "select score, performance, session_id from scores",
      where,
      params,
    );
  } catch (e) {
    throw e;
  }

  if (scores.length === 0) {
    console.log("throwing no scores");
    throw err.NO_SCORES;
  }

  //recalculate stats for a filtered call
  let stats;
  try {
    if (needStats(filter)) {
      console.log("Filter applied...");
      stats = await generateStats(
        sessionID = undefined,
        osu_user_id = undefined,
        where,
        params,
      );
    } else {
      console.log("No Filter");
      stats = await getStats(osu_user_id, filter.sessions);
    }
  } catch (e) {
    throw e;
  }

  const start = scores[0].score.ended_at;
  const end = scores[scores.length - 1].score.ended_at;
  const graphData = generateGraphData(scores);

  const ret = {
    scores,
    meta: {
      time: { start, end },
      id: filter.sessions,
      stats: {
        ...stats,
      },
      graphData,
    },
  };
  return ret;
}

function needStats(filter) {
  if (filter.ranks?.length > 0) return true;
  if (filter.fails === false) return true;
  if (filter.mods?.array?.length > 0) return true;

  Object.keys(filter).forEach((key) => {
    if (
      filter[key].min &&
      (filter[key].min !== 0 || filter[key].max !== 0)
    ) {
      return true;
    }
  });
}

function generateGraphData(scores) {
  const graphTypes = ["pp", "sr", "bpm", "speed", "aim", "acc", "pass"];
  const graphData = {};

  for (const type of graphTypes) {
    graphData[type] = scores.map((score, index) => {
      return {
        x: index,
        y: scoreMap[type](score),
        meta: {
          name: scoreMap["title"](score),
          id: score.score.id,
          date: score.score.started_at,
        },
      };
    });
  }

  return graphData;
}

const scoreMap = {
  sr: (score) => {
    if (score.performance) return score.performance.attributes.stars;
    else return score.score.beatmap.difficulty_rating;
  },
  pp: (score) => {
    if (score.score.pp) {
      return score.score.pp;
    }
    if (score.performance) {
      return score.performance.perf.pp;
    }
    return 0;
  },
  bpm: (score) => {
    return score.score.beatmap.bpm;
  },
  title: (score) => {
    return score.score.beatmapset.title;
  },
  speed: (score) => {
    return score.performance.attributes.speed;
  },
  aim: (score) => {
    return score.performance.attributes.aim;
  },
  acc: (score) => {
    return score.score.accuracy * 100;
  },
  pass: (score) => {
    return score.score.pass_percentage;
  },
};

async function getScores(query, where, params) {
  query += ` ${where} order by set_at`;

  let scores;
  try {
    scores = await dbQuery(query, db.manyOrNone, params);
  } catch (e) {
    console.log("Error while trying to fetch scores for session from db...");
    throw e;
  }

  return scores;
}

function buildWhereClause(filter, osu_user_id) {
  const {
    sessions,
    beatmapID,
    name,
    mods,
    acc,
    pp,
    stars,
    time,
    ranks,
    fails,
  } = filter;
  const conditions = [];
  const params = {};

  let where = "where osu_user_id = $(userID)";
  params.userID = osu_user_id;

  if (sessions?.length > 0) {
    conditions.push("session_id = any($(sessions))");
    params.sessions = sessions.map((session) => Number(session));
  }

  if (beatmapID) {
    conditions.push("score->'beatmap'->>'id' = $(beatmapID)");
    params.beatmapID = beatmapID;
  }

  if (name) {
    conditions.push("score->'beatmapset'->>'title' ILIKE $(nameSearch)");
    params.nameSearch = `%${name}%`;
  }

  if (mods?.array?.length > 0) {
    const safeMods = mods.array.filter((m) => VALID_MODS.includes(m));

    if (safeMods.includes("NM")) {
      conditions.push(
        `(jsonb_array_length(score->'mods') = 0 OR (jsonb_array_length(score->'mods') = 1 AND score->'mods'->0->>'acronym' = 'CL'))`,
      );
    } else {
      conditions.push("score->'mods' @> $(modJson)::jsonb");
      params.modJson = JSON.stringify(safeMods.map((m) => ({ acronym: m })));

      if (mods.exclusive) {
        conditions.push("jsonb_array_length(score->'mods') = $(modCount)");
        params.modCount = safeMods.length;
      }
    }
  }

  const addRange = (field, min, max, key) => {
    if (min !== undefined && min !== 0) {
      conditions.push(`(${field})::float >= $(${key}Min)`);
      params[`${key}Min`] = min;
    }
    if (max !== undefined && max !== 0) {
      conditions.push(`(${field})::float <= $(${key}Max)`);
      params[`${key}Max`] = max;
    }
  };

  if (acc) addRange("score->>'accuracy'", acc.min / 100, acc.max / 100, "acc");
  if (pp) addRange("performance->'perf'->>'pp'", pp.min, pp.max, "pp");
  if (stars) {
    addRange(
      "performance->'attributes'->>'stars'",
      stars.min,
      stars.max,
      "stars",
    );
  }
  if (time) {
    addRange("score->'beatmap'->>'total_length'", time.min, time.max, "time");
  }

  if (ranks?.length > 0) {
    conditions.push("score->>'rank' = any($(ranks))");
    params.ranks = ranks;
  }

  if (fails === false) {
    conditions.push("(score->>'passed')::boolean = true");
  }

  where = conditions.length > 0
    ? `${where} and ${conditions.join(" and ")} `
    : where;

  return { where, params };
}

async function getScoresEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const body = req.body;

  console.log(osu_user_id, body);

  const filter = body.filter;

  if (filter.sessions.length === 0) {
    console.log(`No sessions... ${filter.sessions}`);
    res.status(200).send("NO_SESSIONS");
    return;
  }

  let scores;
  try {
    scores = await getScoresAndStats(osu_user_id, filter);
  } catch (e) {
    if (e === NO_SCORES) res.status(200).json({});
    else {
      console.log(e);
      res.status(500).send(e);
    }
    return;
  }

  res.status(200).json(scores);
}

module.exports = {
  getScoresEndpoint,
  getScores,
};
