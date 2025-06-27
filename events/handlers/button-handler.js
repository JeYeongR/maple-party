const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { updateCell, getRangeData } = require('../../utils/google-sheets-util');
const { followUpAndDestroy } = require('../../utils/interaction-util');

async function handleButtonInteraction(interaction) {
  if (interaction.customId.startsWith('boss-clear-')) {
    await interaction.deferUpdate();

    try {
      const parts = interaction.customId.split('-');
      const character = parts[2];
      const row = parts[3];
      const col = parts[4];

      const range = `'${character}'!${col}${row}`;
      const cellData = await getRangeData(range);

      if (!cellData || !cellData[0]) {
        await followUpAndDestroy(interaction, '❌ 시트에서 값을 읽어오는 데 실패했습니다.');
        return;
      }

      const currentValue = cellData[0][0];
      const newValue = currentValue === 'TRUE' ? 'FALSE' : 'TRUE';

      const success = await updateCell(range, newValue);

      if (success) {
        const newLabel = newValue === 'TRUE'
          ? interaction.component.label.replace('⬜', '✅')
          : interaction.component.label.replace('✅', '⬜');

        const newStyle = newValue === 'TRUE' ? ButtonStyle.Secondary : ButtonStyle.Primary;

        const updatedButton = new ButtonBuilder(interaction.component.data)
          .setLabel(newLabel)
          .setStyle(newStyle);

        const components = interaction.message.components.map(actionRow => {
          const newRow = new ActionRowBuilder();
          actionRow.components.forEach(component => {
            if (component.customId === interaction.customId) {
              newRow.addComponents(updatedButton);
            } else {
              newRow.addComponents(new ButtonBuilder(component.data));
            }
          });
          return newRow;
        });

        await interaction.editReply({ components });
      } else {
        await followUpAndDestroy(interaction, '❌ 시트 업데이트에 실패했습니다. 관리자에게 문의해주세요.');
      }
    } catch (error) {
      console.error('버튼 상호작용 처리 중 오류 발생:', error);
      try {
        await followUpAndDestroy(interaction, '오류가 발생하여 작업을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.');
      } catch (followUpError) {
        console.error('오류 메시지를 전송하는 데에도 실패했습니다:', followUpError);
      }
    }
  }
}

module.exports = { handleButtonInteraction };
