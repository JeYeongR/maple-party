const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBossList } = require('../../utils/google-sheets-util');
const { readDB } = require('../../utils/db');
const { getCurrentWeek } = require('../../utils/date-util');
const { MAIN_COLOR } = require('../../utils/constants');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('클리어')
    .setDescription('주차별 전체 캐릭터의 보스 클리어 현황을 보여줍니다.')
    .addIntegerOption(option =>
      option.setName('주차')
        .setDescription(`확인할 주차를 입력하세요 (현재: ${getCurrentWeek()}주차).`)
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(12)),
  async execute(interaction) {
    await interaction.deferReply();

    let week = interaction.options.getInteger('주차');
    if (week === null) {
      week = getCurrentWeek();
    }

    const db = readDB();
    const characters = [...new Set(Object.values(db))];

    if (characters.length === 0) {
      await interaction.editReply('등록된 캐릭터가 없습니다.');
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(MAIN_COLOR)
      .setTitle(`🗓️ ${week}주차 보스 클리어 현황`)
      .setDescription('각 캐릭터별 남은 보스 목록입니다.');

    const bossDataPromises = characters.map(char => getBossList(char, week));
    const bossDataResults = await Promise.all(bossDataPromises);

    for (let i = 0; i < characters.length; i++) {
      const character = characters[i];
      const bossList = bossDataResults[i];

      if (!bossList) {
        embed.addFields({ name: `⚠️ ${character}`, value: '시트 데이터를 찾을 수 없습니다.' });
        continue;
      }

      const unclearedBosses = bossList
        .filter(boss => !boss.cleared)
        .map(boss => boss.name);

      if (unclearedBosses.length === 0) {
        embed.addFields({ name: `✅ ${character}`, value: '🎉 모든 보스를 클리어했습니다!' });
      } else {
        embed.addFields({ name: `⬜ ${character}`, value: unclearedBosses.join(', ') });
      }
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
