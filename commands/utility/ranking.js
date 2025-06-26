const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBasicInfoByName, getStatInfoByName } = require('../../utils/nexon-api');
const { readDB } = require('../../utils/db');
const { MAIN_COLOR } = require('../../utils/constants');
const { formatCombatPower } = require('../../utils/formatting');

const rankingStrategies = {
  combat_power: {
    fetcher: getStatInfoByName,
    sorter: (a, b) => b.combatPower - a.combatPower,
    formatter: (user, index) => `${index + 1}. ${user.characterName} - ${formatCombatPower(user.combatPower)}`,
    title: '전투력 랭킹 (상위 10명)',
  },
  level: {
    fetcher: getBasicInfoByName,
    sorter: (a, b) => {
      if (b.character_level === a.character_level) {
        return parseFloat(b.character_exp_rate) - parseFloat(a.character_exp_rate);
      }
      return b.character_level - a.character_level;
    },
    formatter: (user, index) => `${index + 1}. ${user.characterName} - Lv. ${user.character_level} (${user.character_exp_rate}%)`,
    title: '레벨 랭킹 (상위 10명)',
  },
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('랭킹')
    .setDescription('등록된 유저의 랭킹을 보여줍니다.')
    .addStringOption(option =>
      option.setName('기준')
        .setDescription('기준으로 랭킹을 보여줍니다.')
        .addChoices(
          { name: '전투력', value: 'combat_power' },
          { name: '레벨', value: 'level' },
        )
        .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const voiceChannel = interaction.member.voice.channel;
    if (!voiceChannel) {
      return interaction.editReply({ content: '먼저 음성 채널에 참여해주세요!' });
    }

    const db = readDB();
    const members = voiceChannel.members;

    const notRegisteredUsers = members
      .filter(member => !db[member.id])
      .map(member => member.user.globalName);

    if (notRegisteredUsers.length > 0) {
      return interaction.editReply({ content: `"/등록" 명령어로 아이디를 모두 등록해주세요! [${notRegisteredUsers.join(', ')}]` });
    }

    const characterNames = members.map(member => db[member.id]);
    const sortBy = interaction.options.getString('기준');
    const strategy = rankingStrategies[sortBy];

    const results = await Promise.all(characterNames.map(characterName => strategy.fetcher(characterName)));
    const validResults = results.filter(r => r && !r.error);
    const errorMessages = results.filter(r => r && r.error).map(r => r.message);

    if (errorMessages.length > 0) {
      await interaction.followUp({ content: `오류가 발생했습니다:\n${errorMessages.join('\n')}`, ephemeral: true });
    }

    if (validResults.length === 0) {
      return interaction.editReply({ content: '랭킹을 표시할 유저 정보가 없습니다.' });
    }

    validResults.sort(strategy.sorter);

    const description = validResults
      .slice(0, 10)
      .map(strategy.formatter)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(MAIN_COLOR)
      .setTitle(strategy.title)
      .setDescription(description || '랭킹 정보가 없습니다.');

    await interaction.editReply({ embeds: [embed] });
  },
};