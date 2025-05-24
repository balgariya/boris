

import dotenv from "dotenv";
import { ContainerBuilder, TextDisplayBuilder, MessageFlags } from "discord.js";

dotenv.config();

const toCyrillicCommand = {
  data: {
    name: "to-cyrillic",
    type: 1,
    description: "Convert latin written bulgarian to cyrillic",
    options: [
      {
        name: "text",
        description: "Your bulgarian text written in latin",
        required: true,
        type: 3,
      },
      {
        name: "hidden",
        description: "Do you want to hide the answer from other users?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const text = interaction.options.getString("text");
    const hidden = interaction.options.getBoolean("hidden");

    await interaction.deferReply({ ephemeral: hidden });

    try {
      const container = new ContainerBuilder();

      const titleText = new TextDisplayBuilder().setContent(
        "### Latin to Cyrillic"
      );
      container.addTextDisplayComponents(titleText);

      const originalText = new TextDisplayBuilder().setContent(`-# ${text}`);
      container.addTextDisplayComponents(originalText);

      const convertedText = new TextDisplayBuilder().setContent(
        convertToCyrillic(text, true)
      );
      container.addTextDisplayComponents(convertedText);

      await interaction.editReply({
        components: [container],
        flags: MessageFlags.IsComponentsV2,
      });
    } catch (error) {
      await interaction.editReply("За съжаление е възникнал проблем!");
    }
  },
};
const criticalWords = {
  as: "аз",
  sum: "съм",
  cum: "съм",
  dobur: "добър",
  dobzr: "добър",
  sdrasti: "здрасти",
  sdrawej: "здравей",
  sdrawejte: "здравейте",
  zdrawej: "здравей",
  zdrawejte: "здравейте",
  zdraweyte: "здравейте",
  tup: "тъп",
  koy: "кой",
  koi: "кой",
  toy: "той",
  toi: "той",
  muj: "мъж",
  pytiat: "пътят",
  nqkoy: "някой",
  nqkoi: "някой",
  nqkoj: "някой",
  luv: "лъв",
  tyi: "тъй",
  tui: "тъй",
  lubov: "любов",
  lubim: "любим",
  jyvot: "живот",
  jyvee: "живее",
  jyv: "жив",
  jyvi: "живи",
  putq: "пътя",
  syjedenie: "съждение",
  synyvam: "сънувам",
  zdrawey: "здравей",
  zdravey: "здравей",
  zdraveu: "здравей",
  zdrawej: "здравей",
  zdraweu: "здравей",
  schiweq: "живея",
  jyvot: "живот",
  jyvee: "живее",
  jyv: "жив",
  jyvi: "живи",
  muj: "мъж",
  moy: "мой",
  tvoj: "твой",
  neina: "нейна",
  neino: "нейно",
  neini: "нейни",
  tqhni: "техни",
  koi: "кой",
  koj: "кой",
  kojto: "който",
  koyto: "който",
  chiy: "чий",
  vsitchki: "всички",
  toj: "той",
  sas: "със",
  naqsht: "нящ",
  majka: "майка",
  maika: "майка",
  mayka: "майка",
  niy: "ний",
  seyf: "сейф",
  seif: "сейф",
  chay: "чай",
  chaj: "чай",
  chai: "чай",
  pleyur: "плейър",
  pleyr: "плейър",
  kray: "край",
  krai: "край",
  tvoj: "твой",
  tvoi: "твой",
  lujitsa: "лъжица",
  lujica: "лъжица",
  vuy: "въй",
  vuj: "въй",
  gayka: "гайка",
  gaika: "гайка",
  peyka: "пейка",
  peika: "пейка",
  luykay: "лъкай",
  lyjkay: "лъкай",
  lujkay: "лъкай",
  okej: "окей",
  okey: "окей",
  okay: "окей",
  boy: "бой",
  boj: "бой",
  viy: "вий",
  vi: "вий",
  remontiriy: "ремонтирий",
  remontirii: "ремонтирий",
  krayche: "крайче",
  kraiche: "крайче",
  majstor: "майстор",
  maystor: "майстор",
  maistor: "майстор",
  pitay: "питай",
  pitai: "питай",
  pytai: "питай",
  piy: "пий",
  pi: "пий",
  stoy: "стой",
  nikoj: "никой",
  nikoi: "никой",
  nikoy: "никой",
  stai: "стой",
  viyte: "вийте",
  lehlо: "легло",
  praznuvay: "празнувай",
  praznuva: "празнувай",
  sniy: "сний",
  sni: "сний",
  zapitay: "запитай",
  zapitai: "запитай",
  zapitaj: "запитай",
  tichay: "тичай",
  tichaj: "тичай",
  tichai: "тичай",
  rabotiy: "работий",
  rabotii: "работий",
  spiy: "спий",
  spi: "спий",
  uspokoy: "успокой",
  uspokoi: "успокой",
  viyka: "вийка",
  viika: "вийка",
  vuzklinkniy: "възкликни",
  vuzklinkni: "възкликни",
  podsushiy: "подсуший",
  podsushii: "подсуший",
  podsusiy: "подсуший",
  naviy: "навий",
  navii: "навий",
  razbiray: "разбирай",
  razbirai: "разбирай",
  napiy: "напий",
  napii: "напий",
  subudiy: "събудий",
  subudii: "събудий",
  gray: "грай",
  grai: "грай",
  nay: "най",
  nai: "най",
  naj: "най",
  zaba: "жаба",
  zabata: "жабата",
};

const latinToCyrillic = {
  a: "а",
  b: "б",
  v: "в",
  g: "г",
  d: "д",
  e: "е",
  j: "ж",
  z: "з",
  i: "и",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  f: "ф",
  h: "х",
  c: "ц",
  sht: "щ",
  yu: "ю",
  q: "я",
  w: "в",
  A: "А",
  B: "Б",
  V: "В",
  G: "Г",
  D: "Д",
  E: "Е",
  J: "Ж",
  Z: "З",
  I: "И",
  K: "К",
  L: "Л",
  M: "М",
  N: "Н",
  O: "О",
  P: "П",
  R: "Р",
  S: "С",
  T: "Т",
  U: "У",
  F: "Ф",
  H: "Х",
  C: "Ц",
  Ch: "Ч",
  Sh: "Ш",
  Sht: "Щ",
  Yu: "Ю",
  Q: "Я",
  W: "В",
};

function convertToCyrillic(text, useCriticalWords = true) {
  let parts = text.split(/(\s+|[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]])/);

  parts = parts.map((part) => {
    if (/^\s+$/.test(part) || /^[.,\/#!$%\^&\*;:{}=\-_`~()?\[\]]$/.test(part)) {
      return part;
    }

    let converted = part;

    if (useCriticalWords && criticalWords.hasOwnProperty(part.toLowerCase())) {
      converted = criticalWords[part.toLowerCase()];
      if (part[0] === part[0].toUpperCase()) {
        converted = converted[0].toUpperCase() + converted.slice(1);
      }
    } else {
      converted = converted.replace(
        /sht|ch|sh|ts|ya|yu|zh|[a-z4-6wy]/gi,
        function (match) {
          if (match.toLowerCase() === "sht") return match === "sht" ? "щ" : "Щ";
          if (match.toLowerCase() === "ch") return match === "ch" ? "ч" : "Ч";
          if (match.toLowerCase() === "sh") return match === "sh" ? "ш" : "Ш";
          if (match.toLowerCase() === "ts") return match === "ts" ? "ц" : "Ц";
          if (match.toLowerCase() === "ya") return match === "ya" ? "я" : "Я";
          if (match.toLowerCase() === "yu") return match === "yu" ? "ю" : "Ю";
          if (match.toLowerCase() === "zh") return match === "zh" ? "ж" : "Ж";
          if (match.toLowerCase() === "y") return match === "y" ? "ъ" : "Ъ";
          return latinToCyrillic[match] || match;
        }
      );
    }

    return converted;
  });

  return parts.join("");
}

export { toCyrillicCommand };
