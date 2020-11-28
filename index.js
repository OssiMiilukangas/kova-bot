const { Client } = require("discord.js");
const client = new Client();
const faceit = require("./Faceit.js");
const tokens = require("./tokens.js");
const discordToken = tokens.discordToken;

const prefix = "!";

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", msg => {
  if(msg.author.bot) return;
  if(!msg.content.startsWith(prefix)) return;

  // split command into parts
  let command = msg.content.split(" ");

  // faceit features
  if(command[0] === prefix + "faceit") {
    switch(command[1]) {

      // player stats
      case "-s":
        msg.channel.send("**Getting stats...**");
        faceit.getPlayerStats(command[2])
        .then(data => {
          if(msg.channel.lastMessage.author === client.user) msg.channel.lastMessage.delete();
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

      // Last match scoreboard
      case "-lm":
        
        break;

      // command info
      default:
        faceit.printCommandInfo(msg);
        break;
    }
  }
});

client.login(discordToken);
