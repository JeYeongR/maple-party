const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('유저목록')
    .setDescription('현재 음성 채널에 있는 유저 목록을 보여줍니다.'),
  async execute(interaction) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '먼저 음성 채널에 참여해주세요!', ephemeral: true });
    }

    const memberNames = voiceChannel.members.map(member => member.displayName);

    const userList = memberNames.join(', ');

    await interaction.reply(`'${voiceChannel.name}' 채널에 있는 유저: ${userList}`);
  },
};