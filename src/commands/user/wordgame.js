import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../../../resources/word_game.json");

const activeGames = new Map();

class WordGame {
  constructor(channelId, language, interaction) {
    this.channelId = channelId;
    this.language = language;
    this.interaction = interaction;
    this.startTime = null;
    this.wordData = null;
    this.collector = null;
  }

  async start() {
    const rawData = fs.readFileSync(dataPath, "utf8");
    const wordList = JSON.parse(rawData).words;

    this.wordData = wordList[Math.floor(Math.random() * wordList.length)];
    this.startTime = Date.now();

    const sourceLanguage = this.language === "bg" ? "Bulgarian" : "English";
    const targetLanguage = this.language === "bg" ? "English" : "Bulgarian";

    const embed = new EmbedBuilder()
      .setTitle(`Translation Game`)
      .setDescription(
        `Translate the following word into ${targetLanguage}:\n\n**${
          this.wordData[this.language]
        }**\n\n`
      )
      .setColor("#2fb966")
      .setFooter({
        text: "First person to type the correct translation wins!",
      });

    await this.interaction.editReply({ embeds: [embed] });

    this.createCollector();
  }

  createCollector() {
    const filter = (m) => !m.author.bot;
    this.collector = this.interaction.channel.createMessageCollector({
      filter,
      time: 60000,
    });

    const targetLang = this.language === "bg" ? "en" : "bg";
    const correctAnswer = this.wordData[targetLang].toLowerCase();

    this.collector.on("collect", async (message) => {
      const guess = message.content
        .toLowerCase()
        .trim()
        .replace(".", "")
        .replace("!", "")
        .replace(",", "")
        .replace("?", "");

      if (guess === correctAnswer) {
        const timeTaken = ((Date.now() - this.startTime) / 1000).toFixed(3);
        await this.handleWin(message.author, timeTaken);
        this.collector.stop();
      }
    });

    this.collector.on("end", (collected, reason) => {
      if (reason === "time") {
        this.handleTimeout();
      }
    });
  }

  async handleWin(winner, timeTaken) {
    const embed = new EmbedBuilder()
      .setDescription(`🎉 <@${winner.id}> won!`)
      .addFields(
        {
          name: "Word",
          value: `${this.wordData.bg} ➡️ ${this.wordData.en}`,
          inline: true,
        },
        { name: "Time", value: `${timeTaken} seconds`, inline: true }
      )
      .setColor("#b300ff")
      .setFooter({ text: "Want to play again? Click the button below!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wordgame_again_${this.language}`)
        .setLabel("Play Again")
        .setStyle(ButtonStyle.Primary)
    );

    await this.interaction.channel.send({ embeds: [embed], components: [row] });
    activeGames.delete(this.channelId);
  }

  async handleTimeout() {
    const embed = new EmbedBuilder()
      .setTitle("Game Over")
      .setDescription("Time's up! Nobody guessed the correct translation.")
      .addFields({
        name: "The answer was",
        value: `${this.wordData.bg} ➡️ ${this.wordData.en}`,
      })
      .setColor("#ff6961")
      .setFooter({ text: "Want to try again? Click the button below!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wordgame_again_${this.language}`)
        .setLabel("Play Again")
        .setStyle(ButtonStyle.Primary)
    );

    await this.interaction.channel.send({ embeds: [embed], components: [row] });
    activeGames.delete(this.channelId);
  }
}

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
    const language = interaction.options.getString("language") || "bg";
    const hidden = interaction.options.getBoolean("hidden") ?? false;
    const channelId = interaction.channelId;

    const channelName = interaction.channel.name.toLowerCase();
    /*if (!channelName.includes("commands")) {
      await interaction.reply({
        content:
          "This game can only be played in the commands channel!",
        ephemeral: true,
      });
      return;
    }*/

    if (activeGames.has(channelId)) {
      await interaction.reply({
        content: "A game is already running in this channel!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: hidden });

    const game = new WordGame(channelId, language, interaction);
    activeGames.set(channelId, game);
    await game.start();
  },
};

export const handleWordGameButton = async (interaction) => {
  const customId = interaction.customId;

  if (customId.startsWith("wordgame_again_")) {
    const channelId = interaction.channelId;

    if (activeGames.has(channelId)) {
      await interaction.reply({
        content: "A game is already running in this channel!",
        ephemeral: true,
      });
      return;
    }

    const language = customId.split("_")[2];

    await interaction.reply({
      content: "New round!",
    });

    const game = new WordGame(channelId, language, interaction);
    activeGames.set(channelId, game);
    await game.start();
  }
};
