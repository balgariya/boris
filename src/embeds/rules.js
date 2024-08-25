import { EmbedBuilder } from "discord.js";

function sendRulesEmbed(channel) {
  const about = new EmbedBuilder()
    .setColor("#2fb966")
    .setTitle("Server Rules")
    .setAuthor({
      name: "Maxim",
      iconURL:
        "https://github.com/max1mde/images/blob/main/New%20Project%20(83)%20(3)%20(1)%20(1)%20(2)%20(2)%20(2)%20(2)%20(1).png?raw=true",
    })
    .setDescription(
      "- Be nice\n- Do not advertise\n- No NSFW\n- Use your brain"
    );

  channel.send({ embeds: [about] });
}

export { sendRulesEmbed };
