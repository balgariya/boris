import axios from "axios";
import { currentAIModel } from "./config.js";

export async function requestAI(
  prompt,
  maxRetriesBG = 2,
  maxRetriesDefault = 3,
  model = null
) {
  if (!model) model = currentAIModel;

  if (model === "google/gemma-2-27b-it") {
    let retriesBG = 0;

    while (retriesBG < maxRetriesBG) {
      try {
        const together = new Together({
          apiKey: process.env.BG_API_KEY,
        });

        const response = await together.chat.completions.create({
          model: process.env.BG_API || "google/gemma-2-27b-it",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        });

        return response.choices[0].message.content;
      } catch (error) {
        retriesBG++;

        console.warn(
          `Bulgarian AI request failed (attempt ${retriesBG}/${maxRetriesBG})`
        );

        if (retriesBG < maxRetriesBG) {
          const delay = 1000 * Math.pow(2, retriesBG - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    console.log(
      "Gemma model failed after maximum retries, switching to default AI model"
    );
    model = null;
  }

  let retriesDefault = 0;

  while (retriesDefault <= maxRetriesDefault) {
    try {
      const response = await axios.post(
        process.env.AI_ENDPOINT,
        {
          model: model || process.env.AI_MODEL,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.AI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      retriesDefault++;

      if (retriesDefault > maxRetriesDefault) {
        console.error(
          "Default AI generation error after maximum retries:",
          error
        );
        return "An error occurred while generating the response.";
      }

      console.warn(
        `Default AI request failed (attempt ${retriesDefault}/${maxRetriesDefault}), retrying... Model: ${model}, endpoint: ${process.env.AI_ENDPOINT}`
      );

      const delay = 1000 * Math.pow(2, retriesDefault - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
