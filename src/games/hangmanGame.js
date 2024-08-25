import fs from "fs/promises";
import path from "path";
import { EmbedBuilder } from "discord.js";
import { activeGames, setGameActive, removeGame } from "./gameUtils.js";

const WORD_TYPES = ["adjectives", "nouns", "verbs"];
const MAX_INCORRECT_GUESSES = 7;

const HANGMAN_STAGES = [
  `
 🥶
 /|\\
 / \\  
 `,
  `
       
      
      
      
      
      
=========
`,
  `
       
      
      
      |
      |
      |
=========
`,
  `
  +---+
      |
      |
      |
      |
      |
========
`,
  `
  +---+
  |   |
      |
      |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========
`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========   
`,
  `
  +---+
  |   |
 💀   |
 /|\\   |
 / \\   |
       |
=========           
`,
];

export class HangmanGame {
  constructor(channelId) {
    this.channelId = channelId;
    this.word = "";
    this.guessedLetters = new Set();
    this.incorrectGuesses = 0;
    this.wordType = "";
  }

  async start() {
    await this.chooseRandomWord();
    setGameActive(this.channelId, this);
    return this.getGameEmbed();
  }

  async chooseRandomWord() {
    const wordType = WORD_TYPES[Math.floor(Math.random() * WORD_TYPES.length)];
    const filePath = path.join(
      process.cwd(),
      "resources",
      "wordlists",
      "all",
      `${wordType}.txt`
    );
    const words = await fs.readFile(filePath, "utf-8");
    const wordList = words.split("\n").filter((word) => word.trim() !== "");
    this.word = wordList[Math.floor(Math.random() * wordList.length)]
      .trim()
      .toLowerCase();
    this.wordType = wordType.slice(0, -1);
  }

  guess(letter, user_id) {
    letter = letter.toLowerCase();
    if (this.guessedLetters.has(letter)) {
      return {
        status: "already_guessed",
        embed: this.getDuplicateGuessEmbed(letter),
      };
    }

    this.guessedLetters.add(letter);

    if (!this.word.includes(letter)) {
      this.incorrectGuesses++;
      if (this.incorrectGuesses >= MAX_INCORRECT_GUESSES) {
        return { status: "game_over", embed: this.getGameOverEmbed() };
      }
    }

    if (this.isWordGuessed()) {
      return { status: "win", embed: this.getWinEmbed(user_id) };
    }

    return { status: "continue", embed: this.getGameEmbed() };
  }

  guessWord(word, user_id) {
    if (word.toLowerCase() === this.word) {
      return { status: "win", embed: this.getWinEmbed(user_id) };
    }
    return { status: "ignore" };
  }

  isWordGuessed() {
    return [...this.word].every((letter) => this.guessedLetters.has(letter));
  }

  getGameEmbed() {
    const embed = new EmbedBuilder()
      .setTitle(this.wordType.charAt(0).toUpperCase() + this.wordType.slice(1))
      .setDescription(this.getWordProgress())
      .addFields(
        {
          name: " ",
          value: "```" + HANGMAN_STAGES[this.incorrectGuesses] + "```",
        },
        {
          name: "Guessed Letters",
          value: [...this.guessedLetters].join(", ") || "None",
        }
      )
      .setColor("#0099ff");
    return embed;
  }

  getGameOverEmbed() {
    const embed = new EmbedBuilder()
      .setTitle("Game Over!")
      .setDescription(`The word was: ${this.word}`)
      .addFields({
        name: " ",
        value: "```" + HANGMAN_STAGES[HANGMAN_STAGES.length - 1] + "```",
      })
      .setColor("#ff0000");
    return embed;
  }

  getWinEmbed(user_id) {
    const embed = new EmbedBuilder()
      .setTitle("Congratulations!")
      .setDescription(`<@${user_id}>  guessed the word: ${this.word}`)
      .setColor("#00ff00");
    return embed;
  }

  getDuplicateGuessEmbed(letter) {
    const embed = new EmbedBuilder()
      .setTitle("Duplicate Guess")
      .setDescription(`The letter '${letter}' was already guessed!`)
      .setColor("#FFA500");
    return embed;
  }

  getWordProgress() {
    return [...this.word]
      .map((letter) => (this.guessedLetters.has(letter) ? letter : "▨"))
      .join(" ");
  }
}
