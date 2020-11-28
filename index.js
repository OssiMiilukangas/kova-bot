const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const axios = require('axios').default;
const tokens = require("./tokens.js");

const prefix = "!";

const faceitToken = tokens.faceitToken;
const faceitUrl = "https://open.faceit.com/data/v4";
const faceitColor = 0xff5500;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", msg => {
  if(msg.author.bot) return;
  if(!msg.content.startsWith(prefix)) return;

  // faceit features
  if(msg.content.startsWith(prefix + "faceit")) {
    let command = msg.content.split(" ");

    if(command[1] !== undefined) {
      let player = {
        id: 0,
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
      })
      .then(res => {
        player.id = res.data.player_id;
        player.level = res.data.games.csgo.skill_level;
        player.elo = res.data.games.csgo.faceit_elo;

        axios({
          method: "GET",
          url: faceitUrl + "/players/" + player.id + "/stats/csgo",
          headers: { Authorization: "Bearer " + faceitToken }
        })
        .then(res => {
          player.kd = res.data.lifetime["Average K/D Ratio"];
          player.wr = res.data.lifetime["Win Rate %"];
          player.matches = res.data.lifetime.Matches;
          player.wins = res.data.lifetime.Wins;
          player.hsPct = res.data.lifetime["Average Headshots %"];
          player.wStreak = res.data.lifetime["Longest Win Streak"];

          console.log(player);
        })
        .catch(error => {
          console.log(error);
        })

      })
      .catch(error => {
        console.log(error);
        if(error.response.status === 404) {
          msg.channel.send("**Faceit user not found.**");
        }
      })
    }
    // Command info
    else {
      const embed = new MessageEmbed()
        .setTitle("Faceit features")
        .setColor(faceitColor)
        .setDescription('- **!faceit {username}**: Get stats\n- **!faceit -lm {username}**: Get scoreboard of your last match');
      msg.channel.send(embed);
    }
  }
});

client.login(tokens.discordToken);

