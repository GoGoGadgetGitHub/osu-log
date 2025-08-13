const api = require("../osuAPITemplate.js");
const pg = require("pg");
const db = require("../database.js");

async function getToken(res, req) {

  const client = new pg.Client({ database: "TestDatabase" });
  await client.connect()

  console.log("Checking database token")

  let tokenQuery;
  try {
    tokenQuery = await client.query("select * from token_cache where token_name like 'osu_public_token'");
  }
  catch (e) {
    console.error(e)
    return null
  }

  let expiresAt = new Date(tokenQuery.rows[0].expires_at);
  const token = tokenQuery.rows[0].token_string;

  if (Date.now() < expiresAt) {
    console.log("Token is valid");
    return token;
  }

  console.log("Token is no longer valid, fetching a new one...");
  const newToken = await getNewToken();

  if (newToken === null) {
    return null;
  }

  expiresAt.setTime(Date.now() + (newToken.expires_in * 1000))

  console.log("Updating token...");
  try {
    const tokenUpsert = await client.query(`UPDATE token_cache set token_string = '${newToken.access_token}', expires_at = '${expiresAt.toISOString()}'`)

  } catch (e) {
    console.error(e)
    return null
  }
  console.log("Update Sucsessful!")

  return newToken.access_token;
}


async function getNewToken() {
  const url = "http://osu.ppy.sh/oauth/token";

  const headers = {
    "Accept": "application/json",
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const method = "POST";

  const body = new URLSearchParams({
    client_id: process.env.OSU_CLIENT_ID,
    client_secret: process.env.OSU_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "public",
  });

  const response = await api({
    url,
    headers,
    errorString: "Token Fetch Failed.",
    method,
    body: body,
  });

  if (!response)
    return

  return response;
}
module.exports = getToken;
