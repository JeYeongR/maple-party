async function replyAndDestroy(interaction, content, duration = 10000) {
    try {
        const options = { content, ephemeral: true };

        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(options);
        } else {
            await interaction.reply(options);
        }

        setTimeout(() => {
            interaction.deleteReply().catch(error => {
                if (error.code !== 10008) { // Unknown Message
                    console.error('자동 삭제 응답 메시지를 지우는 데 실패했습니다:', error);
                }
            });
        }, duration);
    } catch (error) {
        console.error('자동 삭제 응답 메시지를 보내는 데 실패했습니다:', error);
    }
}

async function followUpAndDestroy(interaction, content, duration = 10000) {
    try {
        const message = await interaction.followUp({ content, ephemeral: true, fetchReply: true });
        setTimeout(() => {
            interaction.deleteFollowUp(message.id).catch(error => {
                if (error.code !== 10008) { // Unknown Message
                    console.error('자동 삭제 후속 메시지를 지우는 데 실패했습니다:', error);
                }
            });
        }, duration);
    } catch (error) {
        console.error('자동 삭제 후속 메시지를 보내는 데 실패했습니다:', error);
    }
}

module.exports = { replyAndDestroy, followUpAndDestroy };
