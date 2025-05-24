import dotenv from "dotenv";
import { SlashCommandBuilder } from "discord.js";

dotenv.config();

const ADMIN = process.env.ADMIN;

const clearCommand = {
  data: new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Deletes a number of messages from the current channel")
    .addIntegerOption((option) =>
      option
        .setName("amount")
        .setDescription("Number of messages to delete (max 100)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger("amount");
    const userId = interaction.user.id;
    const member = await interaction.guild.members.fetch(userId);

    if (!member.permissions.has("Administrator") && userId !== ADMIN) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
      });
      const permMsg = await interaction.fetchReply();
      setTimeout(() => permMsg.delete().catch(console.error), 5000);
      return;
    }

    if (amount < 1 || amount > 100) {
      await interaction.reply({
        content: "Please provide a number between 1 and 100.",
      });
      const invalidMsg = await interaction.fetchReply();
      setTimeout(() => invalidMsg.delete().catch(console.error), 5000);
      return;
    }

    await interaction.deferReply();

    try {
      const toDelete = await interaction.channel.bulkDelete(amount, true);
      const replyMessage = await interaction.editReply({
        content: `Successfully deleted ${toDelete.size} message(s).`,
      });
      setTimeout(() => replyMessage.delete().catch(console.error), 5000);
    } catch (err) {
      console.error(err);
      const errorMessage = await interaction.editReply({
        content: "Failed to delete messages. They may be older than 14 days.",
      });
      setTimeout(() => errorMessage.delete().catch(console.error), 5000);
    }
  },
};

export { clearCommand };
