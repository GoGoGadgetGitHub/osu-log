const { db, dbQuery, pgp } = require("../database.js");
const { getSessionStats } = require("./generateStats.js");
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

async function getScoresForSession(osu_user_id, sessionID, filter) {
  console.log(`Getting Scores for session ${sessionID}`);

  let scores;
  try {
    scores = await getSession(sessionID, osu_user_id, filter);
  } catch (e) {
    throw e;
  }

  if ((sessionID === 0 && scores.length === 0) || scores.length === 0) {
    throw err.NO_SCORES;
  }

  const start = scores[0].score.ended_at;
  const end = scores[scores.length - 1].score.ended_at;

  let sessionStats;
  try {
    sessionStats = await getSessionStats(osu_user_id, sessionID);
  } catch (e) {
    throw e;
  }

  const session = {
    scores,
    meta: {
      time: { start, end },
      id: sessionID,
      stats: {
        ...sessionStats,
      },
    },
  };
  return session;
}

async function getSession(sessionID, osu_user_id, filter) {
  const baseQuery =
    "select score, performance, session_id from scores where session_id = $(sessionID) and osu_user_id like $(osuUserID) ";
  let { query, params } = applyFilter(baseQuery, filter);
  params.sessionID = sessionID;
  params.osuUserID = osu_user_id;

  query += "order by set_at";

  console.log(pgp.as.format(query, params));

  let scores;
  try {
    scores = await dbQuery(query, db.manyOrNone, params);
  } catch (e) {
    console.log("Error while trying to fetch scores for session from db...");
    throw e;
  }

  return scores;
}

function applyFilter(baseQuery, filter) {
  const { beatmapID, name, mods, acc, pp, stars, time, ranks, fails } = filter;
  const conditions = [];
  const params = {};

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

  addRange("score->>'accuracy'", acc.min / 100, acc.max / 100, "acc");
  addRange("performance->'perf'->>'pp'", pp.min, pp.max, "pp");
  addRange(
    "performance->'attributes'->>'stars'",
    stars.min,
    stars.max,
    "stars",
  );
  addRange("score->'beatmap'->>'total_length'", time.min, time.max, "pp");

  if (ranks?.length > 0) {
    conditions.push("score->>'rank' = any($(ranks))");
    params.ranks = ranks;
  }

  if (fails === false) {
    conditions.push("(score->>'passed')::boolean = true");
  }

  finalQuery = conditions.length > 0
    ? `${baseQuery} and ${conditions.join(" and ")} `
    : baseQuery;

  return { query: finalQuery, params };
}

module.exports = {
  getScoresForSession,
};
