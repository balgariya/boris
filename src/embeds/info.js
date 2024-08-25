import { EmbedBuilder } from "discord.js";

function sendInfoEmbed(channel) {
  const about = new EmbedBuilder()
    .setColor("#2fb966")
    .setTitle("About the bot")
    .setAuthor({
      name: "Maxim",
      iconURL:
        "https://github.com/max1mde/images/blob/main/New%20Project%20(83)%20(3)%20(1)%20(1)%20(2)%20(2)%20(2)%20(2)%20(1).png?raw=true",
    })
    .setDescription(
      "This bot helps you learn Bulgarian with commands for translation, word meanings, pronunciation, and more.\n" +
        "You view resource lists for learning bulgarian, book recommendations & more.\n" +
        "There are also some minigames like word guessing games for expanding your vocabulary.\n" +
        "### Install the bot on your Server or Account\n" +
        "https://discord.com/application-directory/1276797546018377728\n" +
        "### Source Code\n" +
        "https://github.com/Bulgarian-Assistant/Bot\n" +
        "### Discord Server Invite\n" +
        "https://discord.gg/3NbukU7mBs\n" +
        "### Commands\n" +
        "```\n/help\n/word\n/stress\n/to-cyrillic\n/translate\n/resources\n/books\n/alphabet\n```\n" +
        "### Roles\n" +
        "Here you can choose roles <id:customize>\n"
    );

  channel.send({ embeds: [about] });
}

export { sendInfoEmbed };
