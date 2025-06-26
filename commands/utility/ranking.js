const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', '..', 'db.json');

const formatCombatPower = (num) => {
  let result = `${Math.floor(num % 10000)}`;

  if (num > 10000) {
    result = `${Math.floor(num / 10000)}만 ` + result;
  }

  if (num > 100000000) {
    result = `${Math.floor(num / 100000000)}억 ` + result;
  }

  return result;
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
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '먼저 음성 채널에 참여해주세요!', ephemeral: true });
    }

    let db = {};
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf8');
      if (data) {
        db = JSON.parse(data);
      }
    }

    let isAllRegistered = true;
    let notRegisteredUser = [];
    const mapleIds = voiceChannel.members.map(member => {
      if (!db[member.id]) {
        isAllRegistered = false;
        notRegisteredUser.push(member.user.globalName);
        return;
      }
      return db[member.id];
    });

    const result = await Promise.all(mapleIds.map(async (mapleId) => {
      const ocidResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(mapleId)}`, {
        headers: {
          'x-nxopen-api-key': process.env.NEXON_API_KEY,
        },
      });

      if (!ocidResponse.data || !ocidResponse.data.ocid) {
        console.warn(`OCID not found for character: ${mapleId}. API Response:`, ocidResponse.data);
        return { error: 'NOT_FOUND', message: '캐릭터를 찾을 수 없습니다. 철자를 확인해주세요.' };
      }
      const ocid = ocidResponse.data.ocid;

      const statInfoResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/character/stat?ocid=${ocid}`, {
        headers: {
          'x-nxopen-api-key': process.env.NEXON_API_KEY,
        },
      });

      if (!statInfoResponse.data) {
        console.error('No basic info returned for OCID:', ocid, 'API Response:', statInfoResponse.data);
        return { error: 'API_ERROR', message: '캐릭터 스텟 정보를 가져오는데 실패했습니다.' };
      }

      const basicInfoResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`, {
        headers: {
          'x-nxopen-api-key': process.env.NEXON_API_KEY,
        },
      });

      if (!basicInfoResponse.data) {
        console.error('No basic info returned for OCID:', ocid, 'API Response:', basicInfoResponse.data);
        return { error: 'API_ERROR', message: '캐릭터 기본 정보를 가져오는데 실패했습니다.' };
      }

      const finalStat = statInfoResponse.data.final_stat;
      let combatPower = 0;
      finalStat.map((stat) => {
        if (stat.stat_name == '전투력') {
          combatPower = stat.stat_value;
        }
      });

      return {
        mapleId,
        combatPower,
        character_level: basicInfoResponse.data.character_level,
        character_exp_rate: basicInfoResponse.data.character_exp_rate,
      }
    }));

    result.sort((a, b) => b.combatPower - a.combatPower);

    let description = "";

    if (interaction.options.getString('기준') == 'combat_power') {
      description = result.map((user, index) => `${index + 1}. ${user.mapleId} - ${formatCombatPower(user.combatPower)}`).join('\n')
    } else if (interaction.options.getString('기준') == 'level') {
      description = result.map((user, index) => `${index + 1}. ${user.mapleId} - Lv. ${user.character_level} (${user.character_exp_rate}%)`).join('\n')
    }

    const embed = new EmbedBuilder()
      .setColor('#FEDDEE')
      .setTitle(`${interaction.options.getString('기준') == 'combat_power' ? '전투력' : '레벨'} 랭킹`)
      .setDescription(description);

    await interaction.reply(isAllRegistered ? { embeds: [embed] } : { content: `"/등록" 명령어로 아이디를 모두 등록해주세요! [${notRegisteredUser.join(', ')}]` });
  },
};