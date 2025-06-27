const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const { getFullDataByName } = require('../../utils/nexon-api');
const { WORLD_ICONS, MAIN_COLOR } = require('../../utils/constants');
const { formatCombatPower } = require('../../utils/formatting');

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
    await interaction.deferReply();

    const characterNameInput = interaction.options.getString('캐릭터_이름');
    const data = await getFullDataByName(characterNameInput);

    if (data.error) {
      return interaction.editReply({ content: data.message, flags: MessageFlags.Ephemeral });
    }

    const { characterName, combatPower, character_level, character_exp_rate, character_class, character_image, world_name } = data;

    const serverIcon = WORLD_ICONS[world_name] || null;

    const embed = new EmbedBuilder()
      .setColor(MAIN_COLOR)
      .setAuthor({ name: `${characterName}님의 정보`, iconURL: serverIcon })
      .addFields(
        { name: '레벨', value: `${character_level} (${character_exp_rate}%)`, inline: true },
        { name: '직업', value: `${character_class || '정보 없음'}`, inline: true },
        { name: '전투력', value: `${formatCombatPower(combatPower) || '정보 없음'}`, inline: true },
      )
      .setThumbnail(character_image || null);

    await interaction.editReply({ embeds: [embed] });
  },
};