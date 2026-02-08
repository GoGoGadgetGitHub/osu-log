const pgp = require("pg-promise")();
const err = require("./errors.js");

const connection = {
  host: "localhost",
  port: 5432,
  database: process.env.PGNAME,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  max: 30,
};

const db = pgp(connection);

async function dbQuery(query, pgpFunction, args) {
  let result;
  try {
    result = await pgpFunction(query, args);
    return result;
  } catch (e) {
    console.error("Fail in db call:", e);
    throw err.FAIL_DB;
  }
}

module.exports = { pgp, db, dbQuery };
