import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(__dirname, "../../resources/word_game.json");
const userProgressPath = path.join(
  __dirname,
  "../../resources/user_progress.json"
);

export const loadUserProgress = () => {
  try {
    if (fs.existsSync(userProgressPath)) {
      const data = JSON.parse(fs.readFileSync(userProgressPath, "utf8"));
      if (data && data.users) {
        let needsSaving = false;
        Object.keys(data.users).forEach((userId) => {
          if (data.users[userId].solved_bg) {
            const filteredBg = data.users[userId].solved_bg.filter(
              (id) => id !== null
            );
            if (filteredBg.length !== data.users[userId].solved_bg.length) {
              data.users[userId].solved_bg = filteredBg;
              needsSaving = true;
            }
          }
          if (data.users[userId].solved_en) {
            const filteredEn = data.users[userId].solved_en.filter(
              (id) => id !== null
            );
            if (filteredEn.length !== data.users[userId].solved_en.length) {
              data.users[userId].solved_en = filteredEn;
              needsSaving = true;
            }
          }
        });
        if (needsSaving) {
          saveUserProgress(data);
        }
      }
      return data;
    }
    return { users: {} };
  } catch (error) {
    console.error("Error loading user progress:", error);
    return { users: {} };
  }
};

export const saveUserProgress = (progress) => {
  try {
    fs.writeFileSync(userProgressPath, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error("Error saving user progress:", error);
  }
};

export const getTotalWordsCount = () => {
  try {
    const rawData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(rawData).words.length;
  } catch (error) {
    console.error("Error getting total words count:", error);
    return 0;
  }
};

export const getRandomWord = (language, userId) => {
  try {
    const rawData = fs.readFileSync(dataPath, "utf8");
    const wordList = JSON.parse(rawData).words;

    const userProgress = loadUserProgress();
    if (!userProgress.users[userId]) {
      userProgress.users[userId] = {
        solved_bg: [],
        solved_en: [],
      };
    }
    if (!Array.isArray(userProgress.users[userId].solved_bg)) {
      userProgress.users[userId].solved_bg = [];
    }
    if (!Array.isArray(userProgress.users[userId].solved_en)) {
      userProgress.users[userId].solved_en = [];
    }
    userProgress.users[userId].solved_bg = userProgress.users[
      userId
    ].solved_bg.filter((id) => id !== null);
    userProgress.users[userId].solved_en = userProgress.users[
      userId
    ].solved_en.filter((id) => id !== null);
    saveUserProgress(userProgress);

    const solvedWords = userProgress.users[userId][`solved_${language}`];
    let availableWords = wordList.filter(
      (word) => !solvedWords.includes(word.bg)
    );
    if (availableWords.length === 0) {
      availableWords = wordList;
    }
    return availableWords[Math.floor(Math.random() * availableWords.length)];
  } catch (error) {
    console.error("Error getting random word:", error);
    return null;
  }
};

export const getAllWords = () => {
  try {
    const rawData = fs.readFileSync(dataPath, "utf8");
    return JSON.parse(rawData).words;
  } catch (error) {
    console.error("Error getting all words:", error);
    return [];
  }
};
