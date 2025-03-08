import { EmbedBuilder } from "discord.js";
import { scrapeBasDictionary } from "../../utils/basDictionaryScraper.js";

import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

function getDirname() {
  const __filename = fileURLToPath(import.meta.url);
  return path.dirname(__filename);
}

const dictionaryCommand = {
  data: {
    name: "dictionary",
    type: 1,
    description: "Get definitions from BAS Bulgarian Dictionary",
    options: [
      {
        name: "word",
        description: "The word to look up",
        required: true,
        type: 3,
      },
      {
        name: "hidden",
        description: "Hide the answer from other users?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const allowedServerId = "658655311028289551";
    if (interaction.guildId !== allowedServerId) {
      return interaction.reply({
        content:
          "This command can only be used on https://discord.gg/gnuh77Dxgm",
        ephemeral: true,
      });
    }

    const word = interaction.options.getString("word");
    const hidden = interaction.options.getBoolean("hidden") || false;

    await interaction.deferReply({ ephemeral: hidden });

    const progressEmbed = new EmbedBuilder()
      .setTitle(`Търсене на "${word}"`)
      .setColor(0x0099ff)
      .setDescription(
        `Searching on https://ibl.bas.bg/rbe/lang/bg/${encodeURIComponent(
          word
        )}...`
      );

    await interaction.editReply({ embeds: [progressEmbed] });

    try {
      const cached = await checkCache(word);

      if (cached) {
        return sendDefinitionEmbed(interaction, cached, word, true);
      }

      progressEmbed.setDescription(`Solving captcha...`);
      progressEmbed.setFooter(
        "A real human is solving your captcha now <:shushing_slavi_theclashers:1276520372702941204>"
      );
      await interaction.editReply({ embeds: [progressEmbed] });

      const dictData = await scrapeBasDictionary(word, async (status) => {
        progressEmbed.setDescription(status);
        await interaction.editReply({ embeds: [progressEmbed] });
      });

      if (!dictData) {
        const embed = new EmbedBuilder()
          .setTitle(`Думата "${word}" не е намерена`)
          .setColor(0xff0000)
          .setDescription("Тази дума не съществува в речника на БАН.")
          .setURL(`https://ibl.bas.bg/rbe/lang/bg/${encodeURIComponent(word)}`);

        return interaction.editReply({ embeds: [embed] });
      }

      if (dictData.captchaRequired) {
        const captchaEmbed = new EmbedBuilder()
          .setTitle("CAPTCHA Required")
          .setColor(0xffa500)
          .setDescription(
            `CAPTCHA решаването неуспешно! Моля, опитайте директно в сайта: ${dictData.url}`
          );
        return interaction.editReply({ embeds: [captchaEmbed] });
      }

      await saveToCache(word, dictData);

      return sendDefinitionEmbed(interaction, dictData, word, false);
    } catch (error) {
      console.error("Error in dictionary command:", error);
      await interaction.editReply({
        content:
          "Възникна грешка при търсенето на думата. Моля, опитайте отново по-късно.",
        ephemeral: false,
      });
    }
  },
};

async function checkCache(word) {
  try {
    const cacheDir = path.join(getDirname(), "../../cache");

    try {
      await fs.access(cacheDir);
    } catch {
      await fs.mkdir(cacheDir, { recursive: true });
      return null;
    }

    const cacheFile = path.join(cacheDir, `${word.toLowerCase()}.json`);

    try {
      const data = await fs.readFile(cacheFile, "utf8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Cache read error:", error);
    return null;
  }
}

async function saveToCache(word, data) {
  try {
    const cacheDir = path.join(getDirname(), "../../cache");

    try {
      await fs.access(cacheDir);
    } catch {
      await fs.mkdir(cacheDir, { recursive: true });
    }

    const cacheFile = path.join(cacheDir, `${word.toLowerCase()}.json`);
    await fs.writeFile(cacheFile, JSON.stringify(data), "utf8");
  } catch (error) {
    console.error("Cache write error:", error);
  }
}

async function sendDefinitionEmbed(interaction, dictData, word, isCached) {
  const embeds = [];
  const mainEmbed = new EmbedBuilder()
    .setTitle(`${word} - Речник на БАН`)
    .setColor(0x0099ff)
    .setURL(dictData.url)
    .setFooter({
      text: `Източник: Институт за български език - БАН${
        isCached ? " (Cached)" : ""
      }`,
      iconURL:
        "https://github.com/Bulgarian-Assistant/Bot/blob/main/resources/bg-alphabet.png?raw=true",
    });

  embeds.push(mainEmbed);

  const MAX_FIELD_LENGTH = 1000; 
  const definition = dictData.definition;

  let currentEmbed = mainEmbed;
  let fieldIndex = 0;
  let start = 0;

  while (start < definition.length) {
    let end = start + MAX_FIELD_LENGTH;

    if (end < definition.length) {
      const newlinePos = definition.lastIndexOf("\n", end);
      if (newlinePos > start && newlinePos > end - 200) {
        end = newlinePos;
      } else {
        const spacePos = definition.lastIndexOf(" ", end);
        if (spacePos > start && spacePos > end - 100) {
          end = spacePos;
        }
      }
    }

    const chunk = definition.substring(start, end).trim();

    const fieldName =
      fieldIndex === 0 ? "Определение" : `Продължение ${fieldIndex}`;

    if (chunk.length > 0) {
      if (chunk.length <= MAX_FIELD_LENGTH) {
        currentEmbed.addFields({ name: fieldName, value: chunk });
        fieldIndex++;
      } else {
        const safeChunk = chunk.substring(0, MAX_FIELD_LENGTH - 3) + "...";
        currentEmbed.addFields({ name: fieldName, value: safeChunk });
        fieldIndex++;
      }
    }

    start = end;

    if (fieldIndex > 0 && fieldIndex % 25 === 0 && start < definition.length) {
      if (embeds.length < 10) {
        currentEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle(`${word} - Продължение`);
        embeds.push(currentEmbed);
      } else {
        currentEmbed.addFields({
          name: "Забележка",
          value:
            "Дефиницията е твърде дълга. Моля, посетете сайта за пълната информация.",
        });
        break;
      }
    }
  }

  return interaction.editReply({ embeds });
}
export { dictionaryCommand };
