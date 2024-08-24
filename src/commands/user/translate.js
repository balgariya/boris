import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const translateCommand = {
  data: {
    name: "translate",
    type: 1,
    description: "Translate a text to Bulgarian/English AI.",
    options: [
      {
        name: "text",
        description: "The text to translate",
        required: true,
        type: 3,
      },
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
    const text = interaction.options.getString("text");
    const hidden = interaction.options.getBoolean("hidden");

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    try {
      await askGPT(
        "Translate the following text into bulgarian if it's written in english, if the text is english translate it into bulgarian: " +
          text,
        (newRes) => {
          if (newRes.length > 2000) {
            interaction.editReply({
              content: "The answer is too long!",
              ephemeral: true,
            });
            return;
          }

          try {
            const embed = new EmbedBuilder()
              .setTitle("Translation")
              .setColor(0x00ff00)
              .setDescription(newRes)
              .setFooter({
                text: "This translation might not be correct! It was created by an AI.",
              });
            interaction.editReply(embed);
          } catch (error) {
            try {
              interaction.editReply({
                errorEmbed,
              });
            } catch (error) {}
          }
        }
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply({ embeds: [embed] });
    }
  },
};

async function askGPT(prompt, callback) {
  gpt(
    {
      prompt: prompt,
      model: "GPT-4",
      markdown: false,
    },
    (err, data) => {
      if (err != null) {
        console.log(err);
        callback("An error occurred!");
      } else {
        callback(data.gpt);
      }
    }
  );
}

export { translateCommand };
