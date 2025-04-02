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
import { dictionaryCommand } from "./commands/user/dictionary.js";
import { leaderboardCommand } from "./commands/user/leaderboard.js";
import { handleGenerateCommand } from "./utils/generate-sentence.js";
import { handleBotMention } from "./utils/ai-chat.js";
import { handleContentFilter } from "./utils/content-filter.js";
import { sendWelcomeMessage } from "./utils/welcome-message.js";

let chatChannel;

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.once(Events.ClientReady, async (c) => {
  client.channels.fetch("658661467091894287").then((channel) => {
    chatChannel = channel;
  });

  console.log("Bot with name " + client.user.username + " is running!");

  client.user.setPresence({
    activities: [
      {
        name: "Слави Клашъра",
        type: ActivityType.Streaming,
        url: "https://discord.gg/gnuh77Dxgm",
      },
    ],
    status: "online",
  });
});

client.on(Events.GuildMemberAdd, async (member) => {
  await sendWelcomeMessage(member, chatChannel);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild?.id !== "658655311028289551") return;
  await handleGenerateCommand(message);

  try {
    const filterTriggered = await handleContentFilter(message, client);
    if (filterTriggered) return;
  } catch (error) {
    console.error("Error in content filter:", error);
  }

  if (
    (message.mentions.has(client.user) && message.channelId != "1354474501072748695") ||
    message.content.toLowerCase().includes("slavi") ||
    message.content.toLowerCase().includes("boris") ||
    message.content.toLowerCase().includes("борис")
  ) {
    try {
      await handleBotMention(message, client);
    } catch (error) {
      console.error("Error in bot mention handler:", error);
    }
    return;
  }

  if (message.author.username == "maximde" && message.content == "!rules") {
    sendRulesEmbed(message.channel);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) {
    if (
      interaction.customId.startsWith("wordgame_again_") ||
      interaction.customId.startsWith("wordgame_mc_again_")
    ) {
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
    case "leaderboard":
      await executeCommandSafely(leaderboardCommand.execute, interaction);
      return;
    case "dictionary":
      await executeCommandSafely(dictionaryCommand.execute, interaction);
      return;
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
