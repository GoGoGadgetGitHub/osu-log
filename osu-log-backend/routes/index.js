const express = require("express");
const { userData, userDataEndpoint } = require("../funtions/userdata.js");
const { addScores, addScoresEndpoint } = require("../funtions/updateplays.js");
const { getScoresForSession, getScoresForSessionEndpoint } = require(
  "../funtions/getScoresForSession.js",
);
const { generateStatsForSessionEndpoint } = require(
  "../funtions/generateStats.js",
);
const router = express.Router();

/* GET home page. */
router.get("/", function(_req, res, _next) {
  res.render("index", { title: "Express" });
});

router.get("/get-user-data/:username", userDataEndpoint);
router.get("/update-scores-for-user/:userID", addScoresEndpoint);
router.get(
  "/get-scores-for-session/:userID/:sessionID",
  getScoresForSessionEndpoint,
);
router.get(
  "/generate-stats/:userID/:sessionID",
  generateStatsForSessionEndpoint,
);
router.get("/track/:username/", async (req, res) => {
  const username = req.params.username;
  const token = await require("../funtions/token.js")();
  if (!token) {
    res.status(500).send("TOKEN-FAIL");
  }
  const user = await userData(username, token);
  if (user === "FAIL-API") {
    res.status(500).send(user);
    return;
  }
  const update = await addScores(user.id, token);
  if (update !== "SUCSESS" && update !== "NONEW") {
    console.log(update);
    res.status(500).send(update);
    return;
  }
  const sessionScores = await getScoresForSession(user.id, "latest");
  if (!sessionScores.scores) {
    res.status(500).send(sessionScores);
    return;
  }
  res.status(200).send({
    userData: user,
    sessionScores,
    maxSessions: sessionScores.meta.id,
  });
});

module.exports = router;
