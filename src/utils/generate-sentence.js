import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  ContainerBuilder,
  ButtonBuilder,
  ButtonStyle,
  TextDisplayBuilder,
  MessageFlags,
  ActionRowBuilder,
} from "discord.js";
import { requestAI } from "./ai-request.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const topicsPath = path.join(__dirname, "../../resources/topics.txt");

export async function handleGenerateCommand(message) {
  if (
    message.channel.id !== "1354474501072748695" &&
    message.channel.id !== "1354753428248858737" &&
    message.channel.id !== "1357798265038573773"
  )
    return;

  const parts = message.content.trim().split(/\s+/);

  if (parts[0] !== "!generate") return;

  try {
    const topicsData = fs.readFileSync(topicsPath, "utf-8");
    const topics = topicsData
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (topics.length === 0) {
      return message.reply("No topics available to generate a sentence.");
    }

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];

    let prompt = "";
    let language = message.channel.id == "1357798265038573773" ? "Greek" : "English";
    let levelParam = "";

    if (parts.length > 2) {
      levelParam = parts[1];
      language = parts[2];
      prompt = `Generate a random ${language} sentence (only answer with the sentence) about this topic/situation for language learners. The sentence should use vocabulary and grammar suitable for the following language level: ${levelParam}. Please use simpler words, simpler sentence structure, and keep it concise if the level is beginner (e.g., a1 or a2). Topic: ${randomTopic}.`;
    } else if (parts.length > 1) {
      levelParam = parts[1];
      prompt = `Generate a random ${language} sentence (only answer with the sentence) about this topic/situation for language learners. The sentence should use vocabulary and grammar suitable for the following language level: ${levelParam}. Please use simpler words, simpler sentence structure, and keep it concise if the level is beginner (e.g., a1 or a2). Topic: ${randomTopic}.`;
    } else {
      prompt = `Generate a random ${language} sentence (only answer with the sentence) about this topic/situation for language learners: ${randomTopic}.`;
    }

    await message.channel.sendTyping();

    const response = await requestAI(prompt, 3, "openai/gpt-4o-mini");

    if (!response || response.trim().length === 0) {
      return message.reply(
        "The AI returned an empty response or something went wrong!"
      );
    }

    if (response.length > 2000) {
      return message.reply("The generated sentence is too long to display.");
    }

    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent(
      `**Translate this ${language} sentence into Bulgarian**`
    );

    const sentenceText = new TextDisplayBuilder().setContent(`## ${response}`);

    container.addTextDisplayComponents(titleText, sentenceText);

    const footerText = new TextDisplayBuilder().setContent(
      "-# A native speaker will review your translation (If you are lucky)\n"
    );

    const spoiler = await requestAI(
      `Translate the following ${language} sentence into Bulgarian: ${response}`,
      2
    );

    const spoilerWords = spoiler
      .split(" ")
      .map((word) => `||${word}||`)
      .join(" ");
    const spoilerText = new TextDisplayBuilder().setContent(
      "-# Spoiler translation:\n" + spoilerWords
    );

    container.addTextDisplayComponents(spoilerText, footerText);

    await message.channel.send({
      flags: MessageFlags.IsComponentsV2,
      components: [container],
    });
  } catch (error) {
    console.error("Error in handleGenerateCommand:", error);
    message.reply("An error occurred while generating the sentence.");
  }
}
