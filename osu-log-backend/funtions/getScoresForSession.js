const { db, dbQuery } = require("../database.js");
const { getSessionStats } = require("./generateStats.js");
const err = require("../errors.js");

async function getScoresForSession(osu_user_id, sessionID, filter) {
  console.log(`Getting Scores for session ${sessionID}`);

  let scores;
  try {
    scores = await getSession(sessionID, osu_user_id, filter);
  } catch (e) {
    throw e;
  }

  if ((sessionID === 0 && scores.length === 0) || scores.length === 0) {
    throw err.NO_SCORES;
  }

  const start = scores[0].score.ended_at;
  const end = scores[scores.length - 1].score.ended_at;

  let sessionStats;
  try {
    sessionStats = await getSessionStats(osu_user_id, sessionID);
  } catch (e) {
    throw e;
  }

  const session = {
    scores,
    meta: {
      time: { start, end },
      id: sessionID,
      stats: {
        ...sessionStats,
      },
    },
  };
  return session;
}

async function getSession(sessionID, osu_user_id, filter) {
  let query =
    "select score, performance, session_id from scores where session_id = $1 and osu_user_id like $2 ";
  query = applyFilter(query, filter);
  query += "order by set_at";

  const { beatmapID, name, mods, acc, pp, ranks } = filter;

  const add = (value, isArray = false) => {
    return isArray ? value ? [...value] : [] : value ? [value] : [];
  };

  const params = [
    sessionID,
    `${osu_user_id}`,
    ...add(beatmapID),
    ...add(name),
    ...add(mods?.array, true),
    ...add(acc?.value),
    ...add(pp?.value),
    ...add(ranks),
  ];

  let scores;
  try {
    scores = await dbQuery(query, db.manyOrNone, params);
  } catch (e) {
    console.log("Error while trying to fetch scores for session from db...");
    throw e;
  }

  return scores;
}

function applyFilter(query, filter) {
  const { beatmapID, name, mods, acc, pp, ranks, fails } = filter;

  let filterIndex = 3;

  if (beatmapID) {
    query += `and score->'beatmap'->>'id' like '$${filterIndex}' `;
    filterIndex++;
  }

  if (name) {
    query += `and score->'beatmapset'->>'title' like '%$${filterIndex}:raw%' `;
    filterIndex++;
  }

  if (mods?.array.length > 0) {
    if (mods.array[0] === "NM") {
      query +=
        `and (jsonb_array_length(score->'mods') = 0 or (jsonb_array_length(score->'mods') = 1 and score->'mods'->0->>'acronym' like 'CL')) `;
    } else {
      query += "and score->'mods' @@ '";
      mods.array.forEach((_, i) => {
        if (i === mods.array.length - 1) {
          query += `exists($[*] ? (@.acronym == "$${filterIndex}:raw"))' `;
        } else {
          query += `exists($[*] ? (@.acronym == "$${filterIndex}:raw")) && `;
        }
        filterIndex++;
      });

      if (mods.exclusive) {
        query +=
          `and jsonb_array_length(score->'mods') = ${mods.array.length} `;
      }
    }
  }

  if (acc?.value) {
    query = numericFilter(
      acc.opperator,
      "and (score->>'accuracy')::float",
      query,
      filterIndex,
    );
    filterIndex++;
  }

  if (pp?.value) {
    query = numericFilter(
      pp.opperator,
      "and (performance->'perf'->>'pp')::float",
      query,
      filterIndex,
    );
    filterIndex++;
  }

  if (ranks?.length > 0) {
    query += `and array_position($${filterIndex}, score->>'rank') is not null `;
  }

  if (fails === false) {
    query += `and (score->>'passed')::boolean `;
  }

  return query;
}

function numericFilter(opperator, expression, query, filterIndex) {
  switch (opperator) {
    case ">":
      query += `${expression} >= $${filterIndex} `;
      break;
    case "<":
      query += `${expression} <= $${filterIndex} `;
      break;
    case "=":
      query += `${expression} = $${filterIndex} `;
      break;
  }

  return query;
}

module.exports = {
  getScoresForSession,
};
