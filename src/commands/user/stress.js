import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const stressCommand = {
  data: {
    name: "stress",
    type: 1,
    description: "Find the right pronunciation of a word",
    options: [
      {
        name: "word",
        description: "The word you want to check",
        required: true,
        type: 3,
      },
      {
        name: "hidden",
        description: "Do you want to hide the answer from other users?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const word = interaction.options.getString("word");

    const hidden = interaction.options.getBoolean("hidden");

    await interaction.deferReply({ ephemeral: hidden });

    try {
      const response = await axios.get(
        `https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`
      );
      const $ = cheerio.load(response.data);

      const stressedWord = $("[id^='name-stressed_']").first().text().trim();

      const embed = new EmbedBuilder()
        .setTitle("Pronunciation of the word " + word)
        .setColor(0x0099ff)
        .setURL(`https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`);

      if (stressedWord) {
        embed.setDescription(stressedWord);
      } else {
        embed.setDescription(
          "Pronunciation for the word " + word + " not found :("
        );
      }

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const $ = cheerio.load(error.response.data);
        const similarWords = $(".similar-words .data ul li")
          .map((i, el) => $(el).text().trim())
          .get();

        const embed = new EmbedBuilder()
          .setTitle("Думата не е намерена")
          .setColor(0xff0000)
          .setDescription("Търсената дума липсва в речника.")
          .addFields({
            name: "Подобни думи",
            value: similarWords.join(", ") || "Няма подобни думи",
            inline: false,
          });

        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.editReply(
          "Възникна грешка при търсенето на думата. Моля, опитайте отново по-късно."
        );
      }
    }
  },
};

export { stressCommand };
