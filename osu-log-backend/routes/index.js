const express = require("express");
const { userData, userDataEndpoint } = require("../funtions/userdata.js");
const { addScores, addScoresEndpoint } = require("../funtions/updateplays.js");
const { getScoresForSession, getScoresForSessionEndpoint } = require(
  "../funtions/getScoresForSession.js",
);
const router = express.Router();
const err = require("../errors.js");

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

  let sessionScores;
  try {
    sessionScores = await getScoresForSession(user.id, "latest");
  } catch (e) {
    if (e === err.NO_SCORES) {
      console.log(
        "No scores for this user in the last 48 hours, and they have no scores saved...",
      );
      res.status(200).send(e.message);
    } else {
      res.status(500).send(e);
    }
    return;
  }

  res.status(200).send({
    userData: user,
    sessionScores,
    maxSessions: sessionScores.meta.id,
  });
});

module.exports = router;
