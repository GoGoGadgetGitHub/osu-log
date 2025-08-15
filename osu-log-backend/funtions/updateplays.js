const { db, pgp, dbQuery } = require("../database.js");
const api = require("../osuAPITemplate.js");
const { calculatePerformanceForScores } = require("./calculator.js");
const { generateStatsForSession } = require("./generateStats.js");

const SESSION_GAP = 120;

async function getLatestScore(osu_user_id) {
  let latestScore;
  try {
    latestScore = await db.oneOrNone(
      "select * from scores where osu_user_id like '$1' order by set_at desc limit 1;",
      [osu_user_id],
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
      `Unexpected error when trying to fetch last score for user: ${osu_user_id}`,
    );
    console.log(e);
    return "FAIL-DB";
  }
}

async function addScores(osu_user_id, token) {
  console.log(`Adding scores for: ${osu_user_id}`);

  const plays = await recentPlays(osu_user_id, token);
  if (!plays) {
    return "FAIL-API";
  }

  const latestScore = await getLatestScore(osu_user_id);
  if (latestScore === "FAIL-DB") {
    return latestScore;
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
      performance: undefined,
    });
    prevScore = score;
  }

  if (scoresToBeInserted.length === 0) {
    console.log("No new scores");
    return "NONEW";
  }

  const performances = await calculatePerformanceForScores(
    scoresToBeInserted.map((score) => score.score),
  );
  if (performances === "FAIL-DB") {
    return performances;
  }

  scoresToBeInserted.forEach((score, index) => {
    score.performance = performances[index];
    score.score.beatmap.bpm = calculateBpm(score.score);
  });

  let result = await insertScores(scoresToBeInserted);

  for (const session of sessionsChanged) {
    result = await generateStatsForSession(session, osu_user_id);
  }

  if (result !== "FAIL-DB") {
    return "SUCSESS";
  }
}

async function addScoresEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const update = await addScores(osu_user_id);

  if (!update || update.status !== "SUCSESS") {
    res.status(500).send(update ? update : "FAIL-UNKNOWN");
    return;
  }
  res.status(200).send(update);
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

  const result = await dbQuery(
    pgp.helpers.insert(scoresToBeInserted, columnTemplate),
    db.none,
  );
  if (result === "FAIL-DB") {
    return result;
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
  const speedUpMods = ["DT", "NC"];
  const slowDownMods = ["HT", "DC"];
  const mods = score.mods;
  if (!mods.length || mods.length == 1 && mods[0].acronym === "CL") {
    return score.beatmap.bpm;
  }

  for (const mod of mods) {
    if (
      mod.settings && [...speedUpMods, ...slowDownMods].includes(mod.acronym)
    ) {
      multiplier = mod.settings.speed_change;
      break;
    }

    if (speedUpMods.includes(mod.acronym)) {
      return score.beatmap.bpm * 1.5;
    } else if (slowDownMods.includes(mod.acronym)) {
      return score.beatmap.bpm * 0.75;
    } else {
      return score.beatmap.bpm;
    }
  }
}

//TODO: Stop using this it's not really usefull use axios
async function recentPlays(osuUserID, token) {
  if (!token) {
    console.log("fetching token for recent plays");
    token = await require("./token.js")();
  }

  const method = "GET";

  const url = new URL(
    `https://osu.ppy.sh/api/v2/users/${osuUserID}/scores/recent`,
  );

  const params = {
    "include_fails": "1",
    "limit": "999",
  };

  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
    "x-api-version": "20220705",
  };

  const response = await api({
    url,
    headers,
    errorString: "Recent Scores Fetch Failed.",
    method,
    params,
  });

  if (!response) {
    return;
  }

  return response;
}

module.exports.addScores = addScores;
module.exports.addScoresEndpoint = addScoresEndpoint;
