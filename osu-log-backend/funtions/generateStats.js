const { getScoresForSession } = require("./getScoresForSession.js");
const { db, dbQuery, pgp } = require("../database.js");
//end point will need:
//osu user id
//session id

//TODO: stats i want to include for now:
//Average aim difficulty
//Average speed difficulty
//
//NOTE: stats that use the performance object will take a while to calculate
//I want to use queries to generate the stats i think, using js could be slow
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

  const numberOfPlays = session.scores.length;
  const numberOfPasses = session.meta.passes;
  const numberOfFails = session.meta.fails;

  const avgPP = await getAverage(
    "performance->'perf'->>'pp'",
    sessionID,
    osu_user_id,
  );

  const avgSr = await getAverage(
    "performance->'attributes'->>'stars'",
    sessionID,
    osu_user_id,
  );

  const avgBpm = getAverageBpm(session);

  const avgAcc = await getAverage(
    "score->>'accuracy'",
    sessionID,
    osu_user_id,
  );

  if (avgSr === "FAIL-DB" || avgAcc === "FAIL-DB" || avgPP === "FAIL-DB") {
    return "FAIL-DB";
  }

  const stat = {
    numberOfFails,
    numberOfPasses,
    numberOfPlays,
    avgBpm,
    avgSr,
    avgPP,
    avgAcc,
  };

  const sessionTime = session.meta.time.start;

  insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime);
}

async function getAverage(field, osu_user_id, sessionID) {
  const query =
    `select avg((${field})::numeric) from scores where osu_user_id like '$2' and session_id = $3;`;
  const result = await dbQuery(query, db.one, [field, sessionID, osu_user_id]);
  return result.avg;
}

function getAverageBpm(session) {
  let sum = 0;
  for (const { score } of session.scores) {
    sum += score.beatmap.bpm;
  }
  return sum / session.scores.length;
}

module.exports = { generateStatsForSession, generateStatsForSessionEndpoint };
