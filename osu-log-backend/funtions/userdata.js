const api = require("../osuAPITemplate.js");
const pg = require("pg");
const client = new pg.Client({ database: "TestDatabase" });

async function getUserDataEndpoint(req, res) {
  const username = req.params.username;
  if (!username) {
    console.log("No username spesified");
    res.status(500).send('FAIL-NO-USERNAME');
    return
  }

  const userData = await userAPI(username);

  if (!userData) {
    res.status(500).send('FAIL-API')
    return
  }

  res.status(200).json(userData)
}

async function getUserData(username, token) {

  if (!token) {
    console.log("fetching token for user data");
    const token = await require("./token.js")();
  }

  const url = new URL(`https://osu.ppy.sh/api/v2/users/${username}`);
  const params = {
    "key": username,
  };
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Authorization": `Bearer ${token}`,
  };
  const method = "GET";

  const userDataResponse = await api({ url, method, headers, errorString: "Get userdata error", params });

  if (!userDataResponse) {
    return "FAIL-API";
  }

  return userDataResponse
}


module.exports.userData = getUserData
module.exports.userDataEndpoint = getUserDataEndpoint
