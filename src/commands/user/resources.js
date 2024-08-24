import dotenv from "dotenv";
import axios from "axios";
import * as cheerio from "cheerio";
import { EmbedBuilder } from "discord.js";

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
        default: true,
        type: 5,
      },
    ],
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    const hidden = interaction.options.getBoolean("hidden");

    await interaction.deferReply({ ephemeral: hidden });

    const embed = new EmbedBuilder()
      .setTitle("Resources for Learning Bulgarian")
      .setColor(0x0099ff)
      .addFields(
        {
          name: "Sites without Audio",
          value:
            "• [Linguicious](https://linguicious.com/en/study-bulgarian/) - Alphabet, grammar, pronunciation & other\n" +
            "• [BulgarianPod101 Blog](https://www.bulgarianpod101.com/blog/) - Blog with useful vocabulary examples/phrases\n" +
            "• [MyLanguages](https://mylanguages.org/learn_bulgarian.php)",
        },
        {
          name: "Sites with Audio/Video",
          value:
            "• [LingoHut](https://www.lingohut.com/en/l113/learn-bulgarian) - Vocabulary\n" +
            "• [Goethe Verlag](https://www.goethe-verlag.com/book2/EN/ENBG/ENBG002.HTM) - Vocabulary\n" +
            "• [BulgarianPod101](https://www.bulgarianpod101.com/) - Vocabulary course\n" +
            "• [Words pronunciation](https://forvo.com/languages-pronunciations/bg/)",
        },
        {
          name: "Interactive Learning Resources",
          value:
            "• [Bulgaro](https://www.bulgaro.io/learn-bulgarian) - Duolingo-like system with grammar explanations\n" +
            "• [LENGO](https://apps.apple.com/us/app/learn-bulgarian-with-lengo/id1641601984) - iOS App (Free and paid versions)\n" +
            "• [Glossika](https://ai.glossika.com/language/learn-bulgarian) - Learn sentences by listening and talking (7-day trial available)",
        },
        {
          name: "Vocabulary Resources",
          value:
            "• [Bgjargon](https://www.bgjargon.com/) - Slang & common sayings\n" +
            "• [List of words with meanings and examples](https://docs.google.com/spreadsheets/u/0/d/1Ji8vMZeTojkFIi_Rj3rrmn5o5PTxXeqp4PhdSsHb9gc/htmlview?pli=1#)\n" +
            "• [Collection of commonly used words](https://docs.google.com/spreadsheets/d/1HGMAL0qoU_ydlFJ6ZNlIHSVTT2eMelj2_1EwgsQMyW4/edit#gid=0)\n" +
            "• [Bulgarian phrases in Latin](https://www.linguanaut.com/learn-bulgarian/phrases.php)\n" +
            "• [Goethe Verlag Vocabulary](https://www.goethe-verlag.com/book2/EN/ENBG/ENBG002.HTM)",
        },
        {
          name: "Learning Sites for Bulgarians",
          value:
            "• [Ucha.se](https://ucha.se/) - School Lessons in Bulgarian\n" +
            "• [IBL Grammar Q&A](https://ibl.bas.bg/ezikovi_spravki/) - Tricky Bulgarian grammar rules",
        },
        {
          name: "YouTube Channels",
          value:
            "• [Gol y Plot](https://www.youtube.com/@golyplot/videos)\n" +
            "• [Monoglossia](https://www.youtube.com/@Monoglossia/videos)\n" +
            "• [Bulgarian for foreigners Level A1](https://www.youtube.com/watch?v=kJ5Eb4ZiP6I&list=PLQ3iCvL8uyKSu0P6WB6fdvMzsm22BB6FM)\n" +
            "• [Day-to-day situations in Bulgarian](https://www.youtube.com/watch?v=9NC5zumL2yM&list=PLgofZjs3lghPvSjKzQhWL5JXPtSEKACFP)\n" +
            "• [Videos for children learning Bulgarian](https://www.youtube.com/@ItsyBitsyBg/videos)\n" +
            "• [TV series for children](https://www.youtube.com/@blaguniteseries34/videos)",
        },
        {
          name: "Bulgarian Radio",
          value:
            "• [Radio Fresh](http://radiofresh.bg/)\n" +
            "• [Binar](https://binar.bg/)\n" +
            "• [Radio Energy](https://www.radioenergy.bg/)\n" +
            "• [Radio 1 Rock](https://www.radio1rock.bg/)\n" +
            "• [Beinsa Duno Music](https://radio.garden/listen/beinsa-duno-muzika/ouKzfwsE)",
        },
        {
          name: "Bulgarian News / TV",
          value:
            "• [BNT News](https://bntnews.bg/)\n" +
            "• [Nova News](https://www.youtube.com/@novanews2851)\n" +
            "• [EON TV](https://bg.eon.tv/)\n" +
            "• [Elemental TV](https://www.elemental.tv)\n" +
            "• [Nova TV News](https://www.youtube.com/@novinitenanova_official)",
        },
        {
          name: "Spotify",
          value:
            "• [Gaming Podcast](https://open.spotify.com/show/5Yug73r6QF2PyYygdveREW)\n" +
            "• [Listen, repeat, speak playlist](https://open.spotify.com/intl-de/album/1Cze9MT1sp1rQgpzM6J3jb?si=qEJL6lskQf-SveyydIwjUg&nd=1&dlsi=707a504e924f4e4d)\n" +
            "• [Fairytales for children in Bulgarian](https://open.spotify.com/show/1o2riigiuhcISFq9rp1ajo)\n" +
            "• [Successful Bulgarian people stories](https://open.spotify.com/show/41xk8bASBUHsBct9pjonBr?si=3z96QGtkT9aftb6CjW5Pfw)\n" +
            "• [Bulgarian Stories Podcast](https://open.spotify.com/show/12Y7KnriVKIzAkAINPTZZ5?si=cEi1FVarS_ic6SpecFXarA)",
        },
        {
          name: "Other Resources",
          value:
            "• [Typing test in Bulgarian](https://10fastfingers.com/typing-test/bulgarian)\n" +
            "• [Discord server for learning Bulgarian](https://discord.com/invite/JkJTExU2Gy)\n" +
            "• [PONS Dictionary](https://en.pons.com/translate)\n" +
            "• [DeepL Translator](https://www.deepl.com/en/translator)\n" +
            "• [Bulgarian Chat AI](https://chat.bggpt.ai)\n" +
            "• [Bulgarian dictionary](https://rechnik.chitanka.info/)\n" +
            "• [Comprehensive Bulgarian dictionary](https://www.onlinerechnik.com/)\n" +
            "• [Official BAS dictionary](https://ibl.bas.bg/rbe/)\n" +
            "• ['Word of the day' game](https://nauchi.bg/duminaciq)\n" +
            "• [iTalki for paid teachers](https://www.italki.com/en/teachers/english?is_native=1&speaks%5B0%5D=bulgarian)\n" +
            "• [Bulgarian keyboard installation guide](https://www.bulgaro.io/bulgarian-keyboard/windows-10)\n" +
            "• [Driving school online test](https://avtoizpit.com/)\n" +
            "• [Chitanka - Free books](https://chitanka.info/)",
        },
        {
          name: "Flashcards",
          value:
            "• [Animals](https://quizlet.com/668055760/learn)\n• [Weather](https://quizlet.com/668464510/learn)",
        },
        {
          name: "Books",
          value:
            "• [Teach Yourself Bulgarian](https://github.com/Bulgarian-language-learning/bulgarian-language-resources/blob/main/static/learning-resources/Teach_Yourself_Bulgarian.pdf?raw=true)\n" +
            "• [Free books on Chitanka](https://chitanka.info/)\n" +
            "• [More books](https://www.bdz.bg/bg/c/knigi)\n" +
            "• [Bulgarian Grammar in Charts](https://www.amazon.com/Grammar-Matters-Bulgarian-Charts-ebook/dp/B00KVIB5CS/)\n" +
            "• [Bulgarian reference grammar](https://inozmi.spilnotv.com/books/sprak/bg/stand_alone_bulgarian.pdf)\n" +
            "• [A Practical Bulgarian Grammar](https://www.amazon.com/Practical-Bulgarian-Grammar-Marin-Zagorchev/dp/9543900450)\n" +
            "• [Intensive Bulgarian, Vol. 1](https://www.amazon.com/Intensive-Bulgarian-Vol-Textbook-Reference/dp/0299167445)\n" +
            "• [Intensive Bulgarian, Vol. 2](https://www.amazon.com/Intensive-Bulgarian-Vol-Textbook-Reference/dp/0299167542)\n" +
            "• [Audio books](https://www.storytel.com/bg)",
        },
        {
          name: "Language Exams for Bulgarian Citizenship",
          value:
            "• [Official Exam Site](https://www.copuo.bg/category/83/node/izpiti-po-blgarski-ezik-za-blgarsko-grazhdanstvo-rezultati/600)\n" +
            "• Example tests: [Variant 1](https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_1.pdf), " +
            "[Variant 2](https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_2.pdf), " +
            "[Variant 3](https://www.copuo.bg/sites/default/files/uploads/docs/2013-06/variant_3.pdf)",
        }
      );

    await interaction.editReply({ embeds: [embed] });
  },
};

export { resourcesCommand };
