const { db, pgp, dbQuery } = require("../database.js");

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

async function getSessions(osu_user_id) {
  console.log(`Getting sessions meta data for user ${osu_user_id}`);
  let sessions;
  try {
    sessions = await dbQuery(
      "select distinct on (session_id) session_id, set_at from scores where osu_user_id like $1",
      db.manyOrNone,
      [osu_user_id],
    );
  } catch (e) {
    throw e;
  }

  let counts;
  try {
    counts = await getPlayCountPerSession(osu_user_id);
  } catch (e) {
    throw e;
  }

  sessions.map((session, index) => {
    session["plays"] = counts[index].plays;
    session.set_at = dateFormatter.format(session.set_at);
  });

  //group sessions by day
  const result = {};
  for (const session of sessions) {
    if (!result[session.set_at]) {
      result[session.set_at] = {
        sessions: [],
        active: false,
      };
    }
    result[session.set_at].sessions.push({
      session_id: session.session_id,
      plays: session.plays,
      active: false,
    });
  }

  return result;
}

async function getPlayCountPerSession(osu_user_id) {
  const query =
    "select session_id, stat_obj->'plays' as plays from stats where osu_user_id like $1;";

  let result;
  try {
    result = await dbQuery(query, db.manyOrNone, [osu_user_id]);
  } catch (e) {
    console.error("Error when fetching play count for sessions...");
    throw e;
  }

  result.map((session) => {
    delete session.session_id;
  });

  return result;
}

async function getSessionsEndpoint(req, res) {
  const osu_user_id = req.params.userID;

  try {
    const sessions = await getSessions(osu_user_id);
    res.status(200).send(sessions);
  } catch (e) {
    res.status(500).send(e);
    throw e;
  }
}

module.exports = { getSessions, getSessionsEndpoint };
