import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";
import { scrapeBgJargon } from "../../utils/bgjargon-scraper.js";

dotenv.config();

const bgjargonCommand = {
  data: {
    name: "bgjargon",
    type: 1,
    description:
      "Get definitions from Bulgarian slang dictionary at bgjargon.com",
    options: [
      {
        name: "word",
        description: "The word to look up",
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
      const jargonData = await scrapeBgJargon(word);

      if (!jargonData) {
        const embed = new EmbedBuilder()
          .setTitle(`Думата "${word}" не е намерена в БГ Жаргон`)
          .setColor(0xff0000)
          .setDescription(
            "Тази дума не съществува в речника на жаргона или сайтът е недостъпен."
          )
          .setURL(
            `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
          );

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle(`${jargonData.word} - БГ Жаргон`)
        .setColor(0x00cc00)
        .setURL(
          `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
        )
        .setDescription(
          `Открити са ${jargonData.definitions.length} значения в речника на жаргона.`
        );

      jargonData.definitions.forEach((def, index) => {
        let fieldText = def.meaning;

        if (def.example) {
          fieldText += `\n\n*"${def.example}"*`;
        }

        fieldText += `\n-# 👍 ${def.votesYes}   👎 ${def.votesNo}\n\u200E\n`;

        embed.addFields({
          name: `Значение ${index + 1}`,
          value: fieldText,
          inline: false,
        });
      });

      embed.setFooter({
        text: "Източник: bgjargon.com",
        iconURL: "https://avatars.githubusercontent.com/u/179294549?s=200&v=4",
      });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error("Error in bgjargon command:", error);
      await interaction.editReply({
        ephemeral: hidden,
        content:
          "Възникна грешка при търсенето на думата в БГ Жаргон. Моля, опитайте отново по-късно.",
      });
    }
  },
};

export { bgjargonCommand };
