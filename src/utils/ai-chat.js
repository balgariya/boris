import { requestAI } from "./ai-request.js";

const emojiMap = {
  ":pain:": "<:pain:722774554233274450>",
  ":gotcha:": "<:gotcha:722775690109386772>",
  ":dumb:": "<:facepalm:722774521710510080>",
  ":amazed:": "<:Amazed_face:1282103289839878285>",
  ":eyes:": "<:eyes:722774906630045816>",
  ":cool:": "<:shushing_slavi_theclashers:1276520372702941204>",
  ":shushing:": "<:shushing_slavi_theclashers:1276520372702941204>",
  ":brain:": "<:bigbrain:724560906926817301>",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function handleBotMention(message, client) {
  try {
    const pingRegex = new RegExp(`<@!?${client.user.id}>`, "g");
    let content = message.content.replace(pingRegex, "").trim();

    await message.channel.sendTyping();

    const fetched = await message.channel.messages.fetch({ limit: 5 });
    const msgsArr = Array.from(fetched.values())
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .slice(-4);
    const context = msgsArr.length
      ? msgsArr.map((m) => `${m.author.username}: ${m.content}`).join("\n")
      : "No recent messages";

    const formattedDate = dateFormatter.format(new Date());
    const roles =
      message.member.roles.cache
        .filter((r) => r.name !== "@everyone")
        .map((r) => r.name)
        .join(", ") || "None";

    const userMessage = content || "Hey Boris!";
    const prompt = `You are a Bulgarian language expert Discord bot with the name Boris, participating in a Discord server called ${message.guild.name}.
Date: ${formattedDate}
Channel: ${message.channel.name}
User Roles: ${roles}
Maxim (maximde) made you (Boris)
If user asks for bg learn resources, tell him to use /resources
Do not use normal emojis
You can only use these emojis (write them exactly like this): :pain:, :gotcha:, :dumb:, :amazed:, :brain:, :eyes:, :cool:, :shushing: :head_shaking_vertically: :head_shaking_horizontally:
No clichés, no hype, no fluff.
Be real, be direct.
Starting with “and” or “but” is fine.
Keep your answers very short and match the language of the last message.
Do not greet the user below if in the chat context that user is mentioned

Recent message history:
${context}

Reply naturally, without mentioning your own name.
User ${message.author.username} says: ${userMessage}`;

    const isClaude = /!claude|translate/i.test(content);
    const aiPrompt = isClaude ? content.replace(/!claude/i, "") : prompt;
    const aiModel = isClaude ? undefined : "openai/gpt-4o-mini";

    const response = await requestAI(aiPrompt, 3, aiModel);
    const cleaned = response.replace(
      /:[a-z_]+:/g,
      (tag) => emojiMap[tag] || tag
    );

    await message.reply(cleaned);
  } catch (err) {
    console.error(err);
    await message.reply("Sorry, I'm having brain issues rn.");
  }
}
