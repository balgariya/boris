import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} from "discord.js";
import { requestAI } from "../../utils/ai-request.js";

dotenv.config();

const MAX_TEXT_LENGTH = 500;

const translateCommand = {
  data: {
    name: "translate",
    type: 1,
    description: "Translate text to Bulgarian/English using AI",
    options: [
      {
        name: "text",
        description: "The text to translate (500 characters max)",
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

    await interaction.deferReply({ ephemeral: hidden });

    if (text.length > MAX_TEXT_LENGTH) {
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nThe text is too long! Please limit it to 500 characters."
      );
      errorContainer.addTextDisplayComponents(errorText);

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    try {
      // First, get language detection with emoji from AI
      const aiPrompt =
        "Detect the language of this text and add the appropriate emoji at the beginning. Only return the emoji. If it's English, add 🇺🇸, if it's Bulgarian, add 🇧🇬, otherwise use the appropriate country flag emoji for the language. Text: " +
        text;

      const languageResult = await requestAI(aiPrompt);
      const sourceEmoji = languageResult.trim();

      // Now translate based on detected language
      let translationPrompt;
      let targetEmoji;

      if (sourceEmoji === "🇺🇸") {
        // English -> Bulgarian
        translationPrompt =
          "Translate this English text to Bulgarian. Only return the translation without comments or explanations: " +
          text;
        targetEmoji = "🇧🇬";
      } else {
        // Any other language -> English
        translationPrompt =
          "Translate this text to English. Only return the translation without comments or explanations: " +
          text;
        targetEmoji = "🇺🇸";
      }

      const translationResult = await requestAI(translationPrompt);

      if (translationResult.length > 2000) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe answer is too long!"
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      if (!translationResult || translationResult.trim().length === 0) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe translation result is empty or something went wrong!"
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      try {
        const container = new ContainerBuilder();

        const originalText = new TextDisplayBuilder().setContent(
          `-# ${sourceEmoji} ${text}`
        );
        container.addTextDisplayComponents(originalText);

        const translationText = new TextDisplayBuilder().setContent(
          `${targetEmoji} ${translationResult.trim()}`
        );
        container.addTextDisplayComponents(translationText);

        interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (error) {
        console.log(error);
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nAn error occurred."
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    } catch (error) {
      console.log(error);
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nAn error occurred."
      );
      errorContainer.addTextDisplayComponents(errorText);

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};

const translateMessageCommand = {
  data: {
    name: "Translate Message",
    type: 3,
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const message = interaction.targetMessage;
    const text = message.content;
    const hidden = false;

    await interaction.deferReply({ ephemeral: hidden });

    if (!text || text.length === 0) {
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nThe message has no text content to translate."
      );
      errorContainer.addTextDisplayComponents(errorText);

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    if (text.length > MAX_TEXT_LENGTH) {
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nThe text is too long! Please limit it to 500 characters."
      );
      errorContainer.addTextDisplayComponents(errorText);

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
      return;
    }

    try {
      // First, get language detection with emoji from AI
      const aiPrompt =
        "Detect the language of this text and add the appropriate emoji at the beginning. Only return the emoji. If it's English, add 🇺🇸, if it's Bulgarian, add 🇧🇬, otherwise use the appropriate country flag emoji for the language. Text: " +
        text;

      const languageResult = await requestAI(aiPrompt);
      const sourceEmoji = languageResult.trim();

      // Now translate based on detected language
      let translationPrompt;
      let targetEmoji;

      if (sourceEmoji === "🇺🇸") {
        // English -> Bulgarian
        translationPrompt =
          "Translate this English text to Bulgarian. Only return the translation without comments or explanations: " +
          text;
        targetEmoji = "🇧🇬";
      } else {
        // Any other language -> English
        translationPrompt =
          "Translate this text to English. Only return the translation without comments or explanations: " +
          text;
        targetEmoji = "🇺🇸";
      }

      const translationResult = await requestAI(translationPrompt);

      if (translationResult.length > 2000) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe answer is too long!"
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      if (!translationResult || translationResult.trim().length === 0) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe translation result is empty or something went wrong!"
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
        return;
      }

      try {
        const container = new ContainerBuilder();

        const originalText = new TextDisplayBuilder().setContent(
          `-# ${sourceEmoji} ${text}`
        );
        container.addTextDisplayComponents(originalText);

        const translationText = new TextDisplayBuilder().setContent(
          `${targetEmoji} ${translationResult.trim()}`
        );
        container.addTextDisplayComponents(translationText);

        interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (error) {
        console.log(error);
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nAn error occurred."
        );
        errorContainer.addTextDisplayComponents(errorText);

        interaction.editReply({
          components: [errorContainer],
          flags: MessageFlags.IsComponentsV2,
        });
      }
    } catch (error) {
      console.log(error);
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nAn error occurred."
      );
      errorContainer.addTextDisplayComponents(errorText);

      await interaction.editReply({
        components: [errorContainer],
        flags: MessageFlags.IsComponentsV2,
      });
    }
  },
};

export { translateCommand, translateMessageCommand };
