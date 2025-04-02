import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";
import { activeGames } from "../../utils/games/game-storage.js";
import { WordGame } from "../../utils/games/word-game.js";
import { MultipleChoiceGame } from "../../utils/games/multiple-choice-game.js";

export const wordGameCommand = {
  data: {
    name: "wordgame",
    type: 1,
    description: "Start a word guessing game",
    options: [
      {
        name: "language",
        description: "Source language of the word to guess",
        required: false,
        type: 3,
        choices: [
          {
            name: "Bulgarian",
            value: "bg",
          },
          {
            name: "English",
            value: "en",
          },
        ],
      },
      {
        name: "mode",
        description: "Select the game mode",
        required: false,
        type: 3,
        choices: [
          {
            name: "Normal",
            value: "normal",
          },
          {
            name: "Multiple Choice",
            value: "multiplechoice",
          },
        ],
      },
      {
        name: "hidden",
        description: "Do you want to hide the initial command?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },

  async execute(interaction) {
    if (
      interaction.guildId == "658655311028289551" &&
      interaction.channelId != "658676524995706931"
    ) {
      return interaction.reply({
        content: "This command can only be used in <#658676524995706931>",
        ephemeral: true,
      });
    }

    const language = interaction.options.getString("language") || "bg";
    const mode = interaction.options.getString("mode") || "normal";
    const hidden = interaction.options.getBoolean("hidden") ?? false;
    const channelId = interaction.channelId;

    if (activeGames.has(channelId)) {
      await interaction.reply({
        content: "A game is already running in this channel!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: hidden });

    if (mode === "multiplechoice") {
      const game = new MultipleChoiceGame(channelId, language, interaction);
      activeGames.set(channelId, game);
      await game.start();
    } else {
      const game = new WordGame(channelId, language, interaction);
      activeGames.set(channelId, game);
      await game.start();
    }
  },
};

export const handleWordGameButton = async (interaction) => {
  const customId = interaction.customId;
  if (
    customId.startsWith("wordgame_again_") ||
    customId.startsWith("wordgame_mc_again_")
  ) {
    const channelId = interaction.channelId;
    if (activeGames.has(channelId)) {
      await interaction.reply({
        content: "A game is already running in this channel!",
        ephemeral: true,
      });
      return;
    }
    const parts = customId.split("_");
    let language;
    if (customId.startsWith("wordgame_mc_again_")) {
      language = parts[3];
    } else {
      language = parts[2];
    }

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: "New round!" });
    } else {
      await interaction.followUp({ content: "New round!" });
    }
    const mode = customId.includes("mc") ? "multiplechoice" : "normal";
    const currentUserId = interaction.user.id;
    if (mode === "multiplechoice") {
      const game = new MultipleChoiceGame(channelId, language, interaction);
      activeGames.set(channelId, game);
      await game.start();
    } else {
      const game = new WordGame(channelId, language, interaction);
      game.userId = currentUserId;
      activeGames.set(channelId, game);
      await game.start();
    }
  }
};
