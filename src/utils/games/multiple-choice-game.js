import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
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
    const row = new ActionRowBuilder().addComponents(...buttons);

    const embed = new EmbedBuilder()
      .setTitle("Multiple Choice Translation Game")
      .setDescription(
        `Translate the following word into ${targetLanguageName}:\n## \`${
          this.wordData[this.language]
        }\``
      )
      .setColor("#2fb966")
      .setFooter({
        text: "Select one of the options below. One correct answer wins!",
      });

    await this.interaction.editReply({ embeds: [embed], components: [row] });

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
        const successEmbed = new EmbedBuilder()
          .setDescription(`🎉 <@${i.user.id}> guessed correctly!`)
          .addFields({
            name: "Solution",
            value: `${this.wordData[this.language]} ➡️ ${
              this.wordData[targetLang]
            }`,
          })
          .setColor("#2fb966")
          .setFooter({
            text: "Want to play again? Click the button below!",
          });
        const disabledRow = new ActionRowBuilder().addComponents(
          ...buttons.map((btn) => ButtonBuilder.from(btn).setDisabled(true))
        );
        await i.update({ components: [disabledRow] });
        await this.interaction.channel.send({
          embeds: [successEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `wordgame_mc_again_${this.language}_${this.interaction.user.id}`
                )
                .setLabel("Play Again")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
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
        const wrongEmbed = new EmbedBuilder()
          .setDescription(`❌ <@${i.user.id}>, that's not correct!`)
          .setColor("#ff6961");
        await i.reply({ embeds: [wrongEmbed], ephemeral: true });
      }
    });

    this.collector.on("end", async (collected, reason) => {
      if (reason === "time") {
        const timeoutEmbed = new EmbedBuilder()
          .setTitle("Time's Up!")
          .setDescription("Nobody guessed the correct translation.")
          .addFields({
            name: "Solution",
            value: `${this.wordData[this.language]} ➡️ ${
              this.wordData[targetLang]
            }`,
          })
          .setColor("#ff6961")
          .setFooter({
            text: "Want to try again? Click the button below!",
          });
        const disabledRow = new ActionRowBuilder().addComponents(
          ...buttons.map((btn) => ButtonBuilder.from(btn).setDisabled(true))
        );
        await this.interaction.editReply({ components: [disabledRow] });
        await this.interaction.channel.send({
          embeds: [timeoutEmbed],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setCustomId(
                  `wordgame_mc_again_${this.language}_${this.interaction.user.id}`
                )
                .setLabel("Play Again")
                .setStyle(ButtonStyle.Primary)
            ),
          ],
        });
        activeGames.delete(this.channelId);
      }
    });
  }
}
