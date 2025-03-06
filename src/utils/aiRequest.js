import axios from "axios";

export async function requestAI(prompt) {
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
    console.error("AI generation error:", error);
    return "An error occurred while generating the response.";
  }
} 