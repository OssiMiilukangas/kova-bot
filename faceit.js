const { MessageEmbed } = require("discord.js");
const axios = require('axios').default;
//const tokens = require("./tokens.js");

const faceitToken = process.env.faceitToken;
const faceitUrl = "https://open.faceit.com/data/v4";
const faceitColor = 0xff5500;

module.exports = {
  faceitToken,
  faceitUrl,
  async getPlayerStats(client, msg, username) {
    // Message to give user feedback
    msg.channel.send("**Fetching stats...**");

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

    // Delete the feedback message
    if(msg.channel.lastMessage.author === client.user) { 
      msg.channel.lastMessage.delete();
    }

    return player;
  },

  printPlayerStats(msg, data) {
    const embed = new MessageEmbed()
      .setAuthor("Faceit stats")
      .setColor(faceitColor)
      .setTitle(`${data.username}\t:flag_${data.country}:`)
      .setURL("https://www.faceit.com/en/players/" + data.username)
      .setThumbnail(data.avatar)
      .setDescription("=====================================")
      .addFields(
        { name: "\u200B", value: "**Ranking:**", inline: true},
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

  async getLastMatchIds(client, msg, username, gameCount) {
    let matchIds = [];

    let player = {
      id: null,
      username: username,
      kills: null,
      deaths: null,
      assists: null,
      headshots: null,
      hsPct: null,
      kdRatio: null,
      krRatio: null,
      mvps: null,
      rounds: null,
      wins: null
    }

    // Message to give user feedback
    msg.channel.send("**Fetching stats...**");

    // Get player id
    await axios({
      method: "GET",
      url: `${faceitUrl}/players`,
      params: { nickname: player.username },
      headers: { Authorization: "Bearer " + faceitToken }
    })
    .then(res => {
      player.id = res.data.player_id;
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    });

    // Get match ids
    await axios({
      method: "GET",
      url: `${faceitUrl}/players/${player.id}/history`,
      params: { game: "csgo", limit: gameCount, from: 0 },
      headers: { Authorization: "Bearer " + faceitToken }
    })
    .then(res => {
      res.data.items.forEach(e => {
        matchIds.push(e.match_id);
      });
    })
    .catch(error => {
      console.log(error);
      return Promise.reject(error.response.status);
    });

    return matchIds;
  },

  calculateAverages(client, msg, username, responses, matchCount) {
    let totalStats = averageStats = {
      kills: null,
      deaths: null,
      assists: null,
      headshots: null,
      hsPct: null,
      kdRatio: null,
      krRatio: null,
      mvps: null,
      rounds: null,
      wins: null
    }

    responses.forEach(res => {
      // Find stat object of the user
      const match = res.data.rounds[0]
      let found = match.teams[0].players.find(element => element.nickname === username);

      if (found === undefined) {
        found = match.teams[1].players.find(element => element.nickname === username)
      }

      // Sum up all users stats
      if (found !== undefined) {
        totalStats.kills += +found.player_stats.Kills;
        totalStats.deaths += +found.player_stats.Deaths;
        totalStats.assists += +found.player_stats.Assists;
        totalStats.headshots += +found.player_stats.Headshot;
        totalStats.hsPct += +found.player_stats["Headshots %"];
        totalStats.kdRatio += +found.player_stats["K/D Ratio"];
        totalStats.krRatio += +found.player_stats["K/R Ratio"];
        totalStats.mvps += +found.player_stats.MVPs;
        totalStats.rounds += +match.round_stats.Rounds;
        totalStats.wins += +found.player_stats.Result;
      } else {
        // If player stats were not found from match data, exclude match from count
        matchCount = matchCount - 1;
      }
    })

    // Calculate averages
    for (const property in totalStats) {
      if(property !== "kdRatio" && property !== "krRatio" && property !== "wins") {
        averageStats[property] = Math.round(totalStats[property] / matchCount);
      } else if (property !== "wins") {
        averageStats[property] = Math.round(((totalStats[property] / matchCount) + Number.EPSILON) * 100) / 100;
      } else {
        averageStats[property] = Math.round(((totalStats[property] / matchCount) + Number.EPSILON) * 100);
      }
    }

    // Delete the feedback message
    if(msg.channel.lastMessage.author === client.user) { 
      msg.channel.lastMessage.delete();
    }

    return averageStats;
  },

  printAverageStats(msg, username, data, matchCount) {
    const embed = new MessageEmbed()
      .setAuthor("Faceit stats")
      .setColor(faceitColor)
      .setTitle(`${username}'s last ${matchCount} matches average stats:`)
      .setDescription("=====================================")
      .addFields(
        { name: "Kills", value: data.kills, inline: true },
        { name: "Deaths", value: data.deaths, inline: true },
        { name: "Assists", value: data.assists, inline: true },
        { name: "Headshot %", value: data.hsPct, inline: true },
        { name: "K/D ratio", value: data.kdRatio, inline: true },
        { name: "K/R ratio", value: data.krRatio, inline: true },
        { name: "Winrate %", value: data.wins, inline: true },
        { name: "Rounds", value: data.rounds, inline: true },
        { name: "MVPs", value: data.mvps, inline: true },
      )

    msg.channel.send(embed);
  },

  printCommandInfo(msg) {
    const embed = new MessageEmbed()
      .setTitle("Faceit tool commands:")
      .setColor(faceitColor)
      .setDescription("- **!faceit -s {username}**: Get stats\n\
                      - **!faceit -rs {username}**: Get last 20 matches average stats\n\
                      - **!faceit -lm {username}**: Get scoreboard of your last match (Coming soon)");
    msg.channel.send(embed);
  }
}
