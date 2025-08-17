const api = require("../osuAPITemplate.js");

async function getUserDataEndpoint(req, res) {
  const username = req.params.username;

  const userData = await userAPI(username);
  if (!userData) {
    res.status(500).send("FAIL-API");
    return;
  }

  res.status(200).json(userData);
}

async function getUserData(username, token) {
  console.log(`Getting userdata for ${username}...`);
  if (!token) {
    console.log("fetching token for user data");
    try {
      token = await require("./token.js")();
    } catch (e) {
      console.log("Error when trying to fetch osu! public token...");
      throw e;
    }
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

  const userDataResponse = await api({
    url,
    method,
    headers,
    errorString: "Get userdata error",
    params,
  });

  if (!userDataResponse) {
    return "FAIL-API";
  }

  return userDataResponse;
}

module.exports.userData = getUserData;
module.exports.userDataEndpoint = getUserDataEndpoint;
