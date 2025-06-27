const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const { readDB, writeDB } = require('../../utils/db');
const { getFullDataByName } = require('../../utils/nexon-api');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('등록')
    .setDescription('메이플 아이디를 등록합니다.')
    .addStringOption(option =>
      option.setName('아이디')
        .setDescription('등록할 메이플 아이디')
        .setRequired(true)),
  async execute(interaction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const characterName = interaction.options.getString('아이디');
    const discordId = interaction.user.id;

    const characterData = await getFullDataByName(characterName);

    if (characterData.error) {
      return interaction.editReply({ content: characterData.message, flags: MessageFlags.Ephemeral });
    }

    const db = readDB();
    db[discordId] = characterData.characterName;
    writeDB(db);

    await interaction.editReply({ content: `'${characterData.characterName}'(으)로 메이플 아이디 등록이 완료되었습니다!` });

    setTimeout(() => {
      interaction.deleteReply().catch(error => {
        if (error.code !== 10008) {
          console.error('등록 완료 메시지 삭제 중 오류 발생:', error);
        }
      });
    }, 30000); // 30초
  },
};