import { HeroSystem6eItem } from "../item/item.mjs";
import { HeroSystem6eActor } from "../actor/actor.mjs";

export async function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("tr") || a.closest("li");

    if (!li) {
        return;
    }

    const effect = Array.from(owner.allApplicableEffects()).find((o) => o.id == li.dataset.effectId);
    const item = owner.items.get(li.dataset.effectId);

    switch (a.dataset.action) {
        case "create":
            return owner.createEmbeddedDocuments("ActiveEffect", [
                {
                    label: "New Effect",
                    img: "icons/svg/aura.svg",
                    origin: owner.uuid,
                    disabled: true,
                },
            ]);

        case "edit":
            return (effect || item).sheet.render(true);

        case "delete": {
            if (!effect) {
                return;
            }

            const confirmed = await Dialog.confirm({
                title: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Title") + " [" + effect.name + "]",
                content: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Content"),
            });

            if (confirmed) {
                if (effect) {
                    if (!effect.disabled) {
                        await onActiveEffectToggle(effect);
                    }

                    // fixup characteristics value when AE is manually removed
                    const actor = effect.parent;
                    for (const change of effect.changes) {
                        const xmlid = change.key.match(/([a-z]+)\.max/)?.[1];
                        if (xmlid) {
                            if (actor?.system?.characteristics?.[xmlid]) {
                                const value = parseInt(change.value) || 0;
                                if (value > 0) {
                                    await actor.update({
                                        [`system.characteristics.${xmlid}.value`]: Math.max(
                                            actor.system.characteristics[xmlid].value - value,
                                            actor.system.characteristics[xmlid].max - value,
                                        ),
                                    });
                                }
                                if (value < 0) {
                                    await actor.update({
                                        [`system.characteristics.${xmlid}.value`]: Math.min(
                                            actor.system.characteristics[xmlid].value + value,
                                            actor.system.characteristics[xmlid].max + value,
                                        ),
                                    });
                                }
                            }
                        }
                    }
                    await effect.delete();
                } else {
                    await item.delete();
                }
            }
            return;
        }

        case "toggle":
            if (effect) {
                return onActiveEffectToggle(effect);
            }

            return item.toggle(event);

        default:
            console.error(`Unknown dataset action ${a.dataset.action} for active effect`);
            break;
    }
}

export async function onActiveEffectToggle(effect, newActiveState) {
    // AARON thinks we can get rid of newActiveState instead relying on effect.disabled

    // guard (we turned off an AID/DRAIN active effect, don't toggle the base item)
    if (effect.flags[game.system.id]?.type === "adjustment") return;

    // Group the AE and Item changes into a single await
    const promises = [];

    if (newActiveState == undefined) {
        console.warn("newActiveState == undefined");
        promises.push(effect.update({ disabled: !effect.disabled }));
        newActiveState = !effect.disabled;
    } else {
        promises.push(effect.update({ disabled: !newActiveState }));
    }

    // If this is an item update active state
    const origin = await fromUuid(effect.origin);
    const item = origin instanceof HeroSystem6eItem ? origin : effect.parent;
    const actor = item?.actor || (item instanceof HeroSystem6eActor ? item : null);
    // if (item) {
    //     promises.push(item.update({ "system.active": newActiveState }));
    // }

    // This is to prevent the item.isActive from getting confused between
    // system.active and the AE.disabled
    await Promise.all(promises);

    // Characteristic VALUE should change when toggled on/off
    // CHALLENGE: Can we replace this with a different technique?
    // Modifying the VALUE when MAX is changed may be causing race conditions.
    // Can we change MAX & VALUE in the same database operation?
    const actorChanges = {};
    for (const change of effect.changes) {
        // match something like system.characteristics.stun.max
        const charMatch = change.key.match(/characteristics\.(.+)\.max$/);
        if (charMatch) {
            const char = charMatch[1];
            const value = effect.disabled ? -parseInt(change.value) : parseInt(change.value);
            actorChanges[`system.characteristics.${char}.value`] =
                parseInt(actor.system.characteristics[char].value) + value;
        }
    }

    return Object.keys(actorChanges).length > 0 ? actor.update(actorChanges) : null;
}
