import dotenv from "dotenv";
dotenv.config();

import { Client, Events, ActivityType, GatewayIntentBits } from "discord.js";

const client = new Client({
  intents: [],
});

client.once(Events.ClientReady, async (c) => {
  console.log("Bot with name " + client.user.username + " is running!");

  client.user.setPresence({
    activities: [
      {
        name: `to your questions`,
        type: ActivityType.Listening,
      },
    ],
    status: "online",
  });

});

client.login(process.env.TOKEN);
