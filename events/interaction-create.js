const { Events, MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		if (interaction.guild) {
			console.log(`[COMMAND] /${interaction.commandName} used by (${interaction.user.globalName}) ${interaction.user.tag} in ${interaction.guild.name}#${interaction.channel.name}`);
		} else {
			console.log(`[COMMAND] /${interaction.commandName} used by (${interaction.user.globalName}) ${interaction.user.tag} in DMs`);
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', flags: MessageFlags.Ephemeral });
			}
		}
	},
};
