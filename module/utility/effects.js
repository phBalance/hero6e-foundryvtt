import { HeroSystem6eItemSheet } from '../item/item-sheet.js'

export async function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("tr") || a.closest("li");
    if (!li) return
    const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    if (!effect) return
    switch (a.dataset.action) {
        case "create":
            return owner.createEmbeddedDocuments("ActiveEffect", [{
                label: "New Effect",
                icon: "icons/svg/aura.svg",
                origin: owner.uuid,
                disabled: true,
                //   "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
                //   disabled: li.dataset.effectType === "inactive"
            }]);
        case "edit":
            return effect.sheet.render(true);
        case "delete":
            return effect.delete();
        case "toggle":
            onActiveEffectToggle(effect)
            return
    }
}

export async function onActiveEffectToggle(effect, newState) {
    if (newState == undefined)
    {
        await effect.update({ disabled: !effect.disabled })
    } else
    {
        await effect.update({ disabled: newState })
    }

    // Re-render all open HeroSystem6eItemSheets.
    // TODO: Limit to just updating the ItemSheets associated with this actor or ActiveEffect
    for (const w of Object.values(ui.windows)) {
        //if (w instanceof HeroSystem6eItemSheet) {
            w.render()
        //}
    }
    return
}