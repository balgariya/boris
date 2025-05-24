import { requestAI } from "./ai-request.js";

export async function sendWelcomeMessage(member, chatChannel) {
  if (member.guild.id !== "658655311028289551") return;
  try {
    if (!chatChannel) return;

    const prompt = `You are a friendly assistant on the Learn Bulgarian Discord server. 
      Write a short, welcoming message for a new user 
      Keep it informal, use modern english and very short. 
      Include one :flag_bg: emoji. No other emojis.
      Start the message with Здравей <@${member.id}>!\n Welcome to Learn Bulgarian...
      Include that has to choose roles in <#702981252948426872> and read rules in <#658658532786176022> 
      and don't forget to tell us about yourself in <#692855267540598784>.`;

    const aiResponse = await requestAI(prompt, 3, "openai/gpt-4o-mini");
  

    await chatChannel.send(
      aiResponse +
        '\n-# PS: You can always chat with me by including "Boris" in your message.'
    );
  } catch (error) {
    console.error("Error sending welcome message:", error);
  }
}
