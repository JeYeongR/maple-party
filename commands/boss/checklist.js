const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageFlags } = require('discord.js');
const { getBossList, numberToColumnLetter } = require('../../utils/google-sheets-util');
const { readDB } = require('../../utils/db');
const { getCurrentWeek } = require('../../utils/date-util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('해방')
        .setDescription(`주차별 보스 클리어 체크리스트를 불러옵니다 (현재: ${getCurrentWeek()}주차).`)
        .addIntegerOption(option =>
            option.setName('주차')
                .setDescription(`확인할 주차를 입력하세요 (현재: ${getCurrentWeek()}주차).`)
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(12)),
    async execute(interaction) {
        const db = readDB();
        const character = db[interaction.user.id];
        let week = interaction.options.getInteger('주차');

        if (week === null) {
            week = getCurrentWeek();
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const bossList = await getBossList(character, week);

        if (!bossList) {
            await interaction.editReply(`'${character}' 시트 또는 ${week}주차 데이터를 찾을 수 없습니다. 시트 이름과 주차를 확인해주세요.`);
            return;
        }

        const rows = [];
        let currentRow = new ActionRowBuilder();

        for (const boss of bossList) {
            const checkboxColIndex = 2 + (week - 1) * 2;
            const checkboxCol = numberToColumnLetter(checkboxColIndex);
            const customId = `boss-clear-${character}-${boss.row}-${checkboxCol}`;

            const button = new ButtonBuilder()
                .setCustomId(customId)
                .setLabel(boss.cleared ? `${boss.name} ✅` : `${boss.name} ⬜`)
                .setStyle(boss.cleared ? ButtonStyle.Secondary : ButtonStyle.Primary);

            if (currentRow.components.length >= 5) {
                rows.push(currentRow);
                currentRow = new ActionRowBuilder();
            }
            currentRow.addComponents(button);
        }
        if (currentRow.components.length > 0) {
            rows.push(currentRow);
        }


        if (rows.length === 0) {
            await interaction.editReply('보스 목록을 찾을 수 없습니다.');
            return;
        }

        await interaction.editReply({
            content: `**${character}님, ${week}주차 보스 체크리스트**`,
            components: rows,
        });

        setTimeout(() => {
            interaction.deleteReply().catch(error => {
                if (error.code !== 10008) {
                    console.error('등록 완료 메시지 삭제 중 오류 발생:', error);
                }
            });
        }, 300000); // 5분
    },
};
