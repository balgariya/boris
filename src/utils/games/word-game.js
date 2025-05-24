import {
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
  ButtonBuilder,
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

    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent(
      `# Translation Game\nTranslate the following word into ${targetLanguage}:\n## \`${
        this.wordData[this.language]
      }\`\n\n`
    );

    const footerText = new TextDisplayBuilder().setContent(
      "-# First person to type the correct translation wins!"
    );

    container.addTextDisplayComponents(titleText, footerText);

    await this.interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

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
    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent(
      `# Better Luck Next Time!\nIt seems like <@${user.id}> didn't know the answer! Here's the correct translation:`
    );

    const answerText = new TextDisplayBuilder().setContent(
      `## The correct word was:\n${this.wordData.bg} ➡️ ${this.wordData.en}`
    );

    const footerText = new TextDisplayBuilder().setContent(
      "-# Want to try again? Click the button below!"
    );

    container.addTextDisplayComponents(titleText, answerText, footerText);

    const playAgainButton = new ButtonBuilder()
      .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
      .setLabel("Play Again")
      .setStyle(ButtonStyle.Primary);

    container.addActionRowComponents((row) =>
      row.addComponents(playAgainButton)
    );

    await this.interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

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

    const container = new ContainerBuilder();

    const winnerText = new TextDisplayBuilder().setContent(
      `## 🎉 <@${winner.id}> won!`
    );

    container.addTextDisplayComponents(winnerText);

    const infoText = new TextDisplayBuilder().setContent(
      `### Word\n${this.wordData.bg} ➡️ ${this.wordData.en}\n` +
        `### Time\n${timeTaken} seconds\n` +
        `### Progress\n${progressText}`
    );

    container.addTextDisplayComponents(infoText);

    const footerText = new TextDisplayBuilder().setContent(
      "-# Want to play again? Click the button below!"
    );

    container.addTextDisplayComponents(footerText);

    const playAgainButton = new ButtonBuilder()
      .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
      .setLabel("Play Again")
      .setStyle(ButtonStyle.Primary);

    container.addActionRowComponents((row) =>
      row.addComponents(playAgainButton)
    );

    await this.interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    activeGames.delete(this.channelId);
  }

  async handleTimeout() {
    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent(
      "# Game Over\nTime's up! Nobody guessed the correct translation."
    );

    const answerText = new TextDisplayBuilder().setContent(
      `## The answer was\n${this.wordData.bg} ➡️ ${this.wordData.en}`
    );

    const footerText = new TextDisplayBuilder().setContent(
      "-# Want to try again? Click the button below!"
    );

    container.addTextDisplayComponents(titleText, answerText, footerText);

    const playAgainButton = new ButtonBuilder()
      .setCustomId(`wordgame_again_${this.language}_${this.userId}`)
      .setLabel("Play Again")
      .setStyle(ButtonStyle.Primary);

    container.addActionRowComponents((row) =>
      row.addComponents(playAgainButton)
    );

    await this.interaction.channel.send({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    activeGames.delete(this.channelId);
  }
}
