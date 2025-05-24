import dotenv from "dotenv";
import {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";
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
      const container = new ContainerBuilder();

      if (!jargonData) {
        const notFoundText = new TextDisplayBuilder().setContent(
          `# Думата "${word}" не е намерена в БГ Жаргон\n` +
            "Тази дума не съществува в речника на жаргона или сайтът е недостъпен."
        );

        container.addTextDisplayComponents(notFoundText);
      } else {
        const titleText = new TextDisplayBuilder().setContent(
          `# ${jargonData.word} - БГ Жаргон\n` +
            `Открити са ${jargonData.definitions.length} значения в речника на жаргона.`
        );

        container.addTextDisplayComponents(titleText);

        jargonData.definitions.forEach((def, index) => {
          let definitionContent = `## Значение ${index + 1}\n${def.meaning}`;

          if (def.example) {
            definitionContent += `\n\n*"${def.example}"*`;
          }

          definitionContent += `\n\n👍 ${def.votesYes}   👎 ${def.votesNo}`;

          const definitionText = new TextDisplayBuilder().setContent(
            definitionContent
          );
          container.addTextDisplayComponents(definitionText);
        });
      }

      const lookupButton = new ButtonBuilder()
        .setLabel("Отвори в БГ Жаргон")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://www.bgjargon.com/word/meaning/${encodeURIComponent(word)}`
        );

      container.addActionRowComponents((row) =>
        row.addComponents(lookupButton)
      );

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
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
