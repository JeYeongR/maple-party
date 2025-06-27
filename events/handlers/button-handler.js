const { ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { updateCell, getRangeData } = require('../../utils/google-sheets-util');

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
        await interaction.followUp({ content: '❌ 시트에서 값을 읽어오는 데 실패했습니다.', ephemeral: true });
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
        await interaction.followUp({ content: '❌ 시트 업데이트에 실패했습니다. 관리자에게 문의해주세요.', ephemeral: true });
      }
    } catch (error) {
      console.error('버튼 상호작용 처리 중 오류 발생:', error);
      try {
        await interaction.followUp({ content: '오류가 발생하여 작업을 완료할 수 없습니다. 잠시 후 다시 시도해주세요.', ephemeral: true });
      } catch (followUpError) {
        // 추가하기
      }
    }
  }
}

module.exports = { handleButtonInteraction };
