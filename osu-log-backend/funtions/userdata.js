const err = require("../errors.js");
const api = require("../osuAPI.js");

async function getUserDataEndpoint(req, res) {
  const username = req.params.username;

  let userData;
  try {
    userData = await getUserData(username);
  } catch (e) {
    console.log(e);
    res.status(500).send("FAIL-API");
    throw e;
  } finally {
    res.status(200).json(userData);
  }
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

  let response;
  try {
    response = await api.get(`/users/${username}`, {
      params: {
        key: username,
      },
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
  } catch (e) {
    console.log("From osu: ", e.message);
    throw err.FAIL_API;
  }

  return response.data;
}

module.exports.userData = getUserData;
module.exports.userDataEndpoint = getUserDataEndpoint;
