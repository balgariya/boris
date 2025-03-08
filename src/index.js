import dotenv from "dotenv";
dotenv.config();

import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";
import { wordCommand } from "./commands/user/word.js";
import { stressCommand } from "./commands/user/stress.js";
import { toCyrillicCommand } from "./commands/user/to_cyrillic.js";
import {
  translateCommand,
  translateMessageCommand,
} from "./commands/user/translate.js";
import { helpCommand } from "./commands/user/help.js";
import { resourcesCommand } from "./commands/user/resources.js";
import { booksCommand } from "./commands/user/books.js";
import { alphabetCommand } from "./commands/user/alphabet.js";
import { checkCommand, checkMessageCommand } from "./commands/user/sentence.js";
import { sendRulesEmbed } from "./embeds/rules.js";
import { bgjargonCommand } from "./commands/user/bgjargon.js";
import { aiCommand, aiMessageCommand } from "./commands/user/ai.js";

import {
  wordGameCommand,
  handleWordGameButton,
} from "./commands/user/wordgame.js";
import { requestAI } from "./utils/aiRequest.js";
import { dictionaryCommand } from "./commands/user/dictionary.js";

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
  ],
});

client.once(Events.ClientReady, async (c) => {
  console.log("Bot with name " + client.user.username + " is running!");

  client.user.setPresence({
    activities: [
      {
        name: `Слави Клашъра`,
        type: ActivityType.Watching,
      },
    ],
    status: "online",
  });
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (
    message.mentions.has(client.user) ||
    message.content.toLowerCase().includes("slavi") ||
    message.content.toLowerCase().includes("boris")
  ) {
    await handleBotMention(message);
    return;
  }

  if (message.author.username == "maximde" && message.content == "!rules") {
    sendRulesEmbed(message.channel);
  }
});

async function handleBotMention(message) {
  try {
    const pingRegex = new RegExp(`<@!?${client.user.id}>`, "g");
    let cleanContent = message.content.replace(pingRegex, "").trim();
    cleanContent = cleanContent.replace(/slavi/i, "").trim();
    cleanContent = cleanContent.replace(/boris/i, "").trim();
    message.channel.sendTyping();

    const contextMessages = await message.channel.messages.fetch({ limit: 4 });
    const messageContext = contextMessages
      .filter((msg) => msg.id !== message.id && !msg.author.bot)
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .map((msg) => `${msg.author.username}: ${msg.content}`)
      .slice(-3)
      .join("\n");

    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = day + ". " + months[monthIndex] + " " + year;

    const prompt = `You are a bot assistant (named boris) made by Maxim on Discord (Bulgarian language server). Act natural and human-like.
      The current date is ${formattedDate}.
      You're like an Indian guy who loves languages. You're not a language model or AI.
      Fenix (aka fenix.here) is admin on the server
      Use text emojis like :D, :), <3, (-:, -_-, T-T, xD instead of unicode emojis.
      You can also use these new emojis: :pain:, :gotcha:, :facepalm:, :think:, :bigbrain:
      Vary your emoji usage and don't repeat the same one.
      Keep your answers concise and match the language of the question.
      Current channel: ${message.channel.name}
      Use informal language and slang when appropriate.
      
      Recent chat context:
      ${messageContext || "No recent messages"}
      
      User ${message.author.username} just mentioned you: ${cleanContent}`;

    let response = await requestAI(prompt, 3);
    response = response
      .replace(":pain:", "<:pain:722774554233274450>")
      .replace(":gotcha:", "<:gotcha:722775690109386772>")
      .replace(":facepalm:", "<:facepalm:722774521710510080>")
      .replace(":think:", "<:think:724561291594825769>")
      .replace(":bigbrain:", "<:bigbrain:724560906926817301>");
    await message.reply(response);
  } catch (error) {
    console.error("Error handling bot mention:", error);
    message.reply("Sorry, I'm having brain issues rn.");
  }
}

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (interaction.customId.startsWith("wordgame_again_")) {
      await executeCommandSafely(handleWordGameButton, interaction);
      return;
    }
  }

  if (interaction.isMessageContextMenuCommand()) {
    const { commandName } = interaction;

    switch (commandName) {
      case "Translate Message":
        await executeCommandSafely(
          translateMessageCommand.execute,
          interaction
        );
        return;
      case "Check Grammar":
        await executeCommandSafely(checkMessageCommand.execute, interaction);
        return;
      case "Ask AI About This":
        await executeCommandSafely(aiMessageCommand.execute, interaction);
        return;
    }
  }

  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  /*
  User commands
  */
  switch (commandName) {
    case "word":
      await executeCommandSafely(wordCommand.execute, interaction);
      return;
    case "stress":
      await executeCommandSafely(stressCommand.execute, interaction);
      return;
    case "to-cyrillic":
      await executeCommandSafely(toCyrillicCommand.execute, interaction);
      return;
    case "translate":
      await executeCommandSafely(translateCommand.execute, interaction);
      return;
    case "help":
      await executeCommandSafely(helpCommand.execute, interaction);
      return;
    case "resources":
      await executeCommandSafely(resourcesCommand.execute, interaction);
      return;
    case "books":
      await executeCommandSafely(booksCommand.execute, interaction);
      return;
    case "alphabet":
      await executeCommandSafely(alphabetCommand.execute, interaction);
      return;
    case "sentence":
      await executeCommandSafely(checkCommand.execute, interaction);
      return;
    case "bgjargon":
      await executeCommandSafely(bgjargonCommand.execute, interaction);
      return;
    case "ai":
      await executeCommandSafely(aiCommand.execute, interaction);
      return;
    case "wordgame":
      await executeCommandSafely(wordGameCommand.execute, interaction);
      return;
    case "dictionary":
      await executeCommandSafely(dictionaryCommand.execute, interaction);
      return;
  }

  /*if (user check / role check) {
    interaction.reply({
      content: "Sorry but you dont have the permission to use this command!",
      ephemeral: true,
    });
    return;
  }*/

  /*
  Admin commands
  (Admin role required)
  */
  switch (commandName) {
    case "aaaaaaaaaa":
      return;
  }
});

async function executeCommandSafely(commandExecute, interaction) {
  try {
    await commandExecute(interaction);
  } catch (error) {
    console.error(
      `Error executing command '${interaction.commandName}':`,
      error
    );

    if (interaction.deferred || interaction.replied) {
      await interaction
        .followUp({
          content: "Sorry, there was an error executing this command.",
          ephemeral: true,
        })
        .catch(console.error);
    } else {
      await interaction
        .reply({
          content: "Sorry, there was an error executing this command.",
          ephemeral: true,
        })
        .catch(console.error);
    }
  }
}

client.login(process.env.TOKEN);
