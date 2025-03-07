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

  if (message.author.username == "maximde" && message.content == "!rules") {
    sendRulesEmbed(message.channel);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isMessageContextMenuCommand()) {
    const { commandName } = interaction;

    switch (commandName) {
      case "Translate Message":
        await executeCommandSafely(
          translateMessageCommand.execute,
          interaction
        );
        return;
      case "Check Bulgarian Grammar":
        await executeCommandSafely(checkMessageCommand.execute, interaction);
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
