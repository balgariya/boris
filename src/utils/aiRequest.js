import axios from "axios";

export async function requestAI(prompt, maxRetries = 3) {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const response = await axios.post(
        process.env.AI_ENDPOINT,
        {
          model: process.env.AI_MODEL,
          messages: [
            {
              role: "system",
              content: "",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.8,
          max_tokens: 200,
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
      retries++;

      if (retries > maxRetries) {
        console.error("AI generation error after maximum retries:", error);
        return "An error occurred while generating the response.";
      }

      console.warn(
        `Request failed (attempt ${retries}/${maxRetries}), retrying...`
      );

      const delay = 1000 * Math.pow(2, retries - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
