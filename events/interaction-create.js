const { Events } = require('discord.js');
const { handleButtonInteraction } = require('./handlers/button-handler');
const { MessageFlags } = require('discord.js');

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (interaction.isChatInputCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) {
				console.error(`No command matching ${interaction.commandName} was found.`);
				return;
			}

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(`Error executing command ${interaction.commandName}:`, error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '명령어 실행 중 오류가 발생했습니다!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: '명령어 실행 중 오류가 발생했습니다!', flags: MessageFlags.Ephemeral });
				}
			}
		} else if (interaction.isButton()) {
			try {
				await handleButtonInteraction(interaction);
			} catch (error) {
				console.error('Error handling button interaction:', error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({ content: '버튼 처리 중 오류가 발생했습니다!', flags: MessageFlags.Ephemeral });
				} else {
					await interaction.reply({ content: '버튼 처리 중 오류가 발생했습니다!', flags: MessageFlags.Ephemeral });
				}
			}
		}
	},
};
