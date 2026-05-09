import { actionToJSON } from "../utility/attack.mjs";
import { dehydrateAttackItem } from "../item/item-attack.mjs";

/**
 * Capitalize the first letter of the provided string
 */
export function capitalizeFirstLetter(initialString) {
    return `${initialString.charAt(0).toUpperCase()}${initialString.slice(1)}`;
}

/**
 * Generate a chat card for /heroroll or the GenericRoller.
 *
 * @param {HeroRoller} heroRoller
 * @param {string} chatCardFlavour
 * @param {Attack | null} action
 */
export async function generateChatMessage(heroRoller, chatCardFlavour, action) {
    let extraHtml = "";

    if (action) {
        const item = action.system.currentItem;
        const actor = item.actor;

        extraHtml += `
            <div data-visibility="gm">
                <button class="generic-roller-apply-damage"
                    title="Apply damage to selected tokens."
                    ${actor.uuid ? `data-actor-uuid='${actor.uuid}'` : ""}
                    ${item ? `data-item-json-str='${dehydrateAttackItem(item)}'` : ""}
                    data-action-data='${actionToJSON(action)}'
                    data-roller='${heroRoller.toJSON()}'
                    data-target-tokens='${JSON.stringify([])}'
                >
                    Apply ${capitalizeFirstLetter(heroRoller.getType())} Damage
                </button>
            </div>
        `;
    }

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
