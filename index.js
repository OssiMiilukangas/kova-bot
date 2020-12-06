const { MessageEmbed, Client } = require("discord.js");
const client = new Client();
const axios = require('axios').default;
const faceit = require("./faceit.js");
//const tokens = require("./tokens.js");
const discordToken = process.env.discordToken;

const prefix = "!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", msg => {
  if(msg.author.bot) return;
  if(!msg.content.startsWith(prefix)) return;

  // Split command into parts
  let command = msg.content.split(" ");

  // kovabot info
  if(command[0] == `${prefix}kovabot`) {
    const embed = new MessageEmbed()
      .setTitle("kovabot features:")
      .setColor(0x000000)
      .setDescription(`- **!faceit:** Faceit stats tool`);
    msg.channel.send(embed);
  }

  // Faceit features
  if(command[0] === `${prefix}faceit`) {
    switch(command[1]) {

      // Player stats
      case "-s":
        faceit.getPlayerStats(client, msg, command[2])
        .then(data => {
          console.log(data);
          faceit.printPlayerStats(msg, data);
        })
        .catch((error) => {
          if(msg.channel.lastMessage.author === client.user) msg.channel.lastMessage.delete();
          console.log(error);
          if(error === 404) {
            msg.channel.send("**Faceit user not found.**");
          } else {
            msg.channel.send("**Unknown error.**");
          }
        });
        break;

      // Last 20 match average stats
      case "-rs":
        matchCount = 20;

        faceit.getLastMatchIds(command[2], matchCount)
        .then(data => {
          // Doing get match requests asynchronously here because I couldn't get this to work otherwise
          let promises = [];
          let responses = [];
          data.forEach(e => {
            promises.push(
              axios({
                method: "GET",
                url: `${faceit.faceitUrl}/matches/${e}/stats`,
                headers: { Authorization: "Bearer " + faceit.faceitToken }
              })
              .then(res => {
                responses.push(res);
              })
              .catch(error => {
                console.log(error);
              })
            );
          })

          Promise.all(promises).then(() => {
            averageStats = faceit.calculateAverages(command[2], responses, matchCount);
            console.log(averageStats);
            faceit.printAverageStats(msg, command[2], averageStats, matchCount);
          });
        })
        break;

      // Last match scoreboard
      case "-lm":
        // TODO
        break;

      // Command info
      default:
        faceit.printCommandInfo(msg);
        break;
    }
  }
});

client.login(discordToken);
