import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  MessageFlags,
} from "discord.js";

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

      const container = new ContainerBuilder();

      const titleText = new TextDisplayBuilder().setContent(
        `# Pronunciation of the word ${word}`
      );
      container.addTextDisplayComponents(titleText);

      const resultText = new TextDisplayBuilder().setContent(
        stressedWord
          ? stressedWord
          : `Pronunciation for the word ${word} not found :(`
      );
      container.addTextDisplayComponents(resultText);

      const dictionaryButton = new ButtonBuilder()
        .setLabel("View in Dictionary")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`);

      container.addActionRowComponents((row) =>
        row.addComponents(dictionaryButton)
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const $ = cheerio.load(error.response.data);
        const similarWords = $(".similar-words .data ul li")
          .map((i, el) => $(el).text().trim())
          .get();

        const container = new ContainerBuilder();

        const titleText = new TextDisplayBuilder().setContent(
          "# Думата не е намерена\nТърсената дума липсва в речника."
        );
        container.addTextDisplayComponents(titleText);

        if (similarWords.length > 0) {
          const similarWordsText = new TextDisplayBuilder().setContent(
            `## Подобни думи\n${similarWords.join(", ")}`
          );
          container.addTextDisplayComponents(similarWordsText);
        } else {
          const noSimilarWordsText = new TextDisplayBuilder().setContent(
            "## Подобни думи\nНяма подобни думи"
          );
          container.addTextDisplayComponents(noSimilarWordsText);
        }

        await interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } else {
        console.log(error);
        const container = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nВъзникна грешка при търсенето на думата. Моля, опитайте отново по-късно."
        );
        container.addTextDisplayComponents(errorText);

        await interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    }
  },
};

export { stressCommand };
