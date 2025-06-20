const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

const search = async (query) => {
  const { data: { ocid } } = await axios.get(`https://open.api.nexon.com/maplestory/v1/id?character_name=${query}`, {
    headers: {
      'x-nxopen-api-key': process.env.NEXON_API_KEY,
    },
  });

  const { data } = await axios.get(`https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`, {
    headers: {
      'x-nxopen-api-key': process.env.NEXON_API_KEY,
    },
  });

  return data;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('검색')
    .setDescription('캐릭터 레벨을 검색합니다.')
    .addStringOption(option =>
      option.setName('캐릭터_이름')
        .setDescription('검색할 캐릭터 이름')
        .setRequired(true),
    ),
  async execute(interaction) {
    const result = await search(interaction.options.getString('캐릭터_이름'));
    await interaction.reply(`캐릭터 이름: ${result.character_name}, 캐릭터 레벨: ${result.character_level}, 캐릭터 직업: ${result.character_class}`);
  },
};