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
import { leaderboardCommand } from "./commands/user/leaderboard.js";

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
  if (member.guild.id !== "658655311028289551") return;
  try {
    if (!chatChannel) return;

    const prompt = `You are a friendly assistant on the Learn Bulgarian Discord server. 
      Write a short, welcoming message for a new user 
      Keep it informal, use modern english and very short. 
      Include one :flag_bg: emoji. No other emojis.
      Start the message with Здравей <@${member.id}>!\n Welcome to Learn Bulgarian...
      Include that has to choose roles in <#702981252948426872> and read rules in <#658658532786176022> 
      and don't forget to tell us about yourself in <#692855267540598784>.`;

    const aiResponse = await requestAI(prompt, 3);

    const welcomeMessage = `\n${aiResponse}\nPlease read our <#658658532786176022> and don't forget to tell us about yourself in <#692855267540598784>.`;

    await chatChannel.send(
      aiResponse +
        '\n-# PS: You can always chat with me by including "Boris" in your message.'
    );
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.guild?.id !== "658655311028289551") return;

  try {
    const filterTriggered = await handleContentFilter(message);
    if (filterTriggered) return;
  } catch {
    error;
  }

  if (
    message.mentions.has(client.user) ||
    message.content.toLowerCase().includes("slavi") ||
    message.content.toLowerCase().includes("boris") ||
    message.content.toLowerCase().includes("борис")
  ) {
    try {
      await handleBotMention(message);
    } catch {
      error;
    }
    return;
  }

  if (message.author.username == "maximde" && message.content == "!rules") {
    sendRulesEmbed(message.channel);
  }
});

async function handleContentFilter(message) {
  if (message.guild?.id !== "658655311028289551") return false;

  const blockedWords = [
    "*discord.gg*",
    "*discord.gift*",
    "*invite*",
    "kys",
    "nigga",
    "niggars",
    "niggas",
    "nigge",
    "niggers",
    "nude",
    "nudes",
    "porno",
    "hure",
    "*neger*",
    "negerlein",
    "negerchen",
    "*nigga*",
    "nutte",
    "pornhub",
    "Курва",
    "Кучи син",
    "Мърша",
    "Лайнар",
    "Ебалник",
    "Еби се",
    "Путка майна",
    "Шибаняк",
    "Педераст",
    "негър",
    "негърче",
    "heil hitler",
    "nega",
    "dreckskind",
    "sonofabitch",
    "fuckface",
    "shithead",
    "dickweed",
    "asshat",
    "kiddo",
    "kiddi",
    "kiddie",
    "ficker",
    "opfer",
    "idiot",
    "negger",
    "schwanz",
    "adolfhitler",
    "hitler",
    "heilhitler",
    "heihitler",
    "hurensohn",
    "hurenson",
    "fotse",
    "hundesohn",
    "sex",
    "coc",
    "fick",
    "fickk",
    "nigra",
    "wixxer",
    "huan",
    "huansohn",
    "pimel",
    "pimellutscher",
    "pimelutscher",
    "nutensohn",
    "schwantz",
    "schwans",
    "fettesau",
    "missgeburt",
    "mistgeburt",
    "negageburt",
    "nuttä",
    "nuttte",
    "schwul",
    "schwule",
    "fette",
    "nitro gift",
    "20$ from steam",
    "@everyone",
    "fetter",
    "arsch",
    "wixer",
    "педерас",
    "dickhead",
    "dirtbag",
    "nuttensohn",
  ];

  const contentLower = message.content.toLowerCase();

  for (const word of blockedWords) {
    if (word.includes("*")) {
      const cleanWord = word.replace(/\*/g, "");
      const regex = new RegExp(`${cleanWord}`, "gi");
      if (regex.test(contentLower)) {
        try {
          await message.delete();
          await message.member.timeout(60 * 1000);
        } catch (error) {}

        const botMessage = await message.channel.send(
          `${message.author}, това не е ОК!`
        );
        setTimeout(() => botMessage.delete().catch(() => {}), 30 * 1000);
        return true;
      }
    } else {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(contentLower)) {
        try {
          await message.delete();
          await message.member.timeout(60 * 1000);
        } catch (error) {}

        const botMessage = await message.channel.send(
          `${message.author}, това не е ОК!`
        );
        setTimeout(() => botMessage.delete().catch(() => {}), 30 * 1000);
        return true;
      }
    }
  }

  return false;
}

async function handleBotMention(message) {
  try {
    const pingRegex = new RegExp(`<@!?${client.user.id}>`, "g");
    let cleanContent = message.content.replace(pingRegex, "").trim();
    cleanContent = cleanContent.replace(/slavi/i, "").trim();
    cleanContent = cleanContent.replace(/boris/i, "").trim();
    cleanContent = cleanContent.replace(/борис/i, "").trim();
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

    const prompt = `You are a human assistant (named boris) made by Maxim on Discord (Bulgarian language server). Act natural and human-like.
      The current date is ${formattedDate}.
      Here are the server rules <#658658532786176022>
      Use modern correct Bulgarian language
      You're not a language model or AI.
      Fenix (aka fenix.here) is admin on the server
      Do not use normal emojis
      You can only use these new emojis (write them exactly like this): :pain:, :gotcha:, :dumb:, :think:, :brain:, :eyes:, :cool:, :shushing:
      Keep your answers very short and match the language of the last message.
      Current channel: ${message.channel.name}
      Use informal language, slang and fitting jokes when appropriate.
      
      Recent chat context:
      ${messageContext || "No recent messages"}

      Do not greet the user below if in the chat context that user is mentioned
      
      User ${message.author.username} just mentioned you: ${cleanContent}`;

    let response = await requestAI(prompt, 3);
    response = response
      .replace(":pain:", "<:pain:722774554233274450>")
      .replace(":gotcha:", "<:gotcha:722775690109386772>")
      .replace(":dumb:", "<:facepalm:722774521710510080>")
      .replace(":think:", "<:think:724561291594825769>")
      .replace(":eyes:", "<:eyes:722774906630045816>")
      .replace(":cool:", "<:shushing_slavi_theclashers:1276520372702941204>")
      .replace(
        ":shushing:",
        "<:shushing_slavi_theclashers:1276520372702941204>"
      )
      .replace(":brain:", "<:bigbrain:724560906926817301>");
    await message.reply(response);
  } catch (error) {
    console.error("Error handling bot mention:", error);
    message.reply("Sorry, I'm having brain issues rn.");
  }
}

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
    case "leaderboard":
      await executeCommandSafely(leaderboardCommand.execute, interaction);
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
