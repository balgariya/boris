import { REST, Routes } from "discord.js";
import dotenv from "dotenv";
dotenv.config();
import { wordCommand } from "./commands/user/word.js";
import { stressCommand } from "./commands/user/stress.js";
import { toCyrillicCommand } from "./commands/user/to_cyrillic.js";
import {
  translateCommand,
  translateMessageCommand,
} from "./commands/user/translate.js";
import { checkCommand, checkMessageCommand } from "./commands/user/sentence.js";
import { helpCommand } from "./commands/user/help.js";
import { resourcesCommand } from "./commands/user/resources.js";
import { booksCommand } from "./commands/user/books.js";
import { alphabetCommand } from "./commands/user/alphabet.js";
import { bgjargonCommand } from "./commands/user/bgjargon.js";
import { aiCommand, aiMessageCommand } from "./commands/user/ai.js";
import { wordGameCommand } from "./commands/user/wordgame.js";
import { dictionaryCommand } from "./commands/user/dictionary.js";
import { leaderboardCommand } from "./commands/user/leaderboard.js";
import { modelCommand } from "./commands/user/model.js";
import { clearCommand } from "./commands/user/clear.js";

const rest = new REST().setToken(process.env.TOKEN);

/*rest.put(Routes.applicationCommands("1276797546018377728"), { body: [] })
    .then(() => console.log('Successfully deleted all application commands.'))
    .catch(console.error);*/

const commands = [
  wordCommand.data,
  stressCommand.data,
  toCyrillicCommand.data,
  translateCommand.data,
  translateMessageCommand.data,
  helpCommand.data,
  resourcesCommand.data,
  booksCommand.data,
  alphabetCommand.data,
  checkCommand.data,
  checkMessageCommand.data,
  bgjargonCommand.data,
  aiCommand.data,
  aiMessageCommand.data,
  wordGameCommand.data,
  dictionaryCommand.data,
  leaderboardCommand.data,
  modelCommand.data,
  clearCommand.data
];

rest
  .put(Routes.applicationCommands("1276797546018377728"), { body: commands })
  .then(() => console.log("Successfully created all application commands."))
  .catch(console.error);
