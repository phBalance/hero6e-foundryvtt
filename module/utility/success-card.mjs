// v13 compatibility
const foundryVttRenderTemplate = foundry.applications?.handlebars?.renderTemplate || renderTemplate;

/**
 * Make a success roll and update the flavor passed in with the results. We put emphasis on the results and style it.
 *
 * @param {HeroRoller} roller
 * @param {string} flavor
 *
 * @returns
 */
export async function doSuccessRoll(roller, flavor) {
    await roller.roll();

    const succeeded = roller.getSuccess();
    const autoSuccess = roller.getAutoSuccess();
    const total = roller.getSuccessTotal();
    const margin = roller.getSuccessValue() - total;

    // PH: FIXME: Need to fix this. Removed bold as it shouldn't be used - move it to CSS.
    flavor += ` <span class="dice-flavor.dice-${succeeded ? "succeeded" : "failed"}">
            ${
                succeeded ? "succeeded" : "failed"
            } by ${autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`}
        </span>`;

    return { succeeded, flavor };
}

export async function generateSuccessChatCard(actor, token, speaker, item, roller, flavor, resourceDescription) {
    const renderedSuccessRoll = await roller.render();
    const template = `systems/${game.system.id}/templates/chat/success-card.hbs`;
    const cardData = {
        actor: actor,
        item: item,

        flavor: flavor,

        renderedSuccessRoll: renderedSuccessRoll,
        resourceDescription: resourceDescription,

        tags: roller.tags(),
    };
    const cardHtml = await foundryVttRenderTemplate(template, cardData);

    const chatData = {
        style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
        rolls: roller.rawRolls(),
        author: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    await ChatMessage.create(chatData);
}
