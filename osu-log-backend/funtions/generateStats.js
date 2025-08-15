const { getScoresForSession } = require("./getScoresForSession.js");
const { db, dbQuery, pgp } = require("../database.js");

async function generateStatsForSessionEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const sessionID = Number(req.params.sessionID);
  await generateStatsForSession(sessionID, osu_user_id);
  res.status(200);
}

async function insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime) {
  const insertColumnTemplate = new pgp.helpers.ColumnSet([
    "osu_user_id",
    "session_id",
    "session_time",
    {
      name: "stat_obj",
      cast: "jsonb",
    },
  ], { table: "stats" });

  const updateColumnTemplate = new pgp.helpers.ColumnSet([
    {
      name: "stat_obj",
      cast: "jsonb",
    },
  ], { table: "stats" });

  const tableRow = {
    osu_user_id,
    session_id: sessionID,
    session_time: sessionTime,
    stat_obj: stat,
  };

  const set = pgp.helpers.sets({ stat_obj: stat }, updateColumnTemplate);
  const insert = pgp.helpers.insert(tableRow, insertColumnTemplate);
  const query = insert +
    " on conflict (osu_user_id, session_id) do update set " + set;
  return dbQuery(query, db.none);
}

async function generateStatsForSession(sessionID, osu_user_id) {
  console.log(`Generating stats for ${sessionID}...`);
  const session = await getScoresForSession(osu_user_id, sessionID);
  if (session === "FAIL-DB") {
    return session;
  }
  if (session === "NOSCORES") {
    console.log("Nothing to do here :)");
    return;
  }

  const options = {
    field: undefined,
    sessionID,
    osu_user_id,
  };

  const plays = session.scores.length;
  const passes = session.meta.passes;
  const fails = session.meta.fails;

  options.field = "performance->'perf'->>'pp'";
  const avgPP = await getAverage(options);
  const minMaxPP = await getMinMax(options);

  options.field = "performance->'attributes'->>'stars'";
  const avgSr = await getAverage(options);
  const minMaxSr = await getMinMax(options);

  options.field = "score->>'accuracy'";
  const avgAcc = await getAverage(options);
  const minMaxAcc = await getMinMax(options);

  const avgBpm = getAverageBpm(session);
  const minMaxBpm = getMinMaxBpm(session);

  if (avgSr === "FAIL-DB" || avgAcc === "FAIL-DB" || avgPP === "FAIL-DB") {
    return "FAIL-DB";
  }

  const stat = {
    fails,
    passes,
    plays,
    bpm: { avgBpm, ...minMaxBpm },
    sr: { avgSr, ...minMaxSr },
    pp: { avgPP, ...minMaxPP },
    acc: { avgAcc, ...minMaxAcc },
  };

  const sessionTime = session.meta.time.start;

  insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime);
}

async function getAverage({ field, sessionID, osu_user_id }) {
  const query =
    `select avg((${field})::numeric) from scores where osu_user_id like '$1' and session_id = $2;`;
  const result = await dbQuery(query, db.one, [sessionID, osu_user_id]);
  if (result == "FAIL_DB") {
    return result;
  }
  return result.avg;
}

async function getMinMax({ field, sessionID, osu_user_id }) {
  let query;

  const minQuery = `min((${field})::numeric)`;
  const maxQuery = `max((${field})::numeric)`;

  query =
    `select ${minQuery} from scores where osu_user_id like '$1' and session_id = $2;`;
  const min = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  if (min == "FAIL_DB") {
    return min;
  }

  query =
    `select ${maxQuery} from scores where osu_user_id like '$1' and session_id = $2;`;
  const max = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  if (max == "FAIL_DB") {
    return max;
  }

  console.log(min, max);

  return { min: min.min, max: max.max };
}

function getAverageBpm(session) {
  let sum = 0;
  for (const { score } of session.scores) {
    sum += score.beatmap.bpm;
  }
  return sum / session.scores.length;
}

function getMinMaxBpm(session) {
  let min = session.scores[0].score.beatmap.bpm;
  let max = session.scores[0].score.beatmap.bpm;
  for (const { score } of session.scores) {
    min = min > score.beatmap.bpm ? score.beatmap.bpm : min;
    max = max < score.beatmap.bpm ? score.beatmap.bpm : max;
  }
  return { min, max };
}

module.exports = { generateStatsForSession, generateStatsForSessionEndpoint };
