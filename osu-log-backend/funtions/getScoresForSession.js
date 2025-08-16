const { db, dbQuery } = require("../database.js");

async function getScoresForSession(osu_user_id, sessionID) {
  console.log(`Getting Scores for session ${sessionID}`);

  if (sessionID === "latest") {
    sessionID = await getLatestSessionID(osu_user_id) ?? 0;
  }

  const scores = await getSession(sessionID, osu_user_id);
  if (scores === "FAIL-DB") {
    return scores;
  }

  if (sessionID === 0 && scores.length === 0) {
    return "NOSCORES";
  } else if (scores.length === 0) {
    return "NOSCORES";
  }

  const start = scores[0].score.ended_at;
  const end = scores[scores.length - 1].score.ended_at;

  const diffrence = new Date(new Date(end) - new Date(start));
  const duration =
    `${diffrence.getHours()} hours ${diffrence.getMinutes()} minutes`;

  const session = {
    scores,
    meta: {
      time: { start, end, duration },
      id: sessionID,
      stats: {
        ...await getSessionStats(osu_user_id, sessionID),
      },
    },
  };
  return session;
}

async function getSessionStats(osu_user_id, sessionID) {
  const query =
    "select stat_obj from stats where osu_user_id like $1 and session_id = $2";
  const result = await dbQuery(query, db.one, [
    osu_user_id.toString(),
    sessionID,
  ]);
  return { ...result.stat_obj };
}

async function getScoresForSessionEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const sessionID = req.params.sessionID;

  if (!osu_user_id || !sessionID) {
    console.log(`Osu user ID: ${!!osu_user_id}, Session ID:${!!sessionID}`);
    res.status(500).send("FAIL-SESSION-SCORES");
    return;
  }

  const sessionScores = await getScoresForSession(osu_user_id, sessionID);

  if (!sessionScores) {
    res.status(500).send("FAIL-SESSION-SCORES");
  }

  res.status(200).json(sessionScores);
}

async function getSession(sessionID, osu_user_id) {
  const query =
    "select score, performance, session_id from scores where session_id = $1 and osu_user_id like $2 order by set_at";
  const scores = await dbQuery(query, db.manyOrNone, [
    sessionID,
    `${osu_user_id}`,
  ]);

  if (scores === "FAIL-DB") {
    console.log("Failed to get session from db...");
  }

  return scores;
}

async function getLatestSessionID(osu_user_id) {
  const query =
    "select session_id from scores where osu_user_id like $1 order by set_at desc limit 1";
  const sessionID = await dbQuery(query, db.one, [`${osu_user_id}`]);

  if (sessionID === "FAIL-DB") {
    console.log("Failed to get latest session ID from db...");
  }

  return Number(sessionID.session_id);
}

module.exports = {
  getScoresForSessionEndpoint,
  getScoresForSession,
};
