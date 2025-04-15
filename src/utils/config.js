import fs from "fs";
import path from "path";

const configPath = path.resolve("modelConfig.json");

let currentAIModel;
try {
  const data = fs.readFileSync(configPath, "utf-8");
  const config = JSON.parse(data);
  currentAIModel = config.currentAIModel;
} catch (err) {
  currentAIModel = process.env.AI_MODEL || "openai/gpt-4o-mini";
  fs.writeFileSync(configPath, JSON.stringify({ currentAIModel }, null, 2));
}

function updateModel(newModel) {
  currentAIModel = newModel;
  fs.writeFileSync(configPath, JSON.stringify({ currentAIModel }, null, 2));
}

export { currentAIModel, updateModel };
