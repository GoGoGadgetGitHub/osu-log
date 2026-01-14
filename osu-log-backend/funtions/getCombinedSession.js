const { getScoresForSession } = require("./getScoresForSession.js");

//TODO: something here is fetching a session twise in some instances (i have not noticed this more than once)
//
//TODO: add sperated session stats array to response
const scoreMap = {
  sr: (score) => {
    if (score.performance) return score.performance.attributes.stars;
    else return score.score.beatmap.difficulty_rating;
  },
  song: (score) => score.score.beatmapset.title,
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

async function getCombinedSession(osu_user_id, sessions, filter) {
  console.log(`Getting scores for sessions ${sessions}...`);

  let combined;

  //TODO: I need to stop doing this
  for (const s of sessions) {
    try {
      const session = await getScoresForSession(osu_user_id, s, filter);
      combined = mergeSession(session, combined);
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  const graphTypes = ["pp", "sr", "bpm", "speed", "aim", "acc", "pass"];
  const graphData = {};
  for (const type of graphTypes) {
    graphData[type] = combined.scores.map((score, index) => {
      return {
        x: index,
        y: scoreMap[type](score),
        meta: {
          name: scoreMap["song"](score),
          id: score.score.id,
          date: score.score.started_at,
        },
      };
    });
  }

  combined.meta["graphData"] = { ...graphData };
  return combined;
}

function mergeSession(session, combined) {
  if (!combined) {
    combined = JSON.parse(JSON.stringify(session));
    return combined;
  }

  combined.scores = [...combined.scores, ...session.scores];

  combined.meta.time.end = session.meta.time.end;
  combined.meta.id = `${combined.meta.id},${session.meta.id}`;

  const combinedStats = combined.meta.stats;
  const sessionStats = session.meta.stats;

  const totalCombined = combinedStats.plays;

  combinedStats.plays += sessionStats.plays;
  combinedStats.fails += sessionStats.fails;
  combinedStats.passes += sessionStats.passes;
  combinedStats.playtime += sessionStats.playtime;

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
  const body = req.body;

  console.log(body);

  const sessions = body.sessions;
  const filter = body.filter;

  if (!sessions) {
    console.log(`No sessions... sessions read ${sessions}`);
    res.status(500).send("NO_SESSIONS");
    return;
  }

  let combinedSession;
  try {
    combinedSession = await getCombinedSession(osu_user_id, sessions, filter);
  } catch (e) {
    res.status(500).send(e);
    return;
  }

  res.status(200).json(combinedSession);
}

module.exports = {
  getCombinedSession,
  getCombinedSessionEndPoint,
};
