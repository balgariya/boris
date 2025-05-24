import dotenv from "dotenv";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";
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
      const response = await requestAI(
        "Check if following (maybe Bulgarian) sentence is correct. Reply in English (very short answer). If incorrect (punctuation doesnt count), provide correction and short reason. Sentence: " +
          text
      );

      if (response.length > 2000) {
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

      if (!response || response.trim().length === 0) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe check result is empty or something went wrong!"
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

        const titleText = new TextDisplayBuilder().setContent(
          "# Grammar Check"
        );
        container.addTextDisplayComponents(titleText);

        const checkResultText = new TextDisplayBuilder().setContent(response);
        container.addTextDisplayComponents(checkResultText);

        const footerText = new TextDisplayBuilder().setContent(
          "-# This check was performed by AI"
        );
        container.addTextDisplayComponents(footerText);

        interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (error) {
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

    await interaction.deferReply({ ephemeral: hidden });

    if (!text || text.length === 0) {
      const errorContainer = new ContainerBuilder();
      const errorText = new TextDisplayBuilder().setContent(
        "# Error\nThe message has no text content to check."
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
      const response = await requestAI(
        "Check if following (maybe Bulgarian) sentence is correct. Reply in English (very short answer). If incorrect (punctuation doesnt count), provide correction and short reason. Sentence: " +
          text
      );

      if (response.length > 2000) {
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

      if (!response || response.trim().length === 0) {
        const errorContainer = new ContainerBuilder();
        const errorText = new TextDisplayBuilder().setContent(
          "# Error\nThe check result is empty or something went wrong!"
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

        const titleText = new TextDisplayBuilder().setContent(
          "# Bulgarian Grammar Check"
        );
        container.addTextDisplayComponents(titleText);

        const checkResultText = new TextDisplayBuilder().setContent(response);
        container.addTextDisplayComponents(checkResultText);

        const footerText = new TextDisplayBuilder().setContent(
          "-# This check was performed by AI"
        );
        container.addTextDisplayComponents(footerText);

        interaction.editReply({
          components: [container],
          flags: MessageFlags.IsComponentsV2,
        });
      } catch (error) {
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

export { checkCommand, checkMessageCommand };
