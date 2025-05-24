import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";
import { requestAI } from "../../utils/ai-request.js";

dotenv.config();

const MAX_TEXT_LENGTH = 500;

const aiCommand = {
  data: {
    name: "ai",
    type: 1,
    description: "Ask the AI a general question",
    options: [
      {
        name: "question",
        description: "Your question for the AI (500 characters max)",
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
    const question = interaction.options.getString("question");
    const hidden = interaction.options.getBoolean("hidden");

    const errorEmbed = new EmbedBuilder()
      .setTitle("Error")
      .setColor(0xff0000)
      .setDescription("An error occurred.");

    await interaction.deferReply({ ephemeral: hidden });

    if (question.length > MAX_TEXT_LENGTH) {
      await interaction.editReply({
        content:
          "Your question is too long! Please limit it to 500 characters.",
      });
      return;
    }

    try {
      const response = await requestAI(
        "answer this discord msg: " +
          question,
      3, "openai/gpt-4o-mini");

      if (response.length > 2000) {
        interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        interaction.editReply({
          content: "The AI returned an empty response or something went wrong!",
        });
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setTitle("AI Response")
          .setColor(0x00ff00)
          .setDescription(response);

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

const aiMessageCommand = {
  data: {
    name: "Ask AI About This",
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
        content: "The message has no text content to analyze.",
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
      const response = await requestAI(text, 3, "openai/gpt-4o-mini");

      if (response.length > 2000) {
        interaction.editReply({
          content: "The answer is too long!",
        });
        return;
      }

      if (!response || response.trim().length === 0) {
        interaction.editReply({
          content: "The AI returned an empty response or something went wrong!",
        });
        return;
      }

      try {
        const embed = new EmbedBuilder()
          .setTitle("AI Response")
          .setColor(0x00ff00)
          .setDescription(response);

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

export { aiCommand, aiMessageCommand };
