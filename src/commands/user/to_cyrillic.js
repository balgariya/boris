import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const toCyrillicCommand = {
  data: {
    name: "to-cyrillic",
    type: 1,
    description: "Convert latin written bulgarian to cyrillic",
    options: [
      {
        name: "text",
        description: "Your bulgarian text written in latin",
        required: true,
        type: 3,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const text = interaction.options.getString("text");

    await interaction.deferReply();

    try {
      const embed = new EmbedBuilder()
        .setTitle("Latin to Cyrillic conversion")
        .setColor(0x0099ff);

      embed.setDescription(
        "Pronunciation for the word " + word + " not found :("
      );

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      await interaction.editReply("За съжаление е възникнал проблем!");
    }
  },
};

export { toCyrillicCommand };
