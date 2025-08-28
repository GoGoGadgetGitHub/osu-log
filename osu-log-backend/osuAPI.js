const axios = require("axios");

const api = axios.create({
  baseURL: "https://osu.ppy.sh/api/v2/",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "x-api-version": "20220705",
  },
});

module.exports = api;
