const { db, dbQuery, pgp } = require("../database.js");

async function insertOrUpdateStats(stat, osu_user_id, sessionID) {
  console.log(`Inserting stats for session ${sessionID}`);

  const table = { table: "stats" };
  const ststsColumn = {
    name: "stat_obj",
    cast: "jsonb",
  };

  const updateColumnTemplate = new pgp.helpers.ColumnSet([ststsColumn], table);

  const insertColumnTemplate = new pgp.helpers.ColumnSet([
    "osu_user_id",
    "session_id",
    ststsColumn,
  ], table);

  const tableRow = {
    osu_user_id,
    session_id: sessionID,
    stat_obj: stat,
  };

  const set = pgp.helpers.sets({ stat_obj: stat }, updateColumnTemplate);
  const insert = pgp.helpers.insert(tableRow, insertColumnTemplate);

  const query = insert +
    " on conflict (osu_user_id, session_id) do update set " + set;

  try {
    await dbQuery(query, db.none);
  } catch (e) {
    console.error(
      `Error when inserting stats into db for session${sessionID}...`,
    );
    throw e;
  }
}

async function generateStats(sessionID, osu_user_id, where, params) {
  console.log(`Generating stats...`);

  if (!where) {
    where = "where session_id = $(sessionID) and osu_user_id = $(osu_user_id)";
    params = { sessionID, osu_user_id: osu_user_id.toString() };
  }

  let stats, gradeCounts;
  try {
    const query = `
    SELECT
      COUNT(*)                                   AS plays,
      AVG((performance->'perf'->>'pp')::numeric) AS avg_pp,
      MIN((performance->'perf'->>'pp')::numeric) AS min_pp,
      MAX((performance->'perf'->>'pp')::numeric) AS max_pp,

      AVG((performance->'attributes'->>'stars')::numeric) AS avg_sr,
      MIN((performance->'attributes'->>'stars')::numeric) AS min_sr,
      MAX((performance->'attributes'->>'stars')::numeric) AS max_sr,
      
      AVG((score->>'accuracy')::numeric) AS avg_acc,
      MIN((score->>'accuracy')::numeric) AS min_acc,
      MAX((score->>'accuracy')::numeric) AS max_acc,
      
      AVG((performance->'attributes'->>'greatHitWindow')::numeric) AS avg_od,
      MIN((performance->'attributes'->>'greatHitWindow')::numeric) AS min_od,
      MAX((performance->'attributes'->>'greatHitWindow')::numeric) AS max_od,
      

      AVG((performance->'attributes'->>'ar')::numeric) AS avg_ar,
      MIN((performance->'attributes'->>'ar')::numeric) AS min_ar,
      MAX((performance->'attributes'->>'ar')::numeric) AS max_ar,
      
      AVG((score->'beatmap'->>'bpm')::numeric) AS avg_bpm,	
      MIN((score->'beatmap'->>'bpm')::numeric) AS min_bpm,	
      MAX((score->'beatmap'->>'bpm')::numeric) AS max_bpm,	

      SUM((score->>'passed_length')::int) AS playtime,

      SUM(CASE WHEN score->>'passed' = 'false' THEN 1 ELSE 0 END) AS fails
    FROM scores `;

    stats = await dbQuery(`${query} ${where}`, db.one, params);

    gradeCounts = await countGrades(where, params);
  } catch (e) {
    throw e;
  }

  return { ...parseRawStats(stats), gradeCounts };
}

function parseRawStats(raw) {
  return {
    plays: Number(raw.plays),
    fails: Number(raw.fails),
    passes: Number(raw.plays) - Number(raw.fails),
    playtime: Number(raw.playtime),
    pp: {
      avg: Number(raw.avg_pp),
      min: Number(raw.min_pp),
      max: Number(raw.max_pp),
    },
    sr: {
      avg: Number(raw.avg_sr),
      min: Number(raw.min_sr),
      max: Number(raw.max_sr),
    },
    acc: {
      avg: Number(raw.avg_acc),
      min: Number(raw.min_acc),
      max: Number(raw.max_acc),
    },
    od: {
      avg: toOD(Number(raw.avg_od)),
      min: toOD(Number(raw.min_od)),
      max: toOD(Number(raw.max_od)),
    },
    ar: {
      avg: Number(raw.avg_ar),
      min: Number(raw.min_ar),
      max: Number(raw.max_ar),
    },
    bpm: {
      avg: Number(raw.avg_bpm),
      max: Number(raw.max_bpm),
      min: Number(raw.min_bpm),
    },
  };
}

function toOD(hitwindow) {
  return (hitwindow - 80) / -6;
}

async function countGrades(where, params) {
  let query = "select ";
  const ranks = ["S", "SH", "X", "XH", "A", "B", "C", "D"];

  for (const rank of ranks) {
    query +=
      `sum(case when score->>'rank' like '${rank}' and score->>'passed' like 'true' then 1 else 0 end) as ${rank}`;
    if (rank !== ranks[ranks.length - 1]) {
      query += ", ";
    }
  }

  query += " from scores ";

  console.log(pgp.as.format(`${query} ${where}`));

  let result;
  try {
    result = await dbQuery(`${query} ${where}`, db.one, params);
  } catch (e) {
    console.error("Error when counting grades for session...");
    throw e;
  }

  const gradeCounts = [];
  Object.keys(result).forEach((key) => {
    gradeCounts.push({ grade: key, count: Number(result[key]) });
  });
  return gradeCounts;
}

async function getStats(osu_user_id, sessions) {
  const query =
    `select stat_obj from stats where session_id = any($(sessions)) and osu_user_id = $(osu_user_id)`;

  sessions = sessions.map((session) => Number(session));
  let result;
  try {
    result = await dbQuery(query, db.many, { osu_user_id, sessions });
  } catch (e) {
    console.error(`Error getting stats for sessions ${sessions}`);
    throw e;
  }

  return combineStats(result);
}

function combineStats(statsArray) {
  const base = JSON.parse(JSON.stringify(statsArray[0].stat_obj));

  statsArray.forEach((stat, i) => {
    stat = stat.stat_obj;
    if (i === 0) return;
    for (const key of Object.keys(base)) {
      if (["od", "ar", "pp", "sr", "acc", "bpm"].includes(key)) {
        base[key].min = Math.min(base[key].min, stat[key].min);
        base[key].max = Math.max(base[key].max, stat[key].max);
        base[key].avg =
          ((base[key].avg * base.plays) + (stat[key].avg * stat.plays)) /
          (stat.plays + base.plays);
      }
    }

    base.plays += stat.plays;
    base.fails += stat.fails;
    base.passes += stat.passes;
    base.playtime += stat.playtime;

    for (let i = 0; i < base.gradeCounts.length; i++) {
      base.gradeCounts[i].count += stat.gradeCounts[i].count;
    }
  });

  return base;
}

module.exports = { generateStats, getStats, insertOrUpdateStats };
