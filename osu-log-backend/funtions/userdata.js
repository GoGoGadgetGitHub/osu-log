const err = require("../errors.js");
const api = require("../osuAPI.js");

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
    console.log(e.message);
    throw err.FAIL_API;
  }

  return response.data;
}

module.exports.userData = getUserData;
module.exports.userDataEndpoint = getUserDataEndpoint;
