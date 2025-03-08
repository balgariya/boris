
const borisCommand = {
  data: {
    name: "boris",
    type: 1,
    description: "A command for Boris",
    integration_types: [0, 1],
    contexts: [0, 1, 2],
  },
  async execute(interaction) {
    await interaction.reply({
      content: "Boris doesn't know how to use this command :D",
    });
  },
};

export { borisCommand };
