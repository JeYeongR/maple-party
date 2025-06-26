const axios = require('axios');

const api = axios.create({
    baseURL: 'https://open.api.nexon.com/maplestory/v1',
    headers: {
        'x-nxopen-api-key': process.env.NEXON_API_KEY,
    },
});

async function getOcid(characterName) {
    try {
        const response = await api.get(`/id?character_name=${encodeURIComponent(characterName)}`);
        return response.data.ocid;
    } catch (error) {
        console.error(`Error fetching OCID for ${characterName}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function getCharacterStats(ocid) {
    if (!ocid) return null;
    try {
        const response = await api.get(`/character/stat?ocid=${ocid}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stats for OCID ${ocid}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function getCharacterBasic(ocid) {
    if (!ocid) return null;
    try {
        const response = await api.get(`/character/basic?ocid=${ocid}`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching basic info for OCID ${ocid}:`, error.response ? error.response.data : error.message);
        return null;
    }
}

async function getFullDataByName(characterName) {
    const ocid = await getOcid(characterName);
    if (!ocid) {
        return { error: 'NOT_FOUND', message: `캐릭터(${characterName})를 찾을 수 없습니다.` };
    }

    const [statInfo, basicInfo] = await Promise.all([
        getCharacterStats(ocid),
        getCharacterBasic(ocid),
    ]);

    if (!statInfo || !basicInfo) {
        return { error: 'API_ERROR', message: `캐릭터(${characterName}) 정보를 가져오는데 실패했습니다.` };
    }

    const combatPowerStat = statInfo.final_stat.find(stat => stat.stat_name === '전투력');
    const combatPower = combatPowerStat ? parseInt(combatPowerStat.stat_value, 10) : 0;

    return {
        characterName,
        combatPower,
        character_level: basicInfo.character_level,
        character_exp_rate: basicInfo.character_exp_rate,
        character_class: basicInfo.character_class,
        character_image: basicInfo.character_image,
        world_name: basicInfo.world_name,
    };
}

async function getBasicInfoByName(characterName) {
    const ocid = await getOcid(characterName);
    if (!ocid) {
        return { error: 'NOT_FOUND', message: `캐릭터(${characterName})를 찾을 수 없습니다.` };
    }

    const basicInfo = await getCharacterBasic(ocid);
    if (!basicInfo) {
        return { error: 'API_ERROR', message: `캐릭터(${characterName}) 정보를 가져오는데 실패했습니다.` };
    }

    return {
        characterName,
        character_level: basicInfo.character_level,
        character_exp_rate: basicInfo.character_exp_rate,
    };
}

async function getStatInfoByName(characterName) {
    const ocid = await getOcid(characterName);
    if (!ocid) {
        return { error: 'NOT_FOUND', message: `캐릭터(${characterName})를 찾을 수 없습니다.` };
    }

    const statsInfo = await getCharacterStats(ocid);
    if (!statsInfo) {
        return { error: 'API_ERROR', message: `캐릭터(${characterName}) 정보를 가져오는데 실패했습니다.` };
    }

    const combatPowerStat = statsInfo.final_stat.find(stat => stat.stat_name === '전투력');
    const combatPower = combatPowerStat ? parseInt(combatPowerStat.stat_value, 10) : 0;

    return {
        characterName,
        combatPower,
    };
}

module.exports = {
    getFullDataByName,
    getBasicInfoByName,
    getStatInfoByName,
};
