const { Events } = require('discord.js');
const { handleButtonInteraction } = require('./handlers/button-handler');
const { replyAndDestroy, followUpAndDestroy } = require('../utils/interaction-util');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		try {
			if (interaction.isChatInputCommand()) {
				console.log(`[COMMAND] /${interaction.commandName} by ${interaction.user.tag} in ${interaction.guild.name}`);
				const command = interaction.client.commands.get(interaction.commandName);

				if (!command) {
					console.error(`No command matching ${interaction.commandName} was found.`);
					return;
				}
				await command.execute(interaction);
			} else if (interaction.isButton()) {
				console.log(`[BUTTON] ${interaction.customId} by ${interaction.user.tag} in ${interaction.guild.name}`);
				await handleButtonInteraction(interaction);
			}
		} catch (error) {
			let errorSource = 'An unknown interaction';
			if (interaction.isChatInputCommand()) {
				errorSource = `command ${interaction.commandName}`;
			} else if (interaction.isButton()) {
				errorSource = `button ${interaction.customId}`;
			}
			console.error(`Error executing ${errorSource}:`, error);

			if (interaction.replied || interaction.deferred) {
				await followUpAndDestroy(interaction, '처리 중 오류가 발생했습니다!');
			} else {
				await replyAndDestroy(interaction, '처리 중 오류가 발생했습니다!');
			}
		}
	},
};
