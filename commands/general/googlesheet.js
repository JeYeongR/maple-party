const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('구글시트')
    .setDescription('보스 클리어 현황 구글 시트 링크를 보여줍니다.'),
  async execute(interaction) {
    const spreadsheetId = process.env.SPREADSHEET_ID;
    if (!spreadsheetId) {
      await interaction.reply({ content: '오류: 구글 시트 ID가 설정되지 않았습니다. 관리자에게 문의하세요.', ephemeral: true });
      return;
    }

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;

    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setLabel('구글 시트 열기')
          .setStyle(ButtonStyle.Link)
          .setURL(sheetUrl)
      );

    await interaction.reply({
      content: '아래 버튼을 클릭하여 구글 시트를 열 수 있습니다.',
      components: [row],
      ephemeral: true,
    });

    setTimeout(() => {
      interaction.deleteReply().catch(error => {
        if (error.code !== 10008) {
          console.error('등록 완료 메시지 삭제 중 오류 발생:', error);
        }
      });
    }, 180000); // 3분
  },
};
