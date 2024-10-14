import { HEROSYS } from "../herosystem6e.mjs";
import { HeroRoller } from "../utility/dice.mjs";
import { userInteractiveVerifyOptionallyPromptThenSpendResources } from "./item-attack.mjs";

async function _renderSkillForm(item, actor, stateData) {
    const token = actor.token;

    // Skill Levels (in most cases it will apply so check it)
    let skillLevels = Array.from(actor.items.filter((o) => o.system.XMLID === "SKILL_LEVELS"));
    for (let s of skillLevels) {
        s.system.checked = false;
        s.system.active = true;

        // OPTION_ALIAS has name of skill
        if (s.system.OPTION_ALIAS.toUpperCase().indexOf(item.name.toUpperCase()) > -1) {
            s.system.checked = true;
        }

        // OPTION_ALIAS has XMLID of skill
        if (s.system.OPTION_ALIAS.toUpperCase().indexOf(item.system.XMLID) > -1) {
            s.system.checked = true;
        }

        // CHARACTERISTIC match
        if (s.name.toUpperCase().indexOf(item.system.CHARACTERISTIC) > -1) {
            s.system.checked = true;
        }

        // INTERACTION match (really PRE match)
        if (s.name.toUpperCase().indexOf("INTERACTION") > -1 && item.system.CHARACTERISTIC === "PRE") {
            s.system.checked = true;
        }
    }

    // Enhanced Perception + Skill Levels
    const skillMods = [
        ...skillLevels,
        ...(item.system.XMLID === "PERCEPTION"
            ? actor.items.filter((o) => o.system.XMLID === "ENHANCEDPERCEPTION")
            : []),
    ];

    const templateData = {
        actor: actor.system,
        tokenId: token?.uuid || null,
        item: item,
        state: stateData,
        skillLevels,
        skillMods,
    };

    var path = `systems/${HEROSYS.module}/templates/pop-out/item-skill-card.hbs`;

    return await renderTemplate(path, templateData);
}

export async function createSkillPopOutFromItem(item, actor) {
    const content = await _renderSkillForm(item, actor, {});

    // Attack Card as a Pop Out
    let options = {
        width: 500,
    };

    return new Promise((resolve) => {
        const data = {
            title: "Roll Skill",
            content: content,
            buttons: {
                rollSkill: {
                    label: "Roll Skill",
                    callback: (target, event) => resolve(skillRoll(item, actor, target, event)),
                },
            },
            default: "rollSkill",
            close: () => resolve({}),
        };

        new Dialog(data, options).render(true);
    });
}

async function skillRoll(item, actor, target, event) {
    const token = actor.token;
    const speaker = ChatMessage.getSpeaker({ actor: actor, token });
    speaker.alias = actor.name;

    // Make sure there are enough resources and consume them
    const {
        error: resourceError,
        warning: resourceWarning,
        resourcesRequired,
        resourcesUsedDescription,
    } = await userInteractiveVerifyOptionallyPromptThenSpendResources(item, { noResourceUse: event.shiftKey });
    if (resourceError || resourceWarning) {
        const chatData = {
            user: game.user._id,
            content: resourceError || resourceWarning,
            speaker: speaker,
        };

        return ChatMessage.create(chatData);
    }

    const formElement = target[0].querySelector("form");
    const formData = new FormDataExtended(formElement)?.object;
    const skillRoller = new HeroRoller().addDice(3);

    // SkillMods
    for (const [modKey, modValue] of Object.entries(formData)) {
        const modShortKey = modKey.split(".")[0];
        if (modShortKey.length === 16) {
            const modItem = actor.items.find((o) => o.id === modShortKey);
            if (modItem) {
                await modItem.update({ "system.checked": modValue });
            }
        }
    }

    item.updateRoll();

    const tags = foundry.utils.deepClone(item.system.tags);

    // Build success requirement from the base tags
    let successValue = 0;
    for (const tag of tags) {
        successValue = successValue + tag.value;
    }

    // Skill Levels
    const skillLevelInputs = formElement.querySelectorAll("INPUT:checked");
    for (const skillLevelInput of skillLevelInputs) {
        const skillLevel = actor.items.get(skillLevelInput.id);
        const level = parseInt(skillLevel.system.LEVELS || 0);
        if (level > 0 && !tags.find((o) => o.itemId === skillLevel.id)) {
            tags.push({
                value: level,
                name: skillLevel.name,
                title: skillLevel.system.description,
            });
            successValue = successValue + level;
        }
    }

    // Roll Modifier, from form, which can be negative or positive.
    const modValue = parseInt(formElement.mod.value || 0);
    if (modValue !== 0) {
        tags.push({ value: modValue, name: "Roll Mod" });
        successValue = successValue + modValue;
    }

    await skillRoller.makeSuccessRoll(true, successValue).roll();
    const succeeded = skillRoller.getSuccess();
    const autoSuccess = skillRoller.getAutoSuccess();
    const total = skillRoller.getSuccessTotal();
    const margin = successValue - total;

    const flavor = `${item.name.toUpperCase()} (${successValue}-) roll ${succeeded ? "succeeded" : "failed"} by ${
        autoSuccess === undefined ? `${Math.abs(margin)}` : `rolling ${total}`
    }`;
    const rollHtml = await skillRoller.render(flavor);

    // render card
    const cardData = {
        tags: tags.map((tag) => {
            return { ...tag, value: tag.value.signedString() };
        }),
        rolls: skillRoller.rawRolls(),
        renderedRoll: rollHtml,
        resourcesUsedDescription:
            resourcesRequired.charges > 0 || resourcesRequired.end > 0 ? resourcesUsedDescription : undefined,
        user: game.user._id,
        speaker: speaker,
    };
    const template = `systems/${HEROSYS.module}/templates/chat/skill-success-roll-card.hbs`;
    const cardHtml = await renderTemplate(template, cardData);

    const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: skillRoller.rawRolls(),
        user: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    return ChatMessage.create(chatData);
}
