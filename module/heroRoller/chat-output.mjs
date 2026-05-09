/**
 * Generate a chat card for /heroroll or the GenericRoller.
 *
 * @param {HeroRoller} heroRoller
 * @param {string} chatCardFlavour
 * @param {string} extraHtml
 */
export async function generateChatMessage(heroRoller, chatCardFlavour, extraHtml) {
    // PH: FIXME: should we merge the roller output flavour text between generic and /heroroll?
    const cardHtml = (await heroRoller.render(chatCardFlavour)) + extraHtml;

    const speaker = ChatMessage.getSpeaker();
    const chatData = {
        style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
        rolls: heroRoller.rawRolls(),
        author: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    await ChatMessage.create(chatData);
}
