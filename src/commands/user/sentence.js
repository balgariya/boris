import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";
import { requestAI } from "../../utils/ai-request.js";

dotenv.config();

const MAX_TEXT_LENGTH = 500;

const checkCommand = {
  data: {
    name: "sentence",
    type: 1,
    description: "Check if a Bulgarian sentence is correct using AI",
    options: [
      {
        name: "text",
        description: "The Bulgarian text to check (500 characters max)",
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
    const text = interaction.options.getString("text");
    const hidden = interaction.options.getBoolean("hidden");

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    if (text.length > MAX_TEXT_LENGTH) {
      await interaction.editReply({
        content: "The text is too long! Please limit it to 500 characters.",
      });
      return;
    }

    try {
      const response = await requestAI(
        "Check if following (maybe Bulgarian) sentence is correct. Reply in English (very short answer). If incorrect (punctuation doesnt count), provide correction and short reason. Sentence: " +
          text
      );

      if (response.length > 2000) {
        interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        interaction.editReply({
          content: "The check result is empty or something went wrong!",
        });
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setTitle("Grammar Check")
          .setColor(0x00ff00)
          .setDescription(response)
          .setFooter({
            text: "This check was performed by AI",
          });

        interaction.editReply({ embeds: [embed] });
      } catch (error) {
        try {
          interaction.editReply({ embeds: [errorEmbed] });
        } catch (error) {}
      }
    } catch (error) {
      console.log(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

const checkMessageCommand = {
  data: {
    name: "Check Grammar",
    type: 3,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const message = interaction.targetMessage;
    const text = message.content;
    const hidden = false;

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    if (!text || text.length === 0) {
      await interaction.editReply({
        content: "The message has no text content to check.",
      });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      await interaction.editReply({
        content: "The text is too long! Please limit it to 500 characters.",
      });
      return;
    }

    try {
      const response = await requestAI(
        "Check if following (maybe Bulgarian) sentence is correct. Reply in English (very short answer). If incorrect (punctuation doesnt count), provide correction and short reason. Sentence: " +
          text
      );

      if (response.length > 2000) {
        interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        interaction.editReply({
          content: "The check result is empty or something went wrong!",
        });
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setTitle("Bulgarian Grammar Check")
          .setColor(0x00ff00)
          .setDescription(response)
          .setFooter({
            text: "This check was performed by AI",
          });

        interaction.editReply({ embeds: [embed] });
      } catch (error) {
        try {
          interaction.editReply({ embeds: [errorEmbed] });
        } catch (error) {}
      }
    } catch (error) {
      console.log(error);
      await interaction.editReply({ embeds: [errorEmbed] });
    }
  },
};

export { checkCommand, checkMessageCommand };
