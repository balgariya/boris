import { EmbedBuilder } from "discord.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const userProgressPath = path.join(
  __dirname,
  "../../../resources/user_progress.json"
);
const dataPath = path.join(__dirname, "../../../resources/word_game.json");

const loadUserProgress = () => {
  try {
    if (fs.existsSync(userProgressPath)) {
      const data = JSON.parse(fs.readFileSync(userProgressPath, "utf8"));
      return data;
    }
    return { users: {} };
  } catch (error) {
    console.error("Error loading user progress:", error);
    return { users: {} };
  }
};

const getTotalWordsCount = () => {
  try {
    const rawData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(rawData).words.length;
  } catch (error) {
    console.error("Error getting total words count:", error);
    return 0;
  }
};

export const leaderboardCommand = {
  data: {
    name: "leaderboard",
    type: 1,
    description: "Show the top 10 players with most solved words",
    options: [
      {
        name: "hidden",
        description: "Do you want to hide the leaderboard from others?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },

  async execute(interaction) {
    const hidden = interaction.options.getBoolean("hidden") ?? false;
    await interaction.deferReply({ ephemeral: hidden });

    const userProgress = loadUserProgress();
    if (!userProgress.users || Object.keys(userProgress.users).length === 0) {
      await interaction.editReply("No users have played the word game yet!");
      return;
    }

    const userStats = [];
    for (const userId in userProgress.users) {
      const user = userProgress.users[userId];
      const bgCount = Array.isArray(user.solved_bg) ? user.solved_bg.length : 0;
      const enCount = Array.isArray(user.solved_en) ? user.solved_en.length : 0;
      const totalCount = bgCount + enCount;

      let username = "Unknown User";
      try {
        const member = await interaction.guild.members.fetch(userId);
        username = member.user.username;
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      }

      userStats.push({
        userId,
        username,
        totalCount,
        bgCount,
        enCount,
      });
    }

    userStats.sort((a, b) => b.totalCount - a.totalCount);

    const topUsers = userStats.slice(0, 10);
    const totalWords = getTotalWordsCount();

    const embed = new EmbedBuilder()
      .setTitle("🏆 Word Game Leaderboard 🏆")
      .setDescription("Top 10 players with the most solved words")
      .setColor("#ffd700")
      .setFooter({ text: `Total words in dictionary: ${totalWords}` });

    topUsers.forEach((user, index) => {
      const medal =
        index === 0
          ? "🥇"
          : index === 1
          ? "🥈"
          : index === 2
          ? "🥉"
          : `${index + 1}.`;
      embed.addFields({
        name: `${medal} ${user.username}`,
        value: `Total: **${user.totalCount}** (BG: ${user.bgCount}, EN: ${user.enCount})`,
        inline: false,
      });
    });

    await interaction.editReply({ embeds: [embed] });
  },
};
