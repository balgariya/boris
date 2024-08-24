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
        .setColor(0x0099ff)
        .setImage(
          "https://bulgarian-wiki.eu/api/files.get?sig=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJrZXkiOiJ1cGxvYWRzLzQ3NTBiZWY2LWY5MjQtNGEyOS1hYjljLWEwZmE5NWVhNDY5YS8yZTVhMzE0Yi0xYjMwLTRjM2MtOWU2ZC0zNTZhMGNkZDE1MWQvaW1hZ2UgKDM0KSAoMSkgKDEpLnBuZyIsInR5cGUiOiJhdHRhY2htZW50IiwiaWF0IjoxNzI0NTE2MDcxLCJleHAiOjE3MjQ1MTYxMzF9.rGMgbf549Ew3YXoqnhbMA6GWxRVggtBOWpdZCjh8S38"
        );

      await interaction.editReply({ embeds: [embed] });
    }
  
};

export { alphabetCommand };
