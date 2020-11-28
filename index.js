const { Client, MessageEmbed } = require("discord.js");
const client = new Client();
const Faceit = require("./Faceit.js");
const tokens = require("./tokens.js");
const discordToken = tokens.discordToken;

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
        })
        .catch((error) => {
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

client.login(discordToken);

