const Discord = require("discord.js");
const client = new Discord.Client();
const axios = require('axios').default;
const token = require("./token.js");

const prefix = "!";

const faceitToken = "4839db51-1fbd-49c4-8a61-328cc2964122";
const faceitUrl = "https://open.faceit.com/data/v4";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", msg => {
  if(msg.author.bot) return;
  if(!msg.content.startsWith(prefix)) return;

  if(msg.content.startsWith(prefix + "faceit")) {
    let playerId;
    let stats = {
      level: 0,
      elo: 0,
      kd: 0,
      wr: 0,
      matches: 0,
      wins: 0,
      hsPct: 0,
      wStreak: 0
    }

    axios({
      method: "GET",
      url: faceitUrl + "/players",
      headers: { Authorization: "Bearer " + faceitToken },
      params: { nickname: msg.content.slice(7) }
    }).then(res => {
      playerId = res.data.player_id;
      stats.level = res.data.games.csgo.skill_level;
      stats.elo = res.data.games.csgo.faceit_elo;
      axios({
        method: "GET",
        url: faceitUrl + "/players/" + playerId + "/stats/csgo",
        headers: { Authorization: "Bearer " + faceitToken }
      }).then(res => {
        stats.kd = res.data.lifetime["Average K/D Ratio"];
        stats.wr = res.data.lifetime["Win Rate %"];
        stats.matches = res.data.lifetime.Matches;
        stats.wins = res.data.lifetime.Wins;
        stats.hsPct = res.data.lifetime["Average Headshots %"];
        stats.wStreak = res.data.lifetime["Longest Win Streak"];

        console.log(stats);
      }).catch(error => {
        console.log(error);
      })

    }).catch(error => {
      console.log(error);
    })
  }
});

client.login(token);

