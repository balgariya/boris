import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { EmbedBuilder } from "discord.js";
import { requestAI } from "./ai-request.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const topicsPath = path.join(__dirname, "../../resources/topics.txt");

export async function handleGenerateCommand(message) {
  if (message.channel.id !== "1354474501072748695") return;

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

    let prompt = `Generate a random English sentence (only answer with the sentence) about this topic/situation for language learners: ${randomTopic}.`;

    if (parts.length > 1) {
      const levelParam = parts.slice(1).join(" ");
      prompt = `Generate a random English sentence (only answer with the sentence) about this topic/situation for language learners. The sentence should use vocabulary and grammar suitable for the following language level: ${levelParam}. Please use simpler words, simpler sentence structure, and keep it concise if the level is beginner (e.g., a1 or a2). Topic: ${randomTopic}.`;
    }

    await message.channel.sendTyping();

    const response = await requestAI(prompt, 3, 2, "openai/gpt-4o-mini");

    if (!response || response.trim().length === 0) {
      return message.reply(
        "The AI returned an empty response or something went wrong!"
      );
    }

    if (response.length > 2000) {
      return message.reply("The generated sentence is too long to display.");
    }

    const embed = new EmbedBuilder()
      .setTitle("Translate this into Bulgarian")
      .setColor(0x00ff00)
      .setDescription(`### ${response}`);

    embed.setFooter({
      text: "A native speaker will review your translation (If you are lucky)",
    });

    await message.channel.send({ embeds: [embed] });
  } catch (error) {
    console.error("Error in handleGenerateCommand:", error);
    message.reply("An error occurred while generating the sentence.");
  }
}
