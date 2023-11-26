import { HeroSystem6eItem } from '../item/item.js'
import { HeroSystem6eActor } from '../actor/actor.js'

export async function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("tr") || a.closest("li");
    if (!li) return
    //const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    const effect = Array.from(owner.allApplicableEffects()).find(o => o.id == li.dataset.effectId)
    const item = owner.items.get(li.dataset.effectId);

    // guard or perhaps a defense item
    // if (!effect) {
    //     const item = owner.items.get(li.dataset.effectId);
    //     if (item) {
    //         switch (a.dataset.action) {
    //             case "edit":
    //                 item.sheet.render(true);
    //                 break;
    //             case "toggle":
    //                 item.toggle();
    //                 break;
    //             case "delete":
    //                 const confirmed = await Dialog.confirm({
    //                     title: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Title"),
    //                     content: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Content")
    //                 });

    //                 if (confirmed) {
    //                     item.delete()
    //                     //this.render();
    //                 }
    //                 break;
    //         }
    //     }
    //     return;
    // }

    switch (a.dataset.action) {
        case "create":
            return owner.createEmbeddedDocuments("ActiveEffect", [{
                label: "New Effect",
                icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                disabled: true,
                //   "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                //   disabled: li.dataset.effectType === "inactive"
            }])

        case "edit":
            return (effect || item).sheet.render(true);

        case "delete":
            {
                if (!effect) {
                    return
                }

                const confirmed = await Dialog.confirm({
                    title: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Title") + " [" + effect.name + "]",
                    content: game.i18n.localize("HERO6EFOUNDRYVTTV2.confirms.deleteConfirm.Content")
                });

                if (confirmed) {

                    if (effect) {
                        if (!effect.disabled) {
                            await onActiveEffectToggle(effect)
                        }
                        await effect.delete()
                    } else {
                        item.delete()
                    }


                    //let actor = effect.parent instanceof HeroSystem6eActor ? effect.parent : effect.parent.actor

                    // Characteristic VALUE should not exceed MAX
                    // for (let char of Object.keys(actor.system.characteristics)) {
                    //     if (actor.system.characteristics[char].value > actor.system.characteristics[char].max) {
                    //         await actor.update({ [`system.characteristics.${char}.value`]: actor.system.characteristics[char].max })
                    //         //updates.push({[`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].max)});
                    //     }
                    // }
                }
                return
            }

        case "toggle":
            if (effect) {
                return onActiveEffectToggle(effect)
            }

            return item.toggle();
    }
}

export async function onActiveEffectToggle(effect, newState) {

    if (newState == undefined) {
        await effect.update({ disabled: !effect.disabled })
        newState = effect.disabled
    } else {
        await effect.update({ disabled: newState })
    }

    // If this is an item update active state
    const origin = await fromUuid(effect.origin);
    const item = origin instanceof HeroSystem6eItem ? origin : effect.parent
    const actor = item?.actor || (item instanceof HeroSystem6eActor ? item : null)
    if (item) {
        await item.update({ 'system.active': newState })
    }

    // Characteristic VALUE should change when toggled on
    for (let change of effect.changes) {
        // system.characteristics.stun.max
        const charMatch = change.key.match("characteristics\.(.+)\.max")
        if (charMatch) {
            const char = charMatch[1]
            const value = newState ? -parseInt(change.value) : parseInt(change.value)
            await actor.update({
                [`system.characteristics.${char}.value`]: parseInt(actor.system.characteristics[char].value) + value
            })
        }
    }
}
