const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const search = async (query) => {
  try {
    const ocidResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/id?character_name=${encodeURIComponent(query)}`, {
      headers: {
        'x-nxopen-api-key': process.env.NEXON_API_KEY,
      },
    });

    if (!ocidResponse.data || !ocidResponse.data.ocid) {
      console.warn(`OCID not found for character: ${query}. API Response:`, ocidResponse.data);
      return { error: 'NOT_FOUND', message: '캐릭터를 찾을 수 없습니다. 철자를 확인해주세요.' };
    }
    const ocid = ocidResponse.data.ocid;

    const basicInfoResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/character/basic?ocid=${ocid}`, {
      headers: {
        'x-nxopen-api-key': process.env.NEXON_API_KEY,
      },
    });

    if (!basicInfoResponse.data) {
      console.error('No basic info returned for OCID:', ocid, 'API Response:', basicInfoResponse.data);
      return { error: 'API_ERROR', message: '캐릭터 기본 정보를 가져오는데 실패했습니다.' };
    }

    const statInfoResponse = await axios.get(`https://open.api.nexon.com/maplestory/v1/character/stat?ocid=${ocid}`, {
      headers: {
        'x-nxopen-api-key': process.env.NEXON_API_KEY,
      },
    });

    if (!statInfoResponse.data) {
      console.error('No basic info returned for OCID:', ocid, 'API Response:', statInfoResponse.data);
      return { error: 'API_ERROR', message: '캐릭터 스텟 정보를 가져오는데 실패했습니다.' };
    }

    return {
      basicInfo: basicInfoResponse.data,
      statInfo: statInfoResponse.data,
    };

  } catch (error) {
    console.error(`Error fetching character data for '${query}':`, error.response ? error.response.data : error.message);
    if (error.response && error.response.data && error.response.data.error) {
      const apiError = error.response.data.error;
      if (apiError.name === 'OPENAPI00004') {
        return { error: 'NOT_FOUND', message: `캐릭터를 찾을 수 없습니다. (API: ${apiError.message})` };
      }
      return { error: 'API_ERROR', message: `API 오류: ${apiError.message} (코드: ${apiError.name})` };
    }
    return { error: 'NETWORK_ERROR', message: '데이터를 가져오는 중 네트워크 오류가 발생했습니다.' };
  }
};

const formatCombatPower = (num) => {
  const eok = 100000000;
  const man = 10000;

  if (num >= eok) {
    const eokVal = Math.floor(num / eok);
    const manVal = Math.floor((num % eok) / man);
    if (manVal > 0) {
      return `${eokVal}억 ${manVal}만`;
    }
    return `${eokVal}억`;
  }
  if (num >= man) {
    const manVal = Math.floor(num / man);
    return `${manVal}만`;
  }
  return num;
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('검색')
    .setDescription('메이플스토리 캐릭터 정보를 검색합니다.')
    .addStringOption(option =>
      option.setName('캐릭터_이름')
        .setDescription('검색할 캐릭터 이름')
        .setRequired(true),
    ),
  async execute(interaction) {
    const characterNameInput = interaction.options.getString('캐릭터_이름');
    const result = await search(characterNameInput);

    if (result && result.error) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('오류 발생')
        .setDescription(result.message || '캐릭터 정보를 가져오는 중 알 수 없는 오류가 발생했습니다.');
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    if (result && result.basicInfo.character_name) {
      let displayName = result.basicInfo.character_name;
      const targetLength = 6; // 목표 글자 수 (캐릭터명 최대 6글자)
      const currentLength = displayName.length;

      if (currentLength < targetLength) {
        // 부족한 길이만큼 앞쪽에 non-breaking space 추가
        const padding = '\u00A0'.repeat(targetLength - currentLength);
        displayName = padding + displayName;
      }

      const finalStat = result.statInfo.final_stat;
      let combatPower = 0;
      finalStat.map((stat) => {
        if (stat.stat_name == '전투력') {
          combatPower = formatCombatPower(stat.stat_value);
        }
      });
      const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setAuthor({ name: `${displayName}님의 정보`, iconURL: result.basicInfo.character_image || null })
        .addFields(
          { name: '레벨', value: `${result.basicInfo.character_level || '정보 없음'}`, inline: true },
          { name: '직업', value: `${result.basicInfo.character_class || '정보 없음'}`, inline: true },
          { name: '서버', value: `${result.basicInfo.world_name || '정보 없음'}`, inline: true },
          { name: '전투력', value: `${combatPower || '정보 없음'}`, inline: true },
        )
        .setTimestamp()
        .setFooter({ text: 'MapleStory 캐릭터 정보', iconURL: 'https://ssl.nexon.com/s2/game/maplestory/renewal/common/logo.png' });

      await interaction.reply({ embeds: [embed] });
    } else {
      console.error('Unexpected result format or no character_name:', result);
      const fallbackErrorEmbed = new EmbedBuilder()
        .setColor(0xFF0000)
        .setTitle('오류 발생')
        .setDescription('캐릭터 정보를 가져오지 못했습니다. 입력값을 확인하거나 잠시 후 다시 시도해주세요.');
      await interaction.reply({ embeds: [fallbackErrorEmbed], ephemeral: true });
    }
  },
};