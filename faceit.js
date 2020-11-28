const { MessageEmbed } = require("discord.js");
const axios = require('axios').default;
//const tokens = require("./tokens.js");

const faceitToken = process.env.faceitToken;
const faceitUrl = "https://open.faceit.com/data/v4";
const faceitColor = 0xff5500;

module.exports = {
  async getPlayerStats(username) {
    let player = {
      id: null,
      username: username,
      avatar: null,
      country: null,
      region: null,
      level: null,
      elo: null,
      kd: null,
      wr: null,
      matches: null,
      hsPct: null,
      wStreak: null,
      regionRank: null,
      countryRank: null,
    }

    // Get player details
    await axios({
      method: "GET",
      url: `${faceitUrl}/players`,
      params: { nickname: player.username },
      headers: { Authorization: "Bearer " + faceitToken }
    })
    .then(res => {
      player.id = res.data.player_id;
      player.avatar = res.data.avatar;
      player.country = res.data.country;
      player.region = res.data.games.csgo.region;
      player.level = res.data.games.csgo.skill_level;
      player.elo = res.data.games.csgo.faceit_elo;
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    })

    // Get players csgo stats
    await axios({
      method: "GET",
      url: `${faceitUrl}/players/${player.id}/stats/csgo`,
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

    // Get csgo country ranking
    await axios({
      method: "GET",
      url: `${faceitUrl}/rankings/games/csgo/regions/${player.region}/players/${player.id}`,
      params: { country: player.country, limit: 1 },
      headers: { Authorization: "Bearer " + faceitToken },
    })
    .then(res => {
      player.countryRank = res.data.position;
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    })

    // Get csgo region ranking
    await axios({
      method: "GET",
      url: `${faceitUrl}/rankings/games/csgo/regions/${player.region}/players/${player.id}`,
      params: { limit: 1 },
      headers: { Authorization: "Bearer " + faceitToken },
    })
    .then(res => {
      player.regionRank = res.data.position;
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    })

    return player;
  },

  printPlayerStats(msg, data) {
    const embed = new MessageEmbed()
      .setAuthor("Faceit stats")
      .setColor(faceitColor)
      .setTitle(`${data.username}\t:flag_${data.country}:`)
      .setURL("https://www.faceit.com/en/players/" + data.username)
      .setThumbnail(data.avatar)
      .addFields(
        { name: "Ranking:", value: "\u200B", inline: true},
        { name: data.country.toUpperCase(), value: data.countryRank, inline: true },
        { name: data.region, value: data.regionRank, inline: true },
        { name: "Level", value: data.level, inline: true },
        { name: "ELO", value: data.elo, inline: true },
        { name: "Matches", value: data.matches, inline: true },
        { name: "Winrate %", value: data.wr, inline: true },
        { name: "K/D ratio", value: data.kd, inline: true },
        { name: "Headshot %", value: data.hsPct, inline: true },
      )

    msg.channel.send(embed);
  },

  printCommandInfo(msg) {
    const embed = new MessageEmbed()
      .setTitle("Faceit tool commands:")
      .setColor(faceitColor)
      .setDescription("- **!faceit -s {username}**: Get stats\n\
                      - **!faceit -lt {username}**: Get last 20 match average stats (Coming soon)\n\
                      - **!faceit -lm {username}**: Get scoreboard of your last match (Coming soon)");
    msg.channel.send(embed);
  }
}
