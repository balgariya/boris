import dotenv from "dotenv";
import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  TextDisplayBuilder,
  SectionBuilder,
  MessageFlags,
} from "discord.js";

dotenv.config();

const helpCommand = {
  data: {
    name: "help",
    type: 1,
    description: "Everything you have to know about the bot",
    options: [
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
    const hidden = interaction.options.getBoolean("hidden") ?? true;

    await interaction.deferReply({ ephemeral: hidden });

    const container = new ContainerBuilder();

    const titleText = new TextDisplayBuilder().setContent("# About this bot");
    container.addTextDisplayComponents(titleText);

    const commandsText = new TextDisplayBuilder().setContent(
      "# Commands\n" +
        "- `/translate` - Translates any Bulgarian/English sentence into the other language\n" +
        "- `/word` - Gives you information about the pronunciation of a Bulgarian word, its meaning, synonyms, and more\n" +
        "- `/stress` - Shows the correct way to pronounce a word, e.g., кѝно\n" +
        "- `/resources` - A list of resources for learning bulgarian\n" +
        "- `/to-cyrillic` - Converts latin written bulgarian into cyrillic\n" +
        "- `/books` - A list of books in bulgarian\n" +
        "- `/wordgame` - Start a word gussing game\n" +
        "- `/ai` - Ask the AI any question\n" +
        "- `/dictionary` - Use the BAS Bulgarian dictionary\n" +
        "- `/bgjargon` - Get definitions from Bulgarian slang dictionary at bgjargon.com\n" +
        "- `/alphabet` - An image of the alphabet"
    );
    container.addTextDisplayComponents(commandsText);

    const sourceCodeText = new TextDisplayBuilder().setContent(
      "# Source code\n" +
        "This bot is open source, which means you can find the source code:"
    );

    const sourceCodeButton = new ButtonBuilder()
      .setLabel("GitHub Repository")
      .setStyle(ButtonStyle.Link)
      .setURL("https://github.com/balgariya/boris");

    const sourceCodeSection = new SectionBuilder()
      .addTextDisplayComponents(sourceCodeText)
      .setButtonAccessory(sourceCodeButton);

    container.addSectionComponents(sourceCodeSection);

    const installText = new TextDisplayBuilder().setContent(
      "# Do you want to use the bot yourself?\n" +
        "You can install it on your own Discord server or globally:"
    );

    const installButton = new ButtonBuilder()
      .setLabel("Add to Discord")
      .setStyle(ButtonStyle.Link)
      .setURL(
        "https://discord.com/oauth2/authorize?client_id=1276797546018377728"
      );

    const installSection = new SectionBuilder()
      .addTextDisplayComponents(installText)
      .setButtonAccessory(installButton);

    container.addSectionComponents(installSection);

    await interaction.editReply({
      components: [container],
      flags: MessageFlags.IsComponentsV2,
    });
  },
};

export { helpCommand };
