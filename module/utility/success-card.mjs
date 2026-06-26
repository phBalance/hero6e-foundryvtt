import { overrideCanAct } from "../settings/settings-helpers.mjs";

// v13 compatibility
const foundryVttRenderTemplate = foundry.applications?.handlebars?.renderTemplate || renderTemplate;

/**
 * Make a success roll and update the flavor passed in with the results. We put emphasis on the results and style it.
 *
 * @param {HeroSystem6eActor} actor
 * @param {HeroRoller} roller
 * @param {String} flavor
 *
 * @returns
 */
export async function doSuccessRoll(actor, roller, flavor) {
    await roller.roll();

    let succeeded = roller.getSuccess();
    const autoSuccess = roller.getAutoSuccess();
    const total = roller.getSuccessTotal();
    const margin = roller.getSuccessValue() - total;

    flavor = `${flavor} ${emphasizeSuccessFailureFlavour(succeeded, `by ${autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`}`)}`;

    // Forced success with the override key
    let successThroughOverride = false;
    if (!succeeded && overrideCanAct) {
        const overrideKeyText = game.keybindings.get(game.system.id, "OverrideCanAct")?.[0].key;
        ui.notifications.info(`${actor.name} succeeded roll because override key.`);
        succeeded = true;
        successThroughOverride = true;
        flavor += ` <p>Succeeded roll because ${game.user.name} used <b>${overrideKeyText}</b> key to override.</p>`;
    }

    return { succeeded, successThroughOverride, flavor };
}

/**
 *
 * @param {Boolean} succeeded
 * @param {String} flavor
 *
 * @returns {String}
 */
export function emphasizeSuccessFailureFlavour(succeeded, flavor) {
    return `<span class="${succeeded ? "announce-success" : "announce-failure"}">
                ${succeeded ? "succeeded" : "failed"} ${flavor}.
            </span>`;
}

/**
 * Generate a chat card related to a success roll.
 *
 * @param {HeroSystem6eActor} actor
 * @param {String} speaker
 * @param {String} flavor
 * @param {HeroRoller | falsy} roller
 * @param {String | falsy} resourceDescription
 */
export async function generateSuccessChatCard(actor, speaker, flavor, roller, resourceDescription) {
    const renderedSuccessRoll = roller ? await roller.render() : null;
    const template = `systems/${game.system.id}/templates/chat/success-card.hbs`;
    const cardData = {
        actor: actor,

        flavor: flavor,

        renderedSuccessRoll: renderedSuccessRoll,
        resourceDescription: resourceDescription,

        tags: roller?.tags(),
    };
    const cardHtml = await foundryVttRenderTemplate(template, cardData);

    const chatData = {
        style: CONFIG.HERO.CHAT_MESSAGE_DEFAULT_STYLE,
        rolls: roller?.rawRolls(),
        author: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    await ChatMessage.create(chatData);
}
