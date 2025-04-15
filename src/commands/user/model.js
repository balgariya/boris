import { EmbedBuilder } from "discord.js";

import { updateModel, currentAIModel } from "../../utils/config.js";

const AVAILABLE_MODELS = [
  {
    name: "GPT-4o Mini ($0.15/M / $0.6/M) (Default)",
    value: "openai/gpt-4o-mini",
  },
  {
    name: "Claude 3.7 Sonnet ($3/M / $15/M)",
    value: "anthropic/claude-3.7-sonnet",
  },
  {
    name: "GPT-4.1 Nano ($0.1/M / $0.4/M)",
    value: "openai/gpt-4.1-nano",
  },
  {
    name: "GPT-4.1 Mini ($0.4/M / $1.6/M)",
    value: "openai/gpt-4.1-mini",
  },
  {
    name: "Gemini Flash 1.5 8B ($0.0375/M / $0.15/M)",
    value: "google/gemini-flash-1.5-8b",
  },
  {
    name: "Llama 3.3 70B Instruct ($0.3/M / $0.4/M)",
    value: "meta-llama/llama-3.3-70b-instruct",
  },
  {
    name: "DeepSeek: R1 (Free)",
    value: "deepseek/deepseek-r1:free",
  },
  {
    name: "Mistral Nemo ($0.035/M / $0.08/M)",
    value: "mistralai/mistral-nemo",
  },
  {
    name: "Grok 3 Mini Beta ($0.3/M / $0.5/M)",
    value: "x-ai/grok-3-mini-beta",
  },
  {
    name: "Claude 3.5 Haiku ($0.8/M / $4/M)",
    value: "anthropic/claude-3.5-haiku",
  },
  {
    name: "Gemma 2 27B IT",
    value: "google/gemma-2-27b-it",
  },
];

const ADMIN_USER_IDS = ["759334613335670805", "715182449038065667"];

export const modelCommand = {
  data: {
    name: "model",
    type: 1,
    description: "View or change the current AI model",
    options: [
      {
        name: "select",
        description: "Select an AI model (admin only)",
        required: false,
        type: 3,
        choices: AVAILABLE_MODELS,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const selectedModel = interaction.options.getString("select");

    if (!selectedModel) {
      const currentModelInfo = AVAILABLE_MODELS.find(
        (m) => m.value === currentAIModel
      );
      const currentModelDisplay = currentModelInfo
        ? `**${currentModelInfo.name}**\n\`${currentModelInfo.value}\``
        : `\`${currentAIModel}\``;

      const embed = new EmbedBuilder()
        .setTitle("Current AI Model")
        .setColor(0x00ff00)
        .setDescription(`${currentModelDisplay}`);

      await interaction.reply({ embeds: [embed] });
      return { changedModel: false };
    }

    if (!ADMIN_USER_IDS.includes(interaction.user.id)) {
      await interaction.reply({
        content: "You don't have permission to change the AI model.",
        ephemeral: true,
      });
      return { changedModel: false };
    }

    const modelInfo = AVAILABLE_MODELS.find((m) => m.value === selectedModel);
    const modelDisplay = modelInfo
      ? `**${modelInfo.name}**\n\`${modelInfo.value}\``
      : `\`${selectedModel}\``;

    const embed = new EmbedBuilder()
      .setTitle("AI Model Changed")
      .setColor(0x00ff00)
      .setDescription(`${modelDisplay}`);

    await interaction.reply({ embeds: [embed] });
    updateModel(selectedModel);
    return { changedModel: true, newModel: selectedModel };
  },
};
