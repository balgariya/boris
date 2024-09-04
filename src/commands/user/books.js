import dotenv from "dotenv";
import { EmbedBuilder } from "discord.js";

dotenv.config();

const booksCommand = {
  data: {
    name: "books",
    type: 1,
    description: "A list of Bulgarian books for language learners",
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

    const embed = new EmbedBuilder()
      .setTitle("Bulgarian Books for Language Learners")
      .setColor("#2fb966").setDescription(`
# Old and complex books
* **Под игото** (Иван Вазов - 1894 г)
  * [[PDF]](https://chitanka.info/text/3753-pod-igoto.pdf)
  * [[PDF - Old version]](https://dn790000.ca.archive.org/0/items/pod-igoto-1894/Pod_igoto_1894.pdf)
* **Железният светилник** (Димитър Талев - 1952 г)
  * [[Audio]](https://www.youtube.com/watch?v=xpjxFhYy6PE&list=PLyJmM0cHuua8Q1z1RezMV7JW4_gCOsDrJ)
* **До Чикаго и назад** (Алеко Константинов - 1894 г)
  * [[PDF]](https://chitanka.info/text/3705-do-chikago-i-nazad.pdf)

# Better for beginners
## Патиланци - Ран Босилек
* Патиланчо - 1926 г. [[PDF]](https://chitanka.info/book/620-patilantsi.pdf)
* Патиланско царство - 1927 г. [[PDF]](https://chitanka.info/text/2813-patilansko-tsarstvo.pdf)
* Патиланчо на село - 1935 г. [[PDF]](https://chitanka.info/text/2814-patilancho-na-selo.pdf)
* Бате Патилан - 1927 г. [[PDF]](https://chitanka.info/text/15405-bate-patilan.pdf)
* Патиланчо Данчо - 1929 г. [[PDF]](https://chitanka.info/text/15406-patilancho-dancho.pdf)
* Патиланско училище - 1942 г. [[PDF]](https://chitanka.info/text/15407-patilansko-uchilishte.pdf)

## Other books for beginners
* **Ние врабчетата** (Йордан Радичков - 2003 г.) [[PDF]](https://m3.chitanka.info/cache/dl/Jordan_Radichkov_-_Nie_vrabchetata_-_147-b.pdf)
* **Бай Ганьо** (Алеко Константинов - 1895 г.) [[PDF]](https://chitanka.info/text/3706-baj-ganxo.pdf)
* **Oстровът** (Александър Секулов)
* **Чернишка**
* **Българи от старо време** (Любен Каравелов - 1867 г.)
  * [[PDF]](https://chitanka.info/text/4128-bylgari-ot-staro-vreme.pdf)
  * [[Audio]](https://www.youtube.com/watch?v=mWihTXOn0Gk&list=PLyJmM0cHuua8OrORJYlZw_soJ_HiSPQ8s)
* **Ян Бибиян** (Елин Пелин - 1933 г.) [[PDF]](https://chitanka.info/text/220-jan-bibijan.pdf)
* **Тютюн** (Димитър Димов - 1951 г.) [[PDF]](https://m3.chitanka.info/cache/dl/Dimityr_Dimov_-_Tjutjun_-_5799.pdf)

# Other resources
* [Harry Potter series in Bulgarian](https://chitanka.info/serie/hari-potyr)
* Приказки (fairy tales) от Ран Босилек, Елин Пелин, Ангел Каралийчев
      `);

    await interaction.editReply({ embeds: [embed] });
  },
};

export { booksCommand };
