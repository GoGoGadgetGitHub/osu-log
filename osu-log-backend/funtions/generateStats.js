const { db, dbQuery, pgp } = require("../database.js");

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

  try {
    await dbQuery(query, db.none);
  } catch (e) {
    console.error(
      `Error when inserting stats into db for session${sessionID}...`,
    );
    throw e;
  }
}

async function generateStatsForSession(sessionID, osu_user_id) {
  console.log(`Generating stats for session ${sessionID}`);

  let numPlays;
  try {
    numPlays = await dbQuery(
      "select count(*) from scores where osu_user_id like '$1' and session_id=$2",
      db.one,
      [osu_user_id, sessionID],
    );
  } catch (e) {
    console.error("Error while trying to count the number of plays...");
    throw e;
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

  let avgPP,
    minMaxPP,
    avgSr,
    minMaxSr,
    avgAcc,
    minMaxAcc,
    avgBpm,
    minMaxBpm,
    gradeCounts,
    failsPasses,
    sessionTime;
  try {
    options.field = "performance->'perf'->>'pp'";
    avgPP = await getAverage(options);
    minMaxPP = await getMinMax(options);

    options.field = "performance->'attributes'->>'stars'";
    avgSr = await getAverage(options);
    minMaxSr = await getMinMax(options);

    options.field = "score->>'accuracy'";
    avgAcc = await getAverage(options);
    minMaxAcc = await getMinMax(options);

    options.field = "score->'beatmap'->>'bpm'";
    avgBpm = await getAverage(options);
    minMaxBpm = await getMinMax(options);

    gradeCounts = await countGrades({ sessionID, osu_user_id });
    failsPasses = await getCountFailsAndPasses(
      sessionID,
      osu_user_id,
      numPlays,
    );
    sessionTime = await dbQuery(
      "select set_at from scores where osu_user_id like '$1' and session_id = $2 order by set_at desc limit 1",
      db.one,
      [osu_user_id, sessionID],
    );
  } catch (e) {
    throw e;
  }

  const stat = {
    ...failsPasses,
    plays,
    bpm: { avg: avgBpm, ...minMaxBpm },
    sr: { avg: avgSr, ...minMaxSr },
    pp: { avg: avgPP, ...minMaxPP },
    acc: { avg: avgAcc, ...minMaxAcc },
    gradeCounts,
  };

  try {
    await insertOrUpdateStats(stat, osu_user_id, sessionID, sessionTime.set_at);
  } catch (e) {
    throw e;
  }
}

async function getAverage({ field, sessionID, osu_user_id }) {
  const query =
    `select avg((${field})::numeric) from scores where osu_user_id like '$1' and session_id = $2;`;
  let result;
  try {
    result = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  } catch (e) {
    console.error(`Error while getting average for ${field}`);
    throw e;
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

  let result;
  try {
    result = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  } catch (e) {
    console.error("Error when counting grades for session...");
    throw e;
  }
  return result;
}

async function getMinMax({ field, sessionID, osu_user_id }) {
  let query;

  const minQuery = `min((${field})::numeric)`;
  const maxQuery = `max((${field})::numeric)`;
  const from = "from scores where osu_user_id like '$1' and session_id = $2";

  let min, max;
  try {
    query = `select ${minQuery} ${from}`;
    min = await dbQuery(query, db.one, [osu_user_id, sessionID]);
    query = `select ${maxQuery} ${from}`;
    max = await dbQuery(query, db.one, [osu_user_id, sessionID]);
  } catch (e) {
    console.error(`Error when trying to get min and max for ${field}...`);
    throw e;
  }
  return { min: Number(min.min), max: Number(max.max) };
}

async function getCountFailsAndPasses(sessionID, osu_user_id, numberOfScores) {
  const query =
    "select count(*) from scores where (score ->> 'passed') = 'false' and session_id = $1 and osu_user_id like $2";

  let fails;
  try {
    fails = await dbQuery(query, db.one, [sessionID, `${osu_user_id}`]);
  } catch (e) {
    console.error("Error while trying to count fails and passes...");
    throw e;
  }

  return {
    fails: Number(fails.count),
    passes: numberOfScores - Number(fails.count),
  };
}

async function getSessionStats(osu_user_id, sessionID) {
  const query =
    "select stat_obj from stats where osu_user_id like $1 and session_id = $2";
  let result;
  try {
    result = await dbQuery(query, db.one, [
      osu_user_id.toString(),
      sessionID,
    ]);
  } catch (e) {
    console.error(`Error getting stats for session ${sessionID}`);
    throw e;
  }
  return { ...result.stat_obj };
}

module.exports = { generateStatsForSession, getSessionStats };
