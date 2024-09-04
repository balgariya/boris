import { HangmanGame } from "../../games/hangmanGame.js";
import {
  isGameActive,
  getGameState,
  removeGame,
} from "../../games/gameUtils.js";

const HANGMAN_CHANNELS = ["1276966735735689237"];

export async function handleHangmanMessage(message) {
  if (!HANGMAN_CHANNELS.includes(message.channel.id)) return;

  const content = message.content.trim().toLowerCase();

  if (content === "start" || content === "старт") {
    if (isGameActive(message.channel.id)) {
      message.reply("A game is already in progress!");
      return;
    }
    const game = new HangmanGame(message.channel.id);
    const embed = await game.start();
    message.channel.send({ embeds: [embed] });
    return;
  }

  if (!isGameActive(message.channel.id)) return;

  const game = getGameState(message.channel.id);
  if (game.waitingForResult) return;
    if (content.length === 1) {
      const result = await game.guess(content, message.author.id);
      handleGameResult(result, message);
    } else if (content.length > 1) {
      const result = await game.guessWord(content, message.author.id);
      if (result.status !== "ignore") {
        handleGameResult(result, message);
      }
    }
}

function handleGameResult(result, message) {
  if (result.embed) {
    message.channel.send({ embeds: [result.embed] });
  }

  if (result.status === "win" || result.status === "game_over") {
    removeGame(message.channel.id);
    setTimeout(() => {
      const newGame = new HangmanGame(message.channel.id);
      newGame.start().then((embed) => {
        message.channel.send({ embeds: [embed] });
      });
    }, 5000);
  }
}
