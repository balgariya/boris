import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const alphabetCommand = {
  data: {
    name: "alphabet",
    type: 1,
    description: "The bulgarian alphabet",
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
      .setTitle("The alphabet")
      .setColor("#2fb966")
      .setImage(
        "https://github.com/Bulgarian-Assistant/Bot/blob/main/resources/bg-alphabet.png?raw=true"
      );

    await interaction.editReply({ embeds: [embed] });
  },
};

export { alphabetCommand };
