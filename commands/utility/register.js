const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'db.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('등록')
    .setDescription('메이플 아이디를 등록합니다.')
    .addStringOption(option =>
      option.setName('아이디')
        .setDescription('등록할 메이플 아이디')
        .setRequired(true)),
  async execute(interaction) {
    const mapleId = interaction.options.getString('아이디');
    const discordId = interaction.user.id;

    let db = {};
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      if (data) {
        db = JSON.parse(data);
      }
    }

    db[discordId] = mapleId;

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    await interaction.reply({ content: `'${mapleId}'(으)로 메이플 아이디 등록이 완료되었습니다!`, ephemeral: true });
  },
};