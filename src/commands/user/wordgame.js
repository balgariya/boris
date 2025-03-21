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
const userProgressPath = path.join(
  __dirname,
  "../../../resources/user_progress.json"
);

const activeGames = new Map();

const loadUserProgress = () => {
  try {
    if (fs.existsSync(userProgressPath)) {
      const data = JSON.parse(fs.readFileSync(userProgressPath, "utf8"));

      if (data && data.users) {
        let needsSaving = false;
        Object.keys(data.users).forEach((userId) => {
          if (data.users[userId].solved_bg) {
            const filteredBg = data.users[userId].solved_bg.filter(
              (id) => id !== null
            );
            if (filteredBg.length !== data.users[userId].solved_bg.length) {
              data.users[userId].solved_bg = filteredBg;
              needsSaving = true;
            }
          }
          if (data.users[userId].solved_en) {
            const filteredEn = data.users[userId].solved_en.filter(
              (id) => id !== null
            );
            if (filteredEn.length !== data.users[userId].solved_en.length) {
              data.users[userId].solved_en = filteredEn;
              needsSaving = true;
            }
          }
        });

        if (needsSaving) {
          saveUserProgress(data);
        }
      }

      return data;
    }
    return { users: {} };
  } catch (error) {
    console.error("Error loading user progress:", error);
    return { users: {} };
  }
};

const saveUserProgress = (progress) => {
  try {
    fs.writeFileSync(userProgressPath, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error("Error saving user progress:", error);
  }
};

const getTotalWordsCount = () => {
  try {
    const rawData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(rawData).words.length;
  } catch (error) {
    console.error("Error getting total words count:", error);
    return 0;
  }
};

class WordGame {
  constructor(channelId, language, interaction) {
    this.channelId = channelId;
    this.language = language;
    this.interaction = interaction;
    this.startTime = null;
    this.wordData = null;
    this.collector = null;
    this.userId = interaction.user.id;
  }

  async start() {
    const rawData = fs.readFileSync(dataPath, "utf8");
    const wordList = JSON.parse(rawData).words;

    const userProgress = loadUserProgress();
    if (!userProgress.users[this.userId]) {
      userProgress.users[this.userId] = {
        solved_bg: [],
        solved_en: [],
      };
    }

    if (!Array.isArray(userProgress.users[this.userId].solved_bg)) {
      userProgress.users[this.userId].solved_bg = [];
    }
    if (!Array.isArray(userProgress.users[this.userId].solved_en)) {
      userProgress.users[this.userId].solved_en = [];
    }

    userProgress.users[this.userId].solved_bg = userProgress.users[
      this.userId
    ].solved_bg.filter((id) => id !== null);
    userProgress.users[this.userId].solved_en = userProgress.users[
      this.userId
    ].solved_en.filter((id) => id !== null);
    saveUserProgress(userProgress);

    const solvedWords =
      userProgress.users[this.userId][`solved_${this.language}`];

    let availableWords = wordList.filter(
      (word) => !solvedWords.includes(word.bg)
    );

    if (availableWords.length === 0) {
      /*userProgress.users[this.userId][`solved_${this.language}`] = [];
      saveUserProgress(userProgress); This resets the users stats .. */ 
      availableWords = wordList;
    }

    this.wordData =
      availableWords[Math.floor(Math.random() * availableWords.length)];
    this.startTime = Date.now();

    const targetLanguage = this.language === "bg" ? "English" : "Bulgarian";

    const embed = new EmbedBuilder()
      .setTitle(`Translation Game`)
      .setDescription(
        `Translate the following word into ${targetLanguage}:\n## \`${
           this.wordData[this.language]
        }\`\n\n`
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
    const correctAnswerRaw = this.wordData[targetLang];

    const processAnswers = (text) => {
      return text.split(",").map((answer) => {
        let cleaned = answer.toLowerCase().trim();

        if (targetLang === "en") {
          cleaned = cleaned.replace(/^(to get |to |the |a |an )/, "");
        } else if (targetLang === "bg") {
          cleaned = cleaned.replace(/( се)$/, "");
        }
        return cleaned;
      });
    };

    const correctAnswers = processAnswers(correctAnswerRaw);

    const noIdeaResponses = [
      "kp",
      "idk",
      "kein plan",
      "no idea",
      "ne znam",
      "не знам",
      "no clue",
    ];

    this.collector.on("collect", async (message) => {
      const guess = message.content
        .toLowerCase()
        .trim()
        .replace(/[.,!?]/g, "");

      if (correctAnswers.some((answer) => guess === answer)) {
        const timeTaken = ((Date.now() - this.startTime) / 1000).toFixed(3);
        await this.handleWin(message.author, timeTaken);
        this.collector.stop();
      }

      if (noIdeaResponses.includes(guess)) {
        await this.handleNoIdea(message.author);
        this.collector.stop();
      }
    });

    this.collector.on("end", (collected, reason) => {
      if (reason === "time") {
        this.handleTimeout();
      }
    });
  }

  async handleNoIdea(user) {
    const embed = new EmbedBuilder()
      .setTitle("Better Luck Next Time!")
      .setDescription(
        `It seems like <@${user.id}> didn't know the answer! Here's the correct translation:`
      )
      .addFields({
        name: "The correct word was:",
        value: `${this.wordData.bg} ➡️ ${this.wordData.en}`,
      })
      .setColor("#ffa500")
      .setFooter({ text: "Want to try again? Click the button below!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
        .setLabel("Play Again")
        .setStyle(ButtonStyle.Primary)
    );

    await this.interaction.channel.send({ embeds: [embed], components: [row] });
    activeGames.delete(this.channelId);
  }

  async handleWin(winner, timeTaken) {
    const winnerId = winner.id;
    const userProgress = loadUserProgress();

    if (!userProgress.users[winnerId]) {
      userProgress.users[winnerId] = {
        solved_bg: [],
        solved_en: [],
      };
    }

    if (!Array.isArray(userProgress.users[winnerId].solved_bg)) {
      userProgress.users[winnerId].solved_bg = [];
    }
    if (!Array.isArray(userProgress.users[winnerId].solved_en)) {
      userProgress.users[winnerId].solved_en = [];
    }

    userProgress.users[winnerId].solved_bg = userProgress.users[
      winnerId
    ].solved_bg.filter((id) => id !== null);
    userProgress.users[winnerId].solved_en = userProgress.users[
      winnerId
    ].solved_en.filter((id) => id !== null);

    if (
      !userProgress.users[winnerId][`solved_${this.language}`].includes(
        this.wordData.bg
      ) &&
      this.wordData.bg !== null
    ) {
      userProgress.users[winnerId][`solved_${this.language}`].push(
        this.wordData.bg
      );
      saveUserProgress(userProgress);
    }

    const solvedCount =
      userProgress.users[winnerId][`solved_${this.language}`].length;
    const totalWords = getTotalWordsCount();
    const progressText = `${solvedCount}/${totalWords} words solved`;

    const embed = new EmbedBuilder()
      .setDescription(`🎉 <@${winner.id}> won!`)
      .addFields(
        {
          name: "Word",
          value: `${this.wordData.bg} ➡️ ${this.wordData.en}`,
          inline: true,
        },
        { name: "Time", value: `${timeTaken} seconds`, inline: true },
        { name: "Progress", value: progressText, inline: true }
      )
      .setColor("#b300ff")
      .setFooter({ text: "Want to play again? Click the button below!" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
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
        .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
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

    const parts = customId.split("_");
    const language = parts[2];
    const originalUserId = parts[3];
    const currentUserId = interaction.user.id;

    await interaction.reply({
      content: "New round!",
    });

    const game = new WordGame(channelId, language, interaction);
    game.userId = currentUserId;
    activeGames.set(channelId, game);
    await game.start();
  }
};
