import dotenv from "dotenv";
dotenv.config();

import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

import { sendInfoEmbed } from "./embeds/info.js";
import { sendRulesEmbed } from "./embeds/rules.js";
import { handleHangmanMessage } from "./commands/game/hangman.js";

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
        name: `bulgarian radio`,
        type: ActivityType.Listening,
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

  await handleHangmanMessage(message);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;
  const { commandName } = interaction;

  /*
  User commands
  */
  switch (commandName) {
    case "word":
      await wordCommand.execute(interaction);
      return;
    case "stress":
      await stressCommand.execute(interaction);
      return;
    case "to-cyrillic":
      await toCyrillicCommand.execute(interaction);
      return;
    case "translate":
      await translateCommand.execute(interaction);
      return;
    case "help":
      await helpCommand.execute(interaction);
      return;
    case "resources":
      await resourcesCommand.execute(interaction);
      return;
    case "books":
      await booksCommand.execute(interaction);
      return;
    case "alphabet":
      await alphabetCommand.execute(interaction);
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


client.login(process.env.TOKEN);
