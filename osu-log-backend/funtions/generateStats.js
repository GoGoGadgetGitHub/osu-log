const { getScoresForSession } = require("./getScoresForSession.js");
const { db, dbQuery, pgp } = require("../database.js");

async function generateStatsForSessionEndpoint(req, res) {
  const osu_user_id = req.params.userID;
  const sessionID = Number(req.params.sessionID);
  await generateStatsForSession(sessionID, osu_user_id);
  res.status(200);
}

async function insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime) {
  console.log(`Inserting stats for session ${sessionID}`);

  const table = { table: "stats" };
  const ststsColumn = {
    name: "stat_obj",
    cast: "jsonb",
  };

  const updateColumnTemplate = new pgp.helpers.ColumnSet([ststsColumn], table);

  const insertColumnTemplate = new pgp.helpers.ColumnSet([
    "osu_user_id",
    "session_id",
    "session_time",
    ststsColumn,
  ], table);

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

  const result = await dbQuery(query, db.none);
  if (result === "FAIL-DB") {
    return result;
  }
}

async function generateStatsForSession(sessionID, osu_user_id) {
  console.log(`Generating stats for session ${sessionID}`);
  let numPlays = await dbQuery(
    "select count(*) from scores where osu_user_id like '$1' and session_id=$2",
    db.one,
    [osu_user_id, sessionID],
  );

  if (numPlays === "FAIL_DB") {
    return numPlays;
  }

  numPlays = Number(numPlays.count);

  if (numPlays.count === 0) {
    console.log("Nothing to do here :)");
    return;
  }

  const options = {
    field: undefined,
    sessionID,
    osu_user_id,
  };

  const plays = numPlays;

  options.field = "performance->'perf'->>'pp'";
  const avgPP = await getAverage(options);
  const minMaxPP = await getMinMax(options);

  options.field = "performance->'attributes'->>'stars'";
  const avgSr = await getAverage(options);
  const minMaxSr = await getMinMax(options);

  options.field = "score->>'accuracy'";
  const avgAcc = await getAverage(options);
  const minMaxAcc = await getMinMax(options);

  options.field = "score->'beatmap'->>'bpm'";
  const avgBpm = await getAverage(options);
  const minMaxBpm = await getMinMax(options);

  const gradeCounts = await countGrades({ sessionID, osu_user_id });

  //TODO: add the rest of the db results
  if (avgSr === "FAIL-DB" || avgAcc === "FAIL-DB" || avgPP === "FAIL-DB") {
    return "FAIL-DB";
  }

  const stat = {
    ...await getCountFailsAndPasses(sessionID, osu_user_id, numPlays),
    plays,
    bpm: { avg: avgBpm, ...minMaxBpm },
    sr: { avg: avgSr, ...minMaxSr },
    pp: { avg: avgPP, ...minMaxPP },
    acc: { avg: avgAcc, ...minMaxAcc },
    gradeCounts,
  };

  const sessionTime = await dbQuery(
    "select set_at from scores where osu_user_id like '$1' and session_id = $2 order by set_at desc limit 1",
    db.one,
    [osu_user_id, sessionID],
  );
  if (sessionTime === "FAIL-DB") {
    return sessionTime;
  }

  await insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime.set_at);
}

async function getAverage({ field, sessionID, osu_user_id }) {
  const query =
    `select avg((${field})::numeric) from scores where osu_user_id like '$1' and session_id = $2;`;
  const result = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  if (result == "FAIL_DB") {
    return result;
  }
  return Number(result.avg);
}

async function countGrades({ sessionID, osu_user_id }) {
  let query = "select ";
  const ranks = ["S", "SH", "X", "XH", "A", "B", "C", "D"];

  for (const rank of ranks) {
    query +=
      `sum(case when score->>'rank' like '${rank}' and score->>'passed' like 'true' then 1 else 0 end) as ${rank}`;
    if (rank !== ranks[ranks.length - 1]) {
      query += ", ";
    }
  }

  query += " from scores where osu_user_id like '$1' and session_id = $2;";

  const result = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  if (result == "FAIL_DB") {
    return result;
  }
  console.log(result);
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

  return { min: Number(min.min), max: Number(max.max) };
}

async function getCountFailsAndPasses(sessionID, osu_user_id, numberOfScores) {
  const query =
    "select count(*) from scores where (score ->> 'passed') = 'false' and session_id = $1 and osu_user_id like $2";
  const fails = await dbQuery(query, db.one, [sessionID, `${osu_user_id}`]);

  if (fails === "FAIL-DB") {
    console.log("Failed to get number of fails form db...");
    return { fails, passes: 0 };
  }

  return {
    fails: Number(fails.count),
    passes: numberOfScores - Number(fails.count),
  };
}

module.exports = { generateStatsForSession, generateStatsForSessionEndpoint };
