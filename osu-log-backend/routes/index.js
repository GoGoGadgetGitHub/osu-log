const express = require("express");
const { userData, userDataEndpoint } = require("../funtions/userdata.js");
const { addScores, addScoresEndpoint } = require("../funtions/updateplays.js");
const { getScoresForSession, getScoresForSessionEndpoint } = require(
  "../funtions/getScoresForSession.js",
);
const { getCombinedSessionEndPoint } = require(
  "../funtions/getCombinedSession.js",
);
const { getSessions, getSessionsEndpoint } = require(
  "../funtions/getSessions.js",
);
const router = express.Router();
const err = require("../errors.js");

/* GET home page. */
router.get("/", function(_req, res, _next) {
  res.render("index", { title: "Express" });
});

router.get(
  "/get-user-data/:username",
  userDataEndpoint,
);

router.get(
  "/get-combined-session/:userID",
  getCombinedSessionEndPoint,
);

router.get(
  "/update-scores-for-user/:userID",
  addScoresEndpoint,
);

router.get(
  "/get-scores-for-session/:userID/:sessionID",
  getScoresForSessionEndpoint,
);

router.get(
  "/get-sessions/:userID/",
  getSessionsEndpoint,
);

router.get("/track/:username/", async (req, res) => {
  const username = req.params.username;

  let token;
  try {
    token = await require("../funtions/token.js")();
  } catch (e) {
    console.log(e);
    res.status(500).json(e);
  }

  const user = await userData(username, token);
  if (user === "FAIL-API") {
    res.status(500).send(user);
    return;
  }

  try {
    await addScores(user.id, token);
  } catch (e) {
    if (e !== err.NO_NEW) {
      console.log(e);
      res.status(500).json(e);
      return;
    }
  }

  res.status(200).send(user);
});

module.exports = router;
