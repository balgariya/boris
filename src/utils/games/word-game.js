import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import { activeGames } from "./game-storage.js";
import {
  loadUserProgress,
  saveUserProgress,
  getTotalWordsCount,
  getRandomWord,
} from "../file-utils.js";

export class WordGame {
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
    this.wordData = getRandomWord(this.language, this.userId);
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
