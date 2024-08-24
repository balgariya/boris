import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const helpCommand = {
  data: {
    name: "help",
    type: 1,
    description: "Everything you have to know about the bot",
    options: [
      {
        name: "hidden",
        description: "Do you want to hide the answer from other users?",
        required: false,
        default: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const hidden = interaction.options.getBoolean("hidden") ?? true;

    await interaction.deferReply({ ephemeral: hidden });

    const embed = new EmbedBuilder()
      .setTitle("About this bot")
      .setColor(0x0099ff)
      .setDescription(
        `# Commands
- \`/translate\` - Translates any Bulgarian/English sentence into the other language
- \`/word\` - Gives you information about the pronunciation of a Bulgarian word, its meaning, synonyms, and more
- \`/stress\` - Shows the correct way to pronounce a word, e.g., кѝно
- \`/resources\` - A list of resources for learning bulgarian
- \`/books\` - A list of books in bulgarian
- \`/alphabet\` - An image of the alphabet

# Source code
This bot is open source, which means you can find the source code [here](https://github.com/Bulgarian-Assistant/Bot)

# Do you want to use the bot yourself?
You can install it on your own Discord server or globally. [Just click here](https://discord.com/oauth2/authorize?client_id=1276797546018377728)

`
      );

    await interaction.editReply({ embeds: [embed] });
  },
};

export { helpCommand };
