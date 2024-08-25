import fs from "fs/promises";
import path from "path";
import { EmbedBuilder } from "discord.js";
import { activeGames, setGameActive, removeGame } from "./gameUtils.js";

import { gpt } from "gpti";

const WORD_TYPES = ["adjectives", "nouns"];
const MAX_INCORRECT_GUESSES = 8;

const HANGMAN_STAGES = [
  `
                       
          👀
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
         |   |
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
        💀  |
        /|\\ |
        / \\ |
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

  async guess(letter, user_id) {
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
        return { status: "game_over", embed: await this.getGameOverEmbed() };
      }
    }

    if (this.isWordGuessed()) {
      return { status: "win", embed: await this.getWinEmbed(user_id) };
    }

    return { status: "continue", embed: await this.getGameEmbed() };
  }

  async guessWord(word, user_id) {
    if (word.toLowerCase() === this.word) {
      return { status: "win", embed: await this.getWinEmbed(user_id) };
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

  async getGameOverEmbed() {
    try {
      const translation = await askGPT(
        "You act like google translate. Translate the following word into English and add a small note in () after the translation for the meaning of the word. Respond with the translation and the meaning only, without any additional text or symbols. Here is the word: " +
          this.word
      );

      const embed = new EmbedBuilder()
        .setTitle("Game Over!")
        .setDescription(`The word was: ${this.word}`)
        .addFields(
          {
            name: "Meaning (Source: ChatGPT)",
            value: "-# " + translation,
          },
          {
            name: " ",
            value: "```" + HANGMAN_STAGES[HANGMAN_STAGES.length - 1] + "```",
          }
        )
        .setColor("#ff0000");

      return embed;
    } catch (error) {
      return new EmbedBuilder()
        .setTitle("Game Over!")
        .setDescription(`The word was: ${this.word}`)
        .addFields({
          name: " ",
          value: "```" + HANGMAN_STAGES[HANGMAN_STAGES.length - 1] + "```",
        })
        .setColor("#ff0000");
    }
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

async function askGPT(prompt) {
  return new Promise((resolve, reject) => {
    gpt(
      {
        prompt: prompt,
        model: "GPT-4",
        markdown: false,
      },
      (err, data) => {
        if (err != null) {
          console.log(err);
          reject("An error occurred!");
        } else {
          resolve(data.gpt);
        }
      }
    );
  });
}
