const { db, pgp, dbQuery } = require("../database.js");
const api = require("../osuAPI.js");
const { calculatePerformanceForScores } = require("./calculator.js");
const { generateStats, insertOrUpdateStats } = require(
  "./stats.js",
);
const err = require("../errors.js");

const SESSION_GAP = 120;

async function getLatestScore(osu_user_id) {
  let latestScore;
  try {
    latestScore = await dbQuery(
      "select * from scores where osu_user_id = $(osu_user_id) order by set_at desc limit 1;",
      db.oneOrNone,
      { osu_user_id: osu_user_id.toString() },
    );
    console.log(`User had scores saved: ${!!latestScore}`);
    if (latestScore) {
      console.log(
        "Last score saved for this user is:",
        latestScore.score.beatmapset.title,
      );
      console.log("It was set at :", latestScore.set_at);
      console.log("The session id for this score is:", latestScore.session_id);
      return latestScore;
    } else {
      return;
    }
  } catch (e) {
    console.log(
      `Error when trying to fetch last score for user: ${osu_user_id}`,
    );
    throw e;
  }
}

async function addScores(osu_user_id, token) {
  console.log(`Adding scores for: ${osu_user_id}`);

  let plays;
  try {
    plays = await recentPlays(osu_user_id, token);
  } catch (e) {
    console.log(e);
    throw e;
  }

  let latestScore;
  try {
    latestScore = await getLatestScore(osu_user_id);
  } catch (e) {
    throw e;
  }

  let session_id = latestScore ? latestScore.session_id : 0;
  console.log(`Initial session id is set to ${session_id}`);

  let prevScore;
  const scoresToBeInserted = [];
  const sessionsChanged = [];
  for (let i = plays.length - 1; i >= 0; i--) {
    const score = plays[i];
    const { timeStampCurrent, timeStampPrev, timeStampLatest } = getTimeStamps(
      score,
      prevScore,
      latestScore,
    );

    if (latestScore && scoreExists(timeStampLatest, timeStampCurrent)) {
      continue;
    }

    const timeDiff = timeDiffrenceInMinutes(timeStampPrev, timeStampCurrent);

    // Log this scores as part of a new session
    if (timeDiff > SESSION_GAP) {
      console.log(
        `Starting new session, last session was ${session_id}, new session is ${Number(session_id) + 1
        }, time diffrence is ${timeDiff}`,
      );
      session_id = Number(session_id) + 1;
    }

    if (!sessionsChanged.includes(session_id)) {
      sessionsChanged.push(session_id);
    }

    scoresToBeInserted.push({
      osu_user_id,
      score,
      set_at: score.ended_at,
      session_id,
    });

    prevScore = score;
  }

  if (scoresToBeInserted.length === 0) {
    console.log("No new scores");
    throw (err.NO_NEW);
  }

  let performances;
  try {
    performances = await calculatePerformanceForScores(
      scoresToBeInserted.map((score) => score.score),
    );
  } catch (e) {
    throw e;
  }

  scoresToBeInserted.forEach((score, index) => {
    score["performance"] = performances[index];
    score.score.beatmap.bpm = calculateBpm(score.score);
    const { perc, length } = calculatePassedStats(score.score);
    score.score.passed_percentage = perc;
    score.score.passed_length = length;
  });

  try {
    await insertScores(scoresToBeInserted);
    for (session of sessionsChanged) {
      const stats = await generateStats(session, osu_user_id);
      await insertOrUpdateStats(stats, osu_user_id, session);
    }
  } catch (e) {
    throw e;
  }
}

async function addScoresEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  try {
    await addScores(osu_user_id);
  } catch (e) {
    console.log("Error, could not add scores...");
    res.status(500).json(e);
  }
  res.status(200);
}

async function insertScores(scoresToBeInserted) {
  console.log("Inserting new scores into db...");
  const columnTemplate = new pgp.helpers.ColumnSet([
    "osu_user_id",
    "score",
    "set_at",
    "session_id",
    "performance",
  ], { table: "scores" });

  try {
    await dbQuery(
      pgp.helpers.insert(scoresToBeInserted, columnTemplate),
      db.none,
    );
  } catch (e) {
    console.error("Error when trying to insert scores...");
    throw e;
  }
}

function timeDiffrenceInMinutes(timeStampPrev, timeStampCurrent) {
  const differenceMilli = timeStampCurrent - timeStampPrev;
  const differenceSeconds = differenceMilli / 1000;
  const differenceMinutes = differenceSeconds / 60;

  return Math.abs(Math.round(differenceMinutes));
}

function scoreExists(timeStampLatest, timeStampCurrent) {
  return timeStampCurrent.getTime() <= new Date(timeStampLatest).getTime();
}

function getTimeStamps(score, prevScore, latestScore) {
  const timeStampCurrent = new Date(score.ended_at);
  const timeStampLatest = latestScore
    ? new Date(latestScore.set_at)
    : timeStampCurrent;
  const timeStampPrev = prevScore
    ? new Date(prevScore.ended_at)
    : timeStampLatest;

  return { timeStampCurrent, timeStampPrev, timeStampLatest };
}

function calculateBpm(score) {
  const mods = score.mods;

  if (!mods.length || mods.length == 1 && mods[0].acronym === "CL") {
    return score.beatmap.bpm;
  }

  for (const mod of mods) {
    if (
      mod.settings && ["DT", "NC", "HT", "DC"].includes(mod.acronym)
    ) {
      return score.beatmap.bpm * mod.settings.speed_change;
    } else if (["DT", "NC"].includes(mod.acronym)) {
      return score.beatmap.bpm * 1.5;
    } else if (["HT", "DC"].includes(mod.acronym)) {
      return score.beatmap.bpm * 0.75;
    }
    return score.beatmap.bpm;
  }
}

function calculatePassedStats(score) {
  if (score.passed) {
    return { perc: 100, length: score.beatmap.hit_length };
  }

  const max_statistics = score.maximum_statistics;
  const statistics = score.statistics;
  const ignore = [
    "small_tick_miss",
    "small_tick_hit",
    "small_bonus",
    "large_bonus",
    "ignore_miss",
    "ignore_hit",
  ];

  let max_sum = 0;
  for (const [key, value] of Object.entries(max_statistics)) {
    if (ignore.includes(key)) continue;
    max_sum += value;
  }

  let sum = 0;
  for (const [key, value] of Object.entries(statistics)) {
    if (ignore.includes(key)) continue;
    sum += value;
  }

  console.log(score.beatmapset.title, sum / max_sum, score.passed);

  const perc = sum / max_sum;
  const total_length = score.beatmap.hit_length;
  const length = Math.floor(total_length * perc);

  return { perc: perc * 100, length };
}

async function recentPlays(osuUserID, token) {
  if (!token) {
    console.log("fetching token for recent plays");
    try {
      token = await require("./token.js")();
    } catch (e) {
      console.log(e.message);
      throw err.FAIL_API;
    }
  }

  let response;
  try {
    response = await api.get(`/users/${osuUserID}/scores/recent`, {
      params: {
        include_fails: "1",
        limit: "999",
      },
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.log(e.message);
    throw err.FAIL_API;
  }

  return response.data;
}

module.exports.addScores = addScores;
module.exports.addScoresEndpoint = addScoresEndpoint;
