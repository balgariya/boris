export async function handleContentFilter(message, client) {
  if (message.guild?.id !== "658655311028289551") return false;

  const blockedWords = [
    "*discord.gg*",
    "*discord.gift*",
    "*invite*",
    "nigga",
    "niggars",
    "niggas",
    "nigge",
    "niggers",
    "nigger",
    "nude",
    "nudes",
    "porno",
    "hure",
    "*neger*",
    "negerlein",
    "negerchen",
    "*nigga*",
    "nutte",
    "pornhub",
    "Курва",
    "Кучи син",
    "Мърша",
    "Лайнар",
    "Ебалник",
    "Еби се",
    "Путка майна",
    "Шибаняк",
    "Педераст",
    "негър",
    "негърче",
    "heil hitler",
    "nega",
    "dreckskind",
    "sonofabitch",
    "fuckface",
    "shithead",
    "dickweed",
    "asshat",
    "ficker",
    "opfer",
    "idiot",
    "negger",
    "schwanz",
    "adolfhitler",
    "hitler",
    "heilhitler",
    "heihitler",
    "fotse",
    " sex ",
    "fick",
    "fickk",
    "wixxer",
    "pimellutscher",
    "pimelutscher",
    "nutensohn",
    "schwantz",
    "schwans",
    "fettesau",
    "missgeburt",
    "mistgeburt",
    "negageburt",
    "nitro gift",
    "20$ from steam",
    "arsch",
    "wixer",
    "педерас",
    "dickhead",
    "dirtbag",
    "nuttensohn",
  ];

  const contentLower = message.content.toLowerCase();

  for (const word of blockedWords) {
    if (word.includes("*")) {
      const cleanWord = word.replace(/\*/g, "");
      const regex = new RegExp(`${cleanWord}`, "gi");
      if (regex.test(contentLower)) {
        try {
          await message.delete();
          await message.member.timeout(60 * 1000);
        } catch (error) {}

        const botMessage = await message.channel.send(
          `${message.author}, това не е ОК!`
        );
        setTimeout(() => botMessage.delete().catch(() => {}), 30 * 1000);
        return true;
      }
    } else {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      if (regex.test(contentLower)) {
        try {
          await message.delete();
          await message.member.timeout(60 * 1000);
        } catch (error) {}

        const botMessage = await message.channel.send(
          `${message.author}, това не е ОК!`
        );
        setTimeout(() => botMessage.delete().catch(() => {}), 30 * 1000);
        return true;
      }
    }
  }

  return false;
}
