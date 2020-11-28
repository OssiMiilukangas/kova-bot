const { MessageEmbed } = require("discord.js");
const axios = require('axios').default;
const tokens = require("./tokens.js");

const faceitToken = tokens.faceitToken;
const faceitUrl = "https://open.faceit.com/data/v4";
const faceitColor = 0xff5500;

module.exports = {
  async getPlayerStats(username) {
    let player = {
      id: null,
      username: username,
      avatar: null,
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
      player.avatar = res.data.avatar;
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
  },

  printPlayerStats(msg, data) {
    const embed = new MessageEmbed()
      .setAuthor("Faceit stats")
      .setColor(faceitColor)
      .setTitle(`${data.username}\t:flag_${data.country}:`)
      .setURL("https://www.faceit.com/en/players/" + data.username)
      .setThumbnail(data.avatar)
      .addFields(
        { name: "Matches", value: data.matches, inline: true },
        { name: "Level", value: data.level, inline: true },
        { name: "ELO", value: data.elo, inline: true },
        //{ name: "\u200B", value: "\u200B" }, blank field
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
      .setDescription('- **!faceit -s {username}**: Get stats\n\
                      - **!faceit -lm {username}**: Get scoreboard of your last match');
    msg.channel.send(embed);
  }
}
