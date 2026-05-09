import { HeroRoller } from "./dice.mjs";

import { HeroSystem6eActor } from "../actor/actor.mjs";
import { dehydrateAttackItem } from "../item/item-attack.mjs";
import { actionToJSON, Attack } from "../utility/attack.mjs";

/**
 * Capitalize the first letter of the provided string
 *
 * @param {string} initialString
 *
 * @returns {string} - initialString with it's first character capitalized
 */
export function capitalizeFirstLetter(initialString) {
    return `${initialString.charAt(0).toUpperCase()}${initialString.slice(1)}`;
}

// NOTE: No application of damage for anything other than normal and killing attacks

export function createTemporaryItemAttackActionForApplyingDamage(heroRoller, defenseType) {
    const is5eAttack = heroRoller.is5eRoll;
    const powers = is5eAttack ? CONFIG.HERO.powers5e : CONFIG.HERO.powers6e;

    let xml = "";
    if (heroRoller.getType() === HeroRoller.ROLL_TYPE.NORMAL && defenseType === "MD") {
        xml = foundry.utils.deepClone(powers.find((power) => power.key === "EGOATTACK").xml);
    } else if (heroRoller.getType() === HeroRoller.ROLL_TYPE.NORMAL) {
        xml = powers
            .find((power) => power.key === "ENERGYBLAST")
            .xml.replace(/ INPUT="[PE]D"/, ` INPUT="${defenseType}"`);
    } else if (heroRoller.getType() === HeroRoller.ROLL_TYPE.KILLING) {
        xml = powers.find((power) => power.key === "RKA").xml.replace(/ INPUT="[EP]D"/, ` INPUT="${defenseType}"`);
    }

    let item = null;
    if (xml) {
        // Canvas selected token? If so, use that as the actor
        const actor = canvas.tokens.controlled.at(0)?.actor;
        const tempActor = new HeroSystem6eActor({
            name: "Generic Actor",
            type: "npc",
        });
        tempActor.system.is5e = is5eAttack;

        item = new HeroSystem6eItem(HeroSystem6eItem.itemDataFromXml(xml, actor || tempActor), {
            parent: actor || tempActor,
        });

        if (!actor) {
            tempActor.items.set(item.system.XMLID, item);
        }
    }

    const action = [HeroRoller.ROLL_TYPE.NORMAL, HeroRoller.ROLL_TYPE.KILLING].includes(heroRoller.getType())
        ? Attack.buildActionInfo(item, [], {})
        : null;

    return action;
}

/**
 * Generate a chat card for /heroroll or the GenericRoller.
 *
 * @param {HeroRoller} heroRoller
 * @param {string} chatCardFlavour
 * @param {Attack | null} attackAction
 */
export async function generateChatMessage(heroRoller, chatCardFlavour, attackAction) {
    let extraHtml = "";

    if (attackAction) {
        const item = attackAction.system.currentItem;
        const actor = item.actor;

        extraHtml += `
            <div data-visibility="gm">
                <button class="generic-roller-apply-damage"
                    title="Apply damage to selected tokens."
                    ${actor.uuid ? `data-actor-uuid='${actor.uuid}'` : ""}
                    ${item ? `data-item-json-str='${dehydrateAttackItem(item)}'` : ""}
                    data-action-data='${actionToJSON(attackAction)}'
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
