const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { MAIN_COLOR } = require('../../utils/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('명령어')
    .setDescription('사용 가능한 모든 명령어를 보여줍니다.'),
  async execute(interaction) {
    const commands = interaction.client.commands;

    const embed = new EmbedBuilder()
      .setColor(MAIN_COLOR)
      .setTitle('📜 명령어 목록')
      .setDescription('제가 할 수 있는 모든 명령어 목록이에요! 🤖');

    const commandList = commands
      .map(cmd => `**/${cmd.data.name}**: ${cmd.data.description}`)
      .join('\n');

    embed.addFields({ name: '명령어', value: commandList });

    await interaction.reply({ embeds: [embed] });
  },
};
