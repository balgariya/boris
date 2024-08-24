import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const wordCommand = {
  data: {
    name: "word",
    type: 1,
    description:
      "Get information about a Bulgarian word through https://rechnik.chitanka.info/",
    options: [
      {
        name: "word",
        description: "The word",
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
    const word = interaction.options.getString("word");
    const hidden = interaction.options.getBoolean("hidden");

    await interaction.deferReply({ ephemeral: hidden });

    try {
      const response = await axios.get(
        `https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`
      );
      const $ = cheerio.load(response.data);

      const title = $("h1#first-heading").text().trim();
      const stressedWord = $("[id^='name-stressed_']").text().trim();

      const typeElement = $("[id^='type_']");
      let typeText = "";
      let typeLink = "";

      if (typeElement.length) {
        typeText = typeElement.text().trim();
        const linkElement = typeElement.find("a");
        if (linkElement.length) {
          const href = linkElement.attr("href");
          typeLink = `https://rechnik.chitanka.info${href}`;
        }
      }

      const [wordType, wordClass] = typeText.split("(");
      const wordClassClean = wordClass ? `(${wordClass.trim()}` : "";

      const meaningElement = $("[id^='meaning_']");
      const meaning = meaningElement.length ? meaningElement.text().trim() : "";

      const synonyms = $(".synonyms .data").text().trim();
      const links = $(".links .data ul li")
        .map((i, el) => {
          const linkText = $(el).text().trim();
          const linkUrl = $(el).find("a").attr("href");
          return `[${linkText}](${linkUrl})`;
        })
        .get()
        .join("\n");

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor(0x0099ff)
        .setURL(`https://rechnik.chitanka.info/w/${encodeURIComponent(word)}`);

      if (stressedWord) {
        embed.addFields({
          name: "Ударение",
          value: stressedWord,
          inline: true,
        });
      }

      if (wordType) {
        embed.addFields({
          name: "Вид дума",
          value: wordType.trim(),
          inline: true,
        });
      }

      if (wordClassClean) {
        embed.addFields({
          name: "Клас",
          value: typeLink ? `[${wordClassClean}](${typeLink})` : wordClassClean,
          inline: true,
        });
      }

      if (meaning) {
        const limitedMeaning = meaning.split("\n").slice(0, 5).join("\n");
        embed.addFields({
          name: "Значение",
          value: limitedMeaning || "Няма информация",
          inline: false,
        });
      }

      if (synonyms) {
        embed.addFields({ name: "Синоними", value: synonyms, inline: false });
      }

      if (links) {
        embed.addFields({ name: "Връзки", value: links, inline: false });
      }

      await interaction.editReply({ embeds: [embed], ephemeral: hidden });
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

        await interaction.editReply({ embeds: [embed], ephemeral: hidden });
      } else {
        await interaction.editReply({
          ephemeral: hidden,
          text: "Възникна грешка при търсенето на думата. Моля, опитайте отново по-късно.",
        });
      }
    }
  },
};

export { wordCommand };
