const { getScoresForSession } = require("./getScoresForSession.js");

async function getCombinedSession(osu_user_id, sessions) {
  console.log(`Getting scores for sessions ${sessions}...`);

  //sort sessions decending (i can't remember why i wanted this)

  let combined;

  //I'm gonna keep doing this for now, it reuses code i already wrote
  //I could maybe gain some performanc by combining this into a single db query
  for (const s of sessions) {
    try {
      const session = await getScoresForSession(osu_user_id, s);
      combined = mergeSession(session, combined);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }
  return combined;
}

function mergeSession(session, combined) {
  if (!combined) {
    combined = JSON.parse(JSON.stringify(session));
    return combined;
  }

  const combinedStats = combined.meta.stats;
  const sessionStats = session.meta.stats;

  combined.scores = [...combined.scores, ...session.scores];
  combined.meta.time.end = session.meta.time.end;

  const difference = new Date(combined.meta.time.end) -
    new Date(combined.meta.time.start);
  const hours = Math.floor(difference / (1000 * 60 * 60));
  const minutes = Math.floor((difference / (1000 * 60)) % 60);

  combined.duration = `${hours} hours ${minutes} minutes`;

  combined.meta.id = `${combined.meta.id},${session.meta.id}`;

  const totalCombined = combinedStats.plays;

  combinedStats.plays += sessionStats.plays;
  combinedStats.fails += sessionStats.fails;
  combinedStats.passes += sessionStats.passes;

  for (const key of Object.keys(combinedStats)) {
    if (["od", "ar", "pp", "sr", "acc", "bpm"].includes(key)) {
      const keyCombStat = combinedStats[key];
      const keySesStat = sessionStats[key];
      keyCombStat.min = Math.min(keyCombStat.min, keySesStat.min);
      keyCombStat.max = Math.max(keyCombStat.max, keySesStat.max);
      keyCombStat.avg = ((keyCombStat.avg * totalCombined) +
        (keySesStat.avg * sessionStats.plays)) /
        (sessionStats.plays + totalCombined);
    }

    if (key === "gradeCounts") {
      combinedStats.gradeCounts.forEach((gradeCount, index) => {
        gradeCount.count += gradeCount.count +
          sessionStats.gradeCounts[index].count;
      });
    }
  }

  return combined;
}

async function getCombinedSessionEndPoint(req, res) {
  const osu_user_id = req.params.userID;
  const sessions = req.query.sessionID;

  if (!sessions) {
    console.log(`No sessions... sessions read ${sessions}`);
    res.status(500).send("NO_SESSIONS");
    return;
  }

  let combinedSession;
  try {
    combinedSession = await getCombinedSession(osu_user_id, sessions);
  } catch (e) {
    res.status(500).send(e);
    throw e;
  }

  res.status(200).json(combinedSession);
}

module.exports = {
  getCombinedSession,
  getCombinedSessionEndPoint,
};
