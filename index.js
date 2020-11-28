const { Client, MessageEmbed } = require("discord.js");
const Faceit = require("./Faceit.js");
const client = new Client();
const tokens = require("./tokens.js");

const prefix = "!";

const faceitColor = 0xff5500;

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
 
client.on("message", msg => {
  if(msg.author.bot) return;
  if(!msg.content.startsWith(prefix)) return;

  // faceit features
  if(msg.content.startsWith(prefix + "faceit")) {
    // split command into parts
    let command = msg.content.split(" ");

    switch(command[1]) {
      // player stats
      case "-s":
        const faceit = new Faceit(command[2]);

        faceit.getPlayerStats().then(data => {
          // on success
          const embed = new MessageEmbed()
            .setTitle(`${data.username}\t:flag_${data.country}:`)
            .setColor(faceitColor)
            .setDescription(`**MATCHES: ${data.matches}\t|\tLEVEL: ${data.level}\t|\tELO: ${data.elo}**\n\n\
                            k/d ratio:\t${data.kd}\nwinrate:\t${data.wr}\nheadshot %:\t${data.hsPct}`);
          msg.channel.send(embed);
        })
        .catch((error) => {
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
        const embed = new MessageEmbed()
          .setTitle("Faceit tool commands:")
          .setColor(faceitColor)
          .setDescription('- **!faceit -s {username}**: Get stats\n\
                          - **!faceit -lm {username}**: Get scoreboard of your last match');
        msg.channel.send(embed);
        break;
    }
  }
});

client.login(tokens.discordToken);

