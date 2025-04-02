import { requestAI } from "./ai-request.js";
import { setTimeout } from "timers/promises";

export async function handleBotMention(message, client) {
  try {
    const pingRegex = new RegExp(`<@!?${client.user.id}>`, "g");
    let cleanContent = message.content.replace(pingRegex, "").trim();
    cleanContent = cleanContent.replace(/boris/i, "").trim();
    cleanContent = cleanContent.replace(/борис/i, "").trim();
    message.channel.sendTyping();

    const contextMessages = await message.channel.messages.fetch({ limit: 4 });
    const messageContext = contextMessages
      .sort((a, b) => a.createdTimestamp - b.createdTimestamp)
      .map((msg) => `${msg.author.username}: ${msg.content}`)
      .slice(-3)
      .join("\n");

    const date = new Date();
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const year = date.getFullYear();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedDate = `${day}. ${months[monthIndex]} ${year}`;

    const isAdmin =
      message.member.roles.cache.some((role) => role.name === "Admin") ||
      message.author.username === "maximde";

    const userRoles = message.member.roles.cache
      .filter((role) => role.name !== "@everyone")
      .map((role) => role.name)
      .join(", ");

    const deleteCommandInfo = isAdmin
      ? "- (Current requester is admin) To delete messages (amount max: 15): [COMMAND:DELETE:<amount>]"
      : "- To delete messages (amount max: 15): [COMMAND:DELETE:<amount>] but only with admin permission.. user seems to have no admin role.";

    const prompt = `You are a witty, smart, and helpful human assistant (named boris) made by Maxim on Discord (Bulgarian language server). Act natural and human-like.
      The current date is ${formattedDate}.
      You current discord nickname is ${message.guild.members.me.nickname}
      Here are the server rules <#658658532786176022>
      User has these roles: ${userRoles}
      
      If someone requests these actions, respond normally but include the command (in your response) in brackets:
      - To mute the user who asks (you can only mute him not a random user): [COMMAND:MUTE:<duration in seconds>]
      - To change your nickname: [COMMAND:NICKNAME:<new name>]
      - To unmute the user who asks (you can only unmute): [COMMAND:UNMUTE]
      - To recommend Bulgarian learning resources (the command triggers an automatic msg): [COMMAND:RESOURCE:<resources_amount_number>,<search query>] (if you use it answer user with smth like: Sure, let me find something for you.))
      ${deleteCommandInfo}
      
      If you use one command, tell the user that you have done the action.

      Although this is a Bulgarian-language server, if a message is in English (or another language), respond in that language naturally.
      You're not a language model or AI.
      Fenix (aka fenix.here) is admin on the server
      Do not use normal emojis
      You can only use these new emojis (write them exactly like this): :pain:, :gotcha:, :dumb:, :amazed:, :brain:, :eyes:, :cool:, :shushing:
      Keep your answers very short and match the language of the last message.
      Current channel: ${message.channel.name}
      Use informal language, slang and fitting jokes when appropriate.
      
      Recent chat context:
      ${messageContext || "No recent messages"}

      Do not greet the user below if in the chat context that user is mentioned
      
      User ${message.author.username} just mentioned you: ${cleanContent}`;

    let response = await requestAI(prompt, 3);

    const commandRegex = /\[COMMAND:(\w+)(?::(.*?))?\]/g;
    let commands = [];
    let cleanedResponse = response
      .replace(commandRegex, (match, action, param) => {
        commands.push({ action: action.toUpperCase(), param });
        return "";
      })
      .trim();

    cleanedResponse = cleanedResponse
      .replace(/:pain:/g, "<:pain:722774554233274450>")
      .replace(/:gotcha:/g, "<:gotcha:722775690109386772>")
      .replace(/:dumb:/g, "<:facepalm:722774521710510080>")
      .replace(/:amazed:/g, "<:Amazed_face:1282103289839878285>")
      .replace(/:eyes:/g, "<:eyes:722774906630045816>")
      .replace(/:cool:/g, "<:shushing_slavi_theclashers:1276520372702941204>")
      .replace(
        /:shushing:/g,
        "<:shushing_slavi_theclashers:1276520372702941204>"
      )
      .replace(/:brain:/g, "<:bigbrain:724560906926817301>");

    const botResponse = await message.reply(cleanedResponse);

    for (const { action, param } of commands) {
      try {
        switch (action) {
          case "MUTE":
            await executeCommand(handleMuteCommand, message, param);
            break;
          case "NICKNAME":
            await executeCommand(handleNicknameCommand, message, param);
            break;
          case "RESOURCE":
            await executeCommand(handleResourceCommand, message, param);
            break;
          case "UNMUTE":
            await executeCommand(handleUnmuteCommand, message);
            break;
          case "DELETE":
            if (isAdmin) {
              await executeCommand(handleDeleteCommand, message, param);
            }
            break;
        }
      } catch (error) {
        console.error(`Error processing command ${action}:`, error);
      }
    }

    if (commands.some((cmd) => cmd.action === "DELETE" && isAdmin)) {
      await setTimeout(3000);
      await message.delete().catch(() => {});
      await setTimeout(2000);
      await botResponse.delete().catch(() => {});
    }
  } catch (error) {
    console.error("Error handling bot mention:", error);
    message.reply("Sorry, I'm having brain issues rn.");
  }
}

const resourcesList = `
SITES WITHOUT AUDIO:
- Linguicious (https://linguicious.com/en/study-bulgarian/) - Alphabet, grammar, pronunciation & other
- BulgarianPod101 Blog (https://www.bulgarianpod101.com/blog/) - Blog with useful vocabulary examples/phrases
- MyLanguages (https://mylanguages.org/learn_bulgarian.php)

SITES WITH AUDIO/VIDEO:
- LingoHut (https://www.lingohut.com/en/l113/learn-bulgarian) - Vocabulary
- Goethe Verlag (https://www.goethe-verlag.com/book2/EN/ENBG/ENBG002.HTM) - Vocabulary
- BulgarianPod101 (https://www.bulgarianpod101.com/) - Vocabulary course
- Forvo (https://forvo.com/languages-pronunciations/bg/) - Words pronunciation

INTERACTIVE LEARNING RESOURCES:
- Bulgaro (https://www.bulgaro.io/learn-bulgarian) - Duolingo-like system with grammar explanations
- LENGO (https://apps.apple.com/us/app/learn-bulgarian-with-lengo/id1641601984) - iOS App (Free and paid versions)
- Glossika (https://ai.glossika.com/language/learn-bulgarian) - Learn sentences by listening and talking (7-day trial available)

VOCABULARY RESOURCES:
- Bgjargon (https://www.bgjargon.com/) - Slang & common sayings
- List of words with meanings and examples (https://docs.google.com/spreadsheets/u/0/d/1Ji8vMZeTojkFIi_Rj3rrmn5o5PTxXeqp4PhdSsHb9gc/htmlview?pli=1#)
- Collection of commonly used words (https://docs.google.com/spreadsheets/d/1HGMAL0qoU_ydlFJ6ZNlIHSVTT2eMelj2_1EwgsQMyW4/edit#gid=0)
- Bulgarian phrases in Latin (https://www.linguanaut.com/learn-bulgarian/phrases.php)
- Goethe Verlag Vocabulary (https://www.goethe-verlag.com/book2/EN/ENBG/ENBG002.HTM)

LEARNING SITES FOR BULGARIANS:
- Ucha.se (https://ucha.se/) - School Lessons in Bulgarian
- IBL Grammar Q&A (https://ibl.bas.bg/ezikovi_spravki/) - Tricky Bulgarian grammar rules

YOUTUBE CHANNELS - LEARNING:
- Gol y Plot (https://www.youtube.com/@golyplot/videos)
- Monoglossia (https://www.youtube.com/@Monoglossia/videos)
- Bulgarian for foreigners Level A1 (https://www.youtube.com/watch?v=kJ5Eb4ZiP6I&list=PLQ3iCvL8uyKSu0P6WB6fdvMzsm22BB6FM)
- Day-to-day situations in Bulgarian (https://www.youtube.com/watch?v=9NC5zumL2yM&list=PLgofZjs3lghPvSjKzQhWL5JXPtSEKACFP)
- Videos for children learning Bulgarian (https://www.youtube.com/@ItsyBitsyBg/videos)
- TV series for children (https://www.youtube.com/@blaguniteseries34/videos)

YOUTUBE CHANNELS - FACTS & COMEDY:
- PATSO (https://www.youtube.com/@patsoofficial) - Random facts
- TheClashers (https://www.youtube.com/@TheClashers) - Random facts
- Djordjbo (https://www.youtube.com/@djordjbo) - Comedy
- Vankata (https://www.youtube.com/@Vankata) - Comedy

YOUTUBE CHANNELS - GAMING & HISTORY:
- Yoan Hristov (https://www.youtube.com/@yoan_hristov) - Gaming
- NoThx TV (https://www.youtube.com/c/NoThxTV) - Gaming
- Bulgarian History (https://www.youtube.com/@BulgarianHistory1/) - History
- Mr Maestro Muzika (https://www.youtube.com/@MrMaestromuzika) - Reading books
- minus273.15 (https://www.youtube.com/@minus273dot15) - Reading books

YOUTUBE CHANNELS - VARIOUS CONTENT:
- Aethelthryth (https://www.youtube.com/@Aethelthryth1337) - Various content
- Wankicha (https://www.youtube.com/@wankicha/videos) - Various content
- AydeBG (https://www.youtube.com/@AydeBG) - Famous content creator
- Chris Zahariev (https://www.youtube.com/@ChrisZahariev) - Vlogs
- Plami Dimitrova (https://www.youtube.com/@plami_d) - Various content
- TheBleChannel (https://www.youtube.com/user/TheBleChannel) - Various content

YOUTUBE CHANNELS - SPECIALIZED CONTENT:
- Bri4ka.COM (https://www.youtube.com/@Bri4kaCOM) - Cars
- Physics Channel (https://www.youtube.com/channel/UCzXAiQqcReX41lMCrWiuHhg) - Physics
- BG Food (https://www.youtube.com/channel/UC8K5HKWARo8xGVCBnU8Uoiw) - Bulgarian cuisine
- Channel 4 Podcast (https://www.youtube.com/@Channel4Podcast) - Podcast

BULGARIAN RADIO:
- Radio Fresh (http://radiofresh.bg/)
- Binar (https://binar.bg/)
- Radio Energy (https://www.radioenergy.bg/)
- Radio 1 Rock (https://www.radio1rock.bg/)
- Beinsa Duno Music (https://radio.garden/listen/beinsa-duno-muzika/ouKzfwsE)

BULGARIAN NEWS / TV:
- BNT News (https://bntnews.bg/)
- Nova News (https://www.youtube.com/@novanews2851)
- EON TV (https://bg.eon.tv/)
- Elemental TV (https://www.elemental.tv)
- Nova TV News (https://www.youtube.com/@novinitenanova_official)

SPOTIFY:
- Gaming Podcast (https://open.spotify.com/show/5Yug73r6QF2PyYygdveREW)
- Listen, repeat, speak playlist (https://open.spotify.com/intl-de/album/1Cze9MT1sp1rQgpzM6J3jb?si=qEJL6lskQf-SveyydIwjUg&nd=1&dlsi=707a504e924f4e4d)
- Fairytales for children in Bulgarian (https://open.spotify.com/show/1o2riigiuhcISFq9rp1ajo)
- Successful Bulgarian people stories (https://open.spotify.com/show/41xk8bASBUHsBct9pjonBr?si=3z96QGtkT9aftb6CjW5Pfw)
- Bulgarian Stories Podcast (https://open.spotify.com/show/12Y7KnriVKIzAkAINPTZZ5?si=cEi1FVarS_ic6SpecFXarA)

OTHER RESOURCES:
- Typing test in Bulgarian (https://10fastfingers.com/typing-test/bulgarian)
- Discord server for learning Bulgarian (https://discord.com/invite/JkJTExU2Gy)
- PONS Dictionary (https://en.pons.com/translate)
- DeepL Translator (https://www.deepl.com/en/translator)
- Bulgarian Chat AI (https://chat.bggpt.ai)
- Bulgarian dictionary (https://rechnik.chitanka.info/)
- Comprehensive Bulgarian dictionary (https://www.onlinerechnik.com/)
- Official BAS dictionary (https://ibl.bas.bg/rbe/)
- 'Word of the day' game (https://nauchi.bg/duminaciq)
- iTalki for paid teachers (https://www.italki.com/en/teachers/english?is_native=1&speaks%5B0%5D=bulgarian)
- Bulgarian keyboard installation guide (https://www.bulgaro.io/bulgarian-keyboard/windows-10)
- Driving school online test (https://avtoizpit.com/)
- Chitanka - Free books (https://chitanka.info/)

FLASHCARDS:
- Animals (https://quizlet.com/668055760/learn)
- Weather (https://quizlet.com/668464510/learn)

BOOKS:
- Teach Yourself Bulgarian (https://github.com/Bulgarian-language-learning/bulgarian-language-resources/blob/main/static/learning-resources/Teach_Yourself_Bulgarian.pdf?raw=true)
- Free books on Chitanka (https://chitanka.info/)
- More books (https://www.bdz.bg/bg/c/knigi)
- Bulgarian Grammar in Charts (https://www.amazon.com/Grammar-Matters-Bulgarian-Charts-ebook/dp/B00KVIB5CS/)
- Bulgarian reference grammar (https://inozmi.spilnotv.com/books/sprak/bg/stand_alone_bulgarian.pdf)
- A Practical Bulgarian Grammar (https://www.amazon.com/Practical-Bulgarian-Grammar-Marin-Zagorchev/dp/9543900450)
- Intensive Bulgarian, Vol. 1 (https://www.amazon.com/Intensive-Bulgarian-Vol-Textbook-Reference/dp/0299167445)
- Intensive Bulgarian, Vol. 2 (https://www.amazon.com/Intensive-Bulgarian-Vol-Textbook-Reference/dp/0299167542)
- Audio books (https://www.storytel.com/bg)

LANGUAGE EXAMS FOR BULGARIAN CITIZENSHIP:
- Official Exam Site (https://www.copuo.bg/category/83/node/izpiti-po-blgarski-ezik-za-blgarsko-grazhdanstvo-rezultati/600)
- Example tests: Variant 1 (https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_1.pdf)
- Example tests: Variant 2 (https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_2.pdf)
- Example tests: Variant 3 (https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_3.pdf)
`;

async function handleResourceCommand(message, param) {
  const firstCommaIndex = param.indexOf(",");

  let amount = 3;
  let query = param;

  if (firstCommaIndex !== -1) {
    const amountStr = param.substring(0, firstCommaIndex).trim();
    query = param.substring(firstCommaIndex + 1).trim();

    const parsedAmount = parseInt(amountStr);
    if (!isNaN(parsedAmount) && parsedAmount > 0) {
      amount = Math.min(parsedAmount, 20);
    }
  }
  try {
    const resourcesPrompt = `You are a helpful Discord assistant helping someone find Bulgarian language learning resources. Based on the user's query "${query}", recommend the relevant resources from this list:

${resourcesList}

Provide a fhelpful response that includes:
1. A brief introduction like: I have found something for you!
2. Up to ${amount} specific resources that match their request (not less or more than ${amount}, if possible)
3. Include the EXACT links for each resource
4. Put the links into <> like <https://...>

Keep your explaination short but include all needed resources.`;

    const resourceResponse = await requestAI(resourcesPrompt, 2);
    await message.channel.send(resourceResponse);
    return true;
  } catch (error) {
    console.error("Resource command error:", error);
    return false;
  }
}

async function executeCommand(commandFunction, message, param) {
  try {
    return await commandFunction(message, param);
  } catch (error) {
    console.error(`Command execution error:`, error);
    return null;
  }
}

async function handleUnmuteCommand(message) {
  try {
    await message.member.timeout(null);
    return true;
  } catch (error) {
    console.error("Unmute error:", error);
    return false;
  }
}

async function handleMuteCommand(message, duration) {
  try {
    if (isNaN(duration) || duration <= 0) {
      duration = 10;
    }

    await message.member.timeout(duration * 100);
    return true;
  } catch (error) {
    console.error("Mute error:", error);
    return false;
  }
}

async function handleNicknameCommand(message, newName) {
  try {
    if (!newName) return false;

    await message.guild.members.me.setNickname(newName);
    return true;
  } catch (error) {
    console.error("Nickname error:", error);
    return false;
  }
}

async function handleDeleteCommand(message, param) {
  try {
    const amount = Math.min(parseInt(param) || 1, 16);
    const messages = await message.channel.messages.fetch({ limit: 16 });
    const toDelete = messages
      .filter((m) => m.createdTimestamp < message.createdTimestamp)
      .first(amount);

    if (toDelete.length > 0) {
      await message.channel.bulkDelete(toDelete);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Delete error:", error);
    return false;
  }
}
