import { HeroSystem6eActorActiveEffects } from "../actor/actor-active-effects.mjs";
import { HeroSystem6eActor } from "../actor/actor.mjs";
import { dehydrateAttackItem } from "./item-attack.mjs";

/**
 * Maneuvers have some rules of their own that should be considered.
 *
 * @param {*} actor
 * @param {*} item
 */
export async function enforceManeuverLimits(actor, item) {
    // const maneuverItems = actor.items.filter((e) => ["maneuver", "martialart"].includes(e.type));

    await item.update({ "system.active": !item.system.active });

    // PH: FIXME: Not sure this is correct
    //     if (item.system.active) {
    //         if (item.name === "Block") {
    //             for (const maneuver of maneuverItems) {
    //                 if (maneuver.system.active && maneuver.name !== "Block") {
    //                     await maneuver.update({ "system.active": false });
    //                 }
    //             }
    //         } else {
    //             const block = maneuverItems.find((maneuver) => maneuver.name === "Block");
    //             if (block && block?.system?.active) {
    //                 await block.update({ "system.active": false });
    //             }
    //         }
    //     }
}

// FIXME: DCV should only be effective against HTH attacks unless it's a Dodge
function addDcvTraitToChanges(maneuverDcvChange) {
    if (maneuverDcvChange !== 0) {
        return {
            key: "system.characteristics.dcv.value",
            value: maneuverDcvChange,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        };
    }
}

function addOcvTraitToChanges(maneuverOcvChange) {
    if (maneuverOcvChange !== 0) {
        return {
            key: "system.characteristics.ocv.value",
            value: maneuverOcvChange,
            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
        };
    }
}

/**
 * Create flags that will allow us to expire effects on the next phase. If the item is an
 * original item then the item uuid will suffice otherwise the dehydrated item and actor uuid needs to be used
 *
 * @param {*} item
 * @returns
 */
function buildManeuverNextPhaseFlags(item) {
    return buildManeuverFlags(item, "maneuverNextPhaseEffect");
}

/**
 * Create flags that will allow us to expire effects on the next phase. If the item is an
 * original item then the item uuid will suffice otherwise the dehydrated item and actor uuid needs to be used
 *
 * @param {*} item
 * @returns
 */
// function buildManeuverNextSegmentFlags(item) {
//     return buildManeuverFlags(item, "maneuverNextSegementEffect");
// }

/**
 * Create flags that will allow us to expire effects on the next phase. If the item is an
 * original item then the item uuid will suffice otherwise the dehydrated item and actor uuid needs to be used
 *
 * @param {*} item
 * @param {string} type
 * @returns
 */
function buildManeuverFlags(item, type) {
    return {
        [game.system.id]: {
            type: type,
            itemUuid: item.uuid,
            toggle: item.isActivatable(),
            dehydratedManeuverItem: dehydrateAttackItem(item),
            dehydratedManeuverActorUuid: item.actor.uuid,
        },
    };
}

/**
 * Things which have the "abort" trait in their effect can be aborted to.
 * @returns {boolean}
 */
export function maneuverCanBeAbortedTo(item) {
    const maneuverHasAbortTrait = item.system.EFFECT?.toLowerCase().indexOf("abort") > -1;
    return !!maneuverHasAbortTrait;
}

/**
 * Things which have the "Attacker Falls" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasAttackerFallsTrait(item) {
    const maneuverHasAttackerFallsTrait = item.system.EFFECT?.search(/you fall/i) > -1;
    return !!maneuverHasAttackerFallsTrait;
}

/**
 * Things which have the "block" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasBlockTrait(item) {
    const maneuverHasBlockTrait = item.system.EFFECT?.search(/block/i) > -1;
    return !!maneuverHasBlockTrait;
}

/**
 * Things which have the "dodge" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasDodgeTrait(item) {
    const maneuverHasDodgeTrait = item.system.EFFECT?.search(/dodge/i) > -1;
    return !!maneuverHasDodgeTrait;
}

/**
 * Things which have the "flash dc" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasFlashTrait(item) {
    const maneuverHasFlashTrait = item.system.EFFECT?.search(/\[FLASHDC\]/i) > -1;
    return !!maneuverHasFlashTrait;
}

/**
 * Things which have the "grab" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasGrabTrait(item) {
    const maneuverHasGrabTrait = item.system.EFFECT?.search(/grab/i) > -1;
    return !!maneuverHasGrabTrait;
}

/**
 * Things which have the "Target Falls" trait in their effect.
 * @returns {boolean}
 */
export function maneuverHasTargetFallsTrait(item) {
    const maneuverHasTargetFallsTrait = item.system.EFFECT?.search(/target falls/i) > -1;
    return !!maneuverHasTargetFallsTrait;
}

/**
 * Activate a combat or martial maneuver
 */
export async function activateManeuver(item) {
    const effect = item.system.EFFECT?.toLowerCase();
    if (!effect) {
        return;
    }

    // PH: FIXME: This could be simplified as it's really just an effect + the same modifiers
    const newActiveEffects = [];

    // FIXME: These are supposed to be for HTH or ranged combat only except for dodge.
    const dcvTrait = parseInt(item.system.DCV === "--" ? 0 : item.system.DCV || 0);
    const ocvTrait = parseInt(item.system.OCV === "--" ? 0 : item.system.OCV || 0);

    // Types of effects for this maneuver?
    const hasDodgeTrait = maneuverHasDodgeTrait(item);
    const hasBlockTrait = maneuverHasBlockTrait(item);

    // Dodge effect
    if (hasDodgeTrait) {
        const dodgeStatusEffect = foundry.utils.deepClone(HeroSystem6eActorActiveEffects.statusEffectsObj.dodgeEffect);
        dodgeStatusEffect.name = item.name ? `${item.name} (${item.system.XMLID})` : `${item.system.XMLID}`;
        dodgeStatusEffect.flags = buildManeuverNextPhaseFlags(item);
        dodgeStatusEffect.changes = [addDcvTraitToChanges(dcvTrait), addOcvTraitToChanges(ocvTrait)].filter(Boolean);
        newActiveEffects.push(item.actor.addActiveEffect(dodgeStatusEffect));
    }

    // Block effect
    else if (hasBlockTrait) {
        const blockStatusEffect = foundry.utils.deepClone(HeroSystem6eActorActiveEffects.statusEffectsObj.blockEffect);
        blockStatusEffect.name = item.name ? `${item.name} (${item.system.XMLID})` : `${item.system.XMLID}`;
        blockStatusEffect.flags = buildManeuverNextPhaseFlags(item);
        blockStatusEffect.changes = [addDcvTraitToChanges(dcvTrait), addOcvTraitToChanges(ocvTrait)].filter(Boolean);
        newActiveEffects.push(item.actor.addActiveEffect(blockStatusEffect));
    }

    // Other maneuvers with effects
    // Turn on any status effects that we have implemented
    else if (item.system.XMLID === "BRACE") {
        // NOTE: This effect is special and doesn't come off as the start of the next phase
        newActiveEffects.push(item.actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.braceEffect));
    } else if (item.system.XMLID === "HAYMAKER") {
        newActiveEffects.push(
            item.actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.haymakerEffect),
        );
    } else if (
        item.system.XMLID === "COVER" ||
        item.system.XMLID === "HIPSHOT" ||
        item.system.XMLID === "HURRY" ||
        item.system.XMLID === "SET" ||
        item.system.XMLID === "SETANDBRACE" ||
        item.system.XMLID === "PULLINGAPUNCH"
    ) {
        console.error(`Unsupported maneuver ${item.detailedName()}`);
    } else {
        // PH: FIXME: Assume this is a martial maneuver and give it a default effect
        const maneuverEffect = foundry.utils.deepClone(HeroSystem6eActorActiveEffects.statusEffectsObj.strikeEffect);
        maneuverEffect.flags = buildManeuverNextPhaseFlags(item);
        maneuverEffect.name = item.name ? `${item.name} (${item.system.XMLID})` : `${item.system.XMLID}`;
        maneuverEffect.changes = [addDcvTraitToChanges(dcvTrait), addOcvTraitToChanges(ocvTrait)].filter(Boolean);

        if (item.actor.effects.find((ae) => ae.name === maneuverEffect.name)) {
            // Unclear why we are creating this effect a second time.
            // TODO: Check for duplicate effect sooner.
            console.warn(`${maneuverEffect.name} already exists`);
        } else {
            newActiveEffects.push(item.actor.createEmbeddedDocuments("ActiveEffect", [maneuverEffect]));
        }
    }

    return Promise.all(newActiveEffects);
}

/**
 * Deactivate a combat or martial maneuver
 */
export async function deactivateManeuver(item) {
    const removedEffects = [];

    const effect = item.system.EFFECT?.toLowerCase();
    if (effect) {
        const maneuverHasDodgeTrait = effect.indexOf("dodge") > -1;
        const maneuverHasBlockTrait = effect.indexOf("block") > -1;

        if (maneuverHasDodgeTrait) {
            removedEffects.push(
                item.actor.removeActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.dodgeEffect),
            );
        }

        if (maneuverHasBlockTrait) {
            removedEffects.push(
                item.actor.removeActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.blockEffect),
            );
        }
    }

    // Turn off any status effects that we have implemented
    if (item.system.XMLID === "BRACE") {
        removedEffects.push(item.actor.removeActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.braceEffect));
    } else if (item.system.XMLID === "HAYMAKER") {
        removedEffects.push(
            item.actor.removeActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.haymakerEffect),
        );
    }

    return Promise.all(removedEffects);
}

/**
 * For maneuvers that require a hit we may require some status changes in addition or instead of damage.
 *
 * @param {*} item
 * @param {*} action
 * @returns
 */
export async function doManeuverEffects(item, action) {
    const newActiveEffects = [];
    const hasAttackerFallsTrait = maneuverHasAttackerFallsTrait(item);
    const hasGrabTrait = maneuverHasGrabTrait(item);
    const hasTargetFallsTrait = maneuverHasTargetFallsTrait(item);

    // PH: FIXME: action.system.currentTargets is no longer available at this point

    // Add prone effects (attacker and target)
    if (hasTargetFallsTrait) {
        const currentTargets = action.system.currentTargets || [];
        currentTargets.forEach((targetedToken) => {
            const actor = HeroSystem6eActor.get(targetedToken.document.actorId);
            newActiveEffects.push(actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.proneEffect));
        });
    }

    if (hasAttackerFallsTrait) {
        newActiveEffects.push(item.actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.proneEffect));
    }

    if (hasGrabTrait) {
        // The attacker gets the grabbed state
        newActiveEffects.push(item.actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.grabEffect));

        // The defender/target gets the grabbed state
        const currentTargets = action.system.currentTargets || [];
        currentTargets.forEach((targetedToken) => {
            const actor = HeroSystem6eActor.get(targetedToken.document.actorId);
            newActiveEffects.push(actor.addActiveEffect(HeroSystem6eActorActiveEffects.statusEffectsObj.grabEffect));
        });
    }

    return Promise.all(newActiveEffects);
}
