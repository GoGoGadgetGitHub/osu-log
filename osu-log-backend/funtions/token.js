const { db, dbQuery } = require("../database.js");
const { axios } = require("axios");

async function getToken(res, req) {
  console.log("Checking database token...");

  let result;
  try {
    result = await dbQuery(
      "select * from token_cache where token_name like 'osu_public_token'",
      db.one,
    );
  } catch (e) {
    console.error("Error when trying to fetch token from db...");
    throw e;
  }

  const { token_string: token, expires_at } = result;

  if (Date.now() < expires_at) {
    console.log("Token is valid");
    return token;
  }

  console.log("Token is no longer valid, fetching a new one...");
  let expires_in, access_token;
  try {
    ({ expires_in, access_token } = await getNewToken());
  } catch (e) {
    throw e;
  }

  expires_at.setTime(Date.now() + (expires_in * 1000));

  console.log("Updating token...");
  try {
    await dbQuery(
      `UPDATE token_cache set token_string = '${access_token}', expires_at = '${expires_at.toISOString()}'`,
      db.none,
    );
  } catch (e) {
    console.error("Error when tryind to update osu! public token...");
    throw e;
  }
  console.log("Update Sucsessful!");

  return access_token;
}

async function getNewToken() {
  const response = await axios.post(`http://osu.ppy.sh/oauth/token`, {
    client_id: process.env.OSU_CLIENT_ID,
    client_secret: process.env.OSU_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "public",
  }, {
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

  console.log(response);
}
module.exports = getToken;
