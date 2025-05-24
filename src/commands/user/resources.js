import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import {
  ContainerBuilder,
  TextDisplayBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} from "discord.js";

dotenv.config();

const resourcesCommand = {
  data: {
    name: "resources",
    type: 1,
    description: "A list of resources for learning Bulgarian",
    options: [
      {
        name: "hidden",
        description: "Do you want to hide the message from other users?",
        required: false,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const hidden = interaction.options.getBoolean("hidden") ?? true;
    await interaction.deferReply({ ephemeral: hidden });

    await sendResourcesPage(interaction, 1);
  },
};

async function sendResourcesPage(interaction, page) {
  const container = new ContainerBuilder();

  const titleText = new TextDisplayBuilder().setContent(
    `# Resources for Learning Bulgarian (Part ${page})`
  );
  container.addTextDisplayComponents(titleText);

  if (page === 1) {
    const content1 = new TextDisplayBuilder().setContent(
      "## Sites without Audio\n" +
        "• [Linguicious](https://linguicious.com/en/study-bulgarian/) - Alphabet, grammar, pronunciation & other\n" +
        "• [BulgarianPod101 Blog](https://www.bulgarianpod101.com/blog/) - Blog with useful vocabulary examples/phrases\n" +
        "• [MyLanguages](https://mylanguages.org/learn_bulgarian.php)\n\n" +
        "## Sites with Audio/Video\n" +
        "• [LingoHut](https://www.lingohut.com/en/l113/learn-bulgarian) - Vocabulary\n" +
        "• [Goethe Verlag](https://www.goethe-verlag.com/book2/EN/ENBG/ENBG002.HTM) - Vocabulary\n" +
        "• [BulgarianPod101](https://www.bulgarianpod101.com/) - Vocabulary course\n" +
        "• [Words pronunciation](https://forvo.com/languages-pronunciations/bg/)\n\n" +
        "## Interactive Learning Resources\n" +
        "• [Bulgaro](https://www.bulgaro.io/learn-bulgarian) - Duolingo-like system with grammar explanations\n" +
        "• [LENGO](https://apps.apple.com/us/app/learn-bulgarian-with-lengo/id1641601984) - iOS App (Free and paid versions)\n" +
        "• [Glossika](https://ai.glossika.com/language/learn-bulgarian) - Learn sentences by listening and talking (7-day trial available)\n\n" +
        "## Vocabulary Resources\n" +
        "• [Bgjargon](https://www.bgjargon.com/) - Slang & common sayings\n" +
        "• [List of words with meanings and examples](https://docs.google.com/spreadsheets/u/0/d/1Ji8vMZeTojkFIi_Rj3rrmn5o5PTxXeqp4PhdSsHb9gc/htmlview?pli=1#)\n" +
        "• [Collection of commonly used words](https://docs.google.com/spreadsheets/d/1HGMAL0qoU_ydlFJ6ZNlIHSVTT2eMelj2_1EwgsQMyW4/edit#gid=0)\n" +
        "• [Bulgarian phrases in Latin](https://www.linguanaut.com/learn-bulgarian/phrases.php)\n\n" +
        "## Learning Sites for Bulgarians\n" +
        "• [Ucha.se](https://ucha.se/) - School Lessons in Bulgarian\n" +
        "• [IBL Grammar Q&A](https://ibl.bas.bg/ezikovi_spravki/) - Tricky Bulgarian grammar rules\n\n" +
        "## YouTube Channels - Learning\n" +
        "• [Gol y Plot](https://www.youtube.com/@golyplot/videos)\n" +
        "• [Monoglossia](https://www.youtube.com/@Monoglossia/videos)\n" +
        "• [Bulgarian for foreigners Level A1](https://www.youtube.com/watch?v=kJ5Eb4ZiP6I&list=PLQ3iCvL8uyKSu0P6WB6fdvMzsm22BB6FM)\n" +
        "• [Day-to-day situations in Bulgarian](https://www.youtube.com/watch?v=9NC5zumL2yM&list=PLgofZjs3lghPvSjKzQhWL5JXPtSEKACFP)"
    );
    container.addTextDisplayComponents(content1);
  } else if (page === 2) {
    const content2 = new TextDisplayBuilder().setContent(
      "## YouTube Channels - Gaming & History\n" +
        "• [Yoan Hristov](https://www.youtube.com/@yoan_hristov) - Gaming\n" +
        "• [NoThx TV](https://www.youtube.com/c/NoThxTV) - Gaming\n" +
        "• [Bulgarian History](https://www.youtube.com/@BulgarianHistory1/) - History\n" +
        "• [Mr Maestro Muzika](https://www.youtube.com/@MrMaestromuzika) - Reading books\n\n" +
        "## YouTube Channels - Various Content\n" +
        "• [Aethelthryth](https://www.youtube.com/@Aethelthryth1337) - Various content\n" +
        "• [Wankicha](https://www.youtube.com/@wankicha/videos) - Various content\n" +
        "• [AydeBG](https://www.youtube.com/@AydeBG) - Famous content creator\n" +
        "• [Chris Zahariev](https://www.youtube.com/@ChrisZahariev) - Vlogs\n\n" +
        "## Bulgarian Radio\n" +
        "• [Radio Fresh](http://radiofresh.bg/)\n" +
        "• [Binar](https://binar.bg/)\n" +
        "• [Radio Energy](https://www.radioenergy.bg/)\n\n" +
        "## Other Resources\n" +
        "• [Typing test in Bulgarian](https://10fastfingers.com/typing-test/bulgarian)\n" +
        "• [Discord server for learning Bulgarian](https://discord.com/invite/JkJTExU2Gy)\n" +
        "• [PONS Dictionary](https://en.pons.com/translate)\n" +
        "• [DeepL Translator](https://www.deepl.com/en/translator)\n" +
        "• [Bulgarian Chat AI](https://chat.bggpt.ai)\n\n" +
        "## Books\n" +
        "• [Teach Yourself Bulgarian](https://github.com/Bulgarian-language-learning/bulgarian-language-resources/blob/main/static/learning-resources/Teach_Yourself_Bulgarian.pdf?raw=true)\n" +
        "• [Free books on Chitanka](https://chitanka.info/)\n" +
        "• [Bulgarian Grammar in Charts](https://www.amazon.com/Grammar-Matters-Bulgarian-Charts-ebook/dp/B00KVIB5CS/)\n" +
        "• [Bulgarian reference grammar](https://inozmi.spilnotv.com/books/sprak/bg/stand_alone_bulgarian.pdf)"
    );
    container.addTextDisplayComponents(content2);
  }

  const prevButton = new ButtonBuilder()
    .setCustomId(`resources_prev_${page}`)
    .setLabel("◀️ Previous")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page === 1);

  const nextButton = new ButtonBuilder()
    .setCustomId(`resources_next_${page}`)
    .setLabel("Next ▶️")
    .setStyle(ButtonStyle.Secondary)
    .setDisabled(page === 2);

  container.addActionRowComponents((row) =>
    row.addComponents(prevButton, nextButton)
  );

  await interaction.editReply({
    components: [container],
    flags: MessageFlags.IsComponentsV2,
  });
}

async function handleResourcesButtonInteraction(interaction) {
  if (!interaction.isButton()) return;

  if (
    interaction.customId.startsWith("resources_prev_") ||
    interaction.customId.startsWith("resources_next_")
  ) {
    await interaction.deferUpdate();
    const parts = interaction.customId.split("_");
    const action = parts[1];
    const currentPage = parseInt(parts[2]);


    let newPage = currentPage;
    if (action === "next" && currentPage < 2) {
      newPage = currentPage + 1;
    } else if (action === "prev" && currentPage > 1) {
      newPage = currentPage - 1;
    }

    sendResourcesPage(interaction, newPage);
  }
}

export { resourcesCommand, handleResourcesButtonInteraction };
