const { db, dbQuery } = require("../database.js");
const { getSessionStats } = require("./generateStats.js");
const err = require("../errors.js");

async function getScoresForSession(osu_user_id, sessionID) {
  console.log(`Getting Scores for session ${sessionID}`);

  if (sessionID === "latest") {
    try {
      sessionID = await getLatestSessionID(osu_user_id) ?? 0;
    } catch (e) {
      throw e;
    }
  }

  let scores;
  try {
    scores = await getSession(sessionID, osu_user_id);
  } catch (e) {
    throw e;
  }

  if ((sessionID === 0 && scores.length === 0) || scores.length === 0) {
    throw err.NO_SCORES;
  }

  const start = scores[0].score.ended_at;
  const end = scores[scores.length - 1].score.ended_at;

  const difference = new Date(end) - new Date(start);
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference / (1000 * 60)) % 60);
  const duration = `${hours} hours ${minutes} minutes`;

  let sessionStats;
  try {
    sessionStats = await getSessionStats(osu_user_id, sessionID);
  } catch (e) {
    throw e;
  }

  const session = {
    scores,
    meta: {
      time: { start, end, duration },
      id: sessionID,
      stats: {
        ...sessionStats,
      },
    },
  };
  return session;
}

async function getScoresForSessionEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const sessionID = req.params.sessionID;

  let sessionScores;
  try {
    sessionScores = await getScoresForSession(osu_user_id, sessionID);
  } catch (e) {
    res.status(500).json(e);
    return;
  }

  res.status(200).json(sessionScores);
}

async function getSession(sessionID, osu_user_id) {
  const query =
    "select score, performance, session_id from scores where session_id = $1 and osu_user_id like $2 order by set_at";
  let scores;
  try {
    scores = await dbQuery(query, db.manyOrNone, [
      sessionID,
      `${osu_user_id}`,
    ]);
  } catch (e) {
    console.log("Error while trying to fetch scores for session from db...");
    throw e;
  }

  return scores;
}

async function getLatestSessionID(osu_user_id) {
  const query =
    "select session_id from scores where osu_user_id like $1 order by set_at desc limit 1";
  let sessionID;
  try {
    sessionID = await dbQuery(query, db.oneOrNone, [`${osu_user_id}`]);
  } catch (e) {
    console.error("Error while trying to get the latest session id...");
    throw e;
  }
  return sessionID ? Number(sessionID.session_id) : 0;
}

module.exports = {
  getScoresForSessionEndpoint,
  getScoresForSession,
};
