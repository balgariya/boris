import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  MessageFlags,
} from "discord.js";
import { activeGames } from "./game-storage.js";
import { getAllWords } from "../file-utils.js";

export class MultipleChoiceGame {
  constructor(channelId, language, interaction) {
    this.channelId = channelId;
    this.language = language;
    this.interaction = interaction;
    this.wordData = null;
    this.collector = null;
    this.wrongGuessers = new Set();
  }

  async start() {
    const wordList = getAllWords();
    this.wordData = wordList[Math.floor(Math.random() * wordList.length)];
    const targetLang = this.language === "bg" ? "en" : "bg";
    const targetLanguageName = this.language === "bg" ? "English" : "Bulgarian";
    const correctAnswer = this.wordData[targetLang];

    let incorrectOptions = [];
    while (incorrectOptions.length < 2) {
      const candidate =
        wordList[Math.floor(Math.random() * wordList.length)][targetLang];
      if (
        candidate !== correctAnswer &&
        !incorrectOptions.includes(candidate)
      ) {
        incorrectOptions.push(candidate);
      }
    }
    let options = [correctAnswer, ...incorrectOptions];
    options = options.sort(() => Math.random() - 0.5);

    const buttons = options.map((option, index) => {
      const isCorrect = option === correctAnswer;
      const customId = `wordgame_mc_${this.language}_${
        isCorrect ? "correct" : "wrong"
      }_${index}_${this.interaction.user.id}`;
      return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(option)
        .setStyle(ButtonStyle.Primary);
    });

    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent(
      `# Multiple Choice Translation Game\nTranslate the following word into ${targetLanguageName}:\n## \`${
        this.wordData[this.language]
      }\`\n\n`
    );

    const footerText = new TextDisplayBuilder().setContent(
      "-# Select one of the options below. One correct answer wins!"
    );

    container.addTextDisplayComponents(titleText, footerText);

    container.addActionRowComponents((row) => row.addComponents(...buttons));

    await this.interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });

    const filter = (i) => !i.user.bot;
    this.collector = this.interaction.channel.createMessageComponentCollector({
      filter,
      time: 60000,
    });

    this.collector.on("collect", async (i) => {
      const parts = i.customId.split("_");
      const gameLang = parts[2];
      const type = parts[3];
      if (gameLang !== this.language) return;

      if (type === "correct") {
        if (this.wrongGuessers.has(i.user.id)) {
          await i.reply({
            content: "You already guessed wrongly!",
            ephemeral: true,
          });
          return;
        }

        const disabledContainer = new ContainerBuilder();

        disabledContainer.addTextDisplayComponents(titleText, footerText);

        disabledContainer.addActionRowComponents((row) =>
          row.addComponents(
            ...buttons.map((btn) => ButtonBuilder.from(btn).setDisabled(true))
          )
        );

        await i.update({
          components: [disabledContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        const successContainer = new ContainerBuilder();

        const winnerText = new TextDisplayBuilder().setContent(
          `## 🎉 <@${i.user.id}> guessed correctly!`
        );

        const solutionText = new TextDisplayBuilder().setContent(
          `### Solution\n${this.wordData[this.language]} ➡️ ${
            this.wordData[targetLang]
          }`
        );

        const playAgainText = new TextDisplayBuilder().setContent(
          "-# Want to play again? Click the button below!"
        );

        successContainer.addTextDisplayComponents(
          winnerText,
          solutionText,
          playAgainText
        );

        const playAgainButton = new ButtonBuilder()
          .setCustomId(
            `wordgame_mc_again_${this.language}_${this.interaction.user.id}`
          )
          .setLabel("Play Again")
          .setStyle(ButtonStyle.Primary);

        successContainer.addActionRowComponents((row) =>
          row.addComponents(playAgainButton)
        );

        await this.interaction.channel.send({
          components: [successContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        this.collector.stop("guessed");
        activeGames.delete(this.channelId);
      } else if (type === "wrong") {
        if (this.wrongGuessers.has(i.user.id)) {
          await i.reply({
            content: "You already guessed wrongly!",
            ephemeral: true,
          });
          return;
        }
        this.wrongGuessers.add(i.user.id);

        const wrongContainer = new ContainerBuilder();

        const wrongText = new TextDisplayBuilder().setContent(
          `## ❌ <@${i.user.id}>, that's not correct!`
        );

        wrongContainer.addTextDisplayComponents(wrongText);

        await i.reply({
          components: [wrongContainer],
          flags: MessageFlags.IsComponentsV2,
          ephemeral: true,
        });
      }
    });

    this.collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const disabledContainer = new ContainerBuilder();
        disabledContainer.addTextDisplayComponents(titleText, footerText);

        disabledContainer.addActionRowComponents((row) =>
          row.addComponents(
            ...buttons.map((btn) => ButtonBuilder.from(btn).setDisabled(true))
          )
        );

        await this.interaction.editReply({
          components: [disabledContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        const timeoutContainer = new ContainerBuilder();

        const timeoutTitleText = new TextDisplayBuilder().setContent(
          "# Time's Up!\nNobody guessed the correct translation."
        );

        const solutionText = new TextDisplayBuilder().setContent(
          `## Solution\n${this.wordData[this.language]} ➡️ ${
            this.wordData[targetLang]
          }`
        );

        const playAgainText = new TextDisplayBuilder().setContent(
          "-# Want to try again? Click the button below!"
        );

        timeoutContainer.addTextDisplayComponents(
          timeoutTitleText,
          solutionText,
          playAgainText
        );

        const playAgainButton = new ButtonBuilder()
          .setCustomId(
            `wordgame_mc_again_${this.language}_${this.interaction.user.id}`
          )
          .setLabel("Play Again")
          .setStyle(ButtonStyle.Primary);

        timeoutContainer.addActionRowComponents((row) =>
          row.addComponents(playAgainButton)
        );

        await this.interaction.channel.send({
          components: [timeoutContainer],
          flags: MessageFlags.IsComponentsV2,
        });

        activeGames.delete(this.channelId);
      }
    });
  }
}
