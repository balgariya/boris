import axios from "axios";
import { currentAIModel } from "./config.js";

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export async function requestAI(
  prompt,
  maxRetries = 3,
  model = currentAIModel
) {
  const endpoint = process.env.AI_ENDPOINT;
  const apiKey = process.env.AI_API_KEY;
  const aiModel = model || currentAIModel || process.env.AI_MODEL;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data } = await axios.post(
        endpoint,
        {
          model: aiModel,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.8,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return data.choices[0].message.content;
    } catch (err) {
      const isLast = attempt === maxRetries;
      console[isLast ? "error" : "warn"](
        `${isLast ? "Final" : "Retry"} AI request ${
          isLast
            ? "failed"
            : `failed (attempt ${attempt + 1}/${maxRetries + 1})`
        }:`,
        err
      );

      if (isLast) break;
      await sleep(2 ** attempt * 1000);
    }
  }

  return "An error occurred while generating the response.";
}
