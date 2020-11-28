const axios = require('axios').default;
const tokens = require("./tokens.js");

const faceitToken = tokens.faceitToken;
const faceitUrl = "https://open.faceit.com/data/v4";

module.exports = class Faceit {
  constructor(username) {
    this.username = username;
  }

  async getPlayerStats() {
    let player = {
      id: null,
      username: this.username,
      country: null,
      level: null,
      elo: null,
      kd: null,
      wr: null,
      matches: null,
      hsPct: null,
      wStreak: null
    }

    await axios({
      method: "GET",
      url: faceitUrl + "/players",
      headers: { Authorization: "Bearer " + faceitToken },
      params: { nickname: player.username }
    })
    .then(res => {
      player.id = res.data.player_id;
      player.country = res.data.country;
      player.level = res.data.games.csgo.skill_level;
      player.elo = res.data.games.csgo.faceit_elo;
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    })

    await axios({
      method: "GET",
      url: faceitUrl + "/players/" + player.id + "/stats/csgo",
      headers: { Authorization: "Bearer " + faceitToken }
    })
    .then(res => {
      player.kd = res.data.lifetime["Average K/D Ratio"];
      player.wr = res.data.lifetime["Win Rate %"];
      player.matches = res.data.lifetime.Matches;
      player.hsPct = res.data.lifetime["Average Headshots %"];
      player.wStreak = res.data.lifetime["Longest Win Streak"];
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    })

    return player;
  }
}