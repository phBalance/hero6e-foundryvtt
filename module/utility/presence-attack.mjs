import { HEROSYS } from "../herosystem6e.mjs";
import { HeroRoller } from "./dice.mjs";

async function _renderForm(actor, stateData) {
    const token = actor.token;

    // Certain skills/talents/powers may help or hinder this roll
    const attackMods = [];
    // Striking appearance may help
    const strikingAppearance = actor.items.filter((item) => item.system.XMLID === "STRIKING_APPEARANCE");
    for (const saTalent of strikingAppearance) {
        saTalent.system.checked = false;
        saTalent.system.active = true;
        attackMods.push(saTalent);
    }

    const templateData = {
        actor: actor.system,
        tokenId: token?.uuid || null,
        state: stateData,
        preAttackMods: attackMods,
    };

    const path = `systems/${HEROSYS.module}/templates/pop-out/presence-attack-card.hbs`;
    return await renderTemplate(path, templateData);
}

async function presenceAttackRoll(actor, html) {
    const form = html[0].querySelector("form");
    const rollModifier = parseFloat(form.mod.value);
    const presence = parseInt(actor.system.characteristics.pre.value);
    const presenceDice = presence / 5;
    const partialDice = presenceDice % 1;

    const preAttackRoller = new HeroRoller()
        .makeBasicRoll()
        .addDice(Math.trunc(presenceDice), "Presence Attack")
        .addHalfDice(Math.sign(partialDice) * (Math.abs(partialDice) >= 0.5 ? 1 : 0), "Presence Attack Half Dice")
        .addDice(Math.trunc(rollModifier), "Roll Modifier")
        .addHalfDice(Math.abs(rollModifier) % 1 >= 0.5 ? 1 : 0, "Roll Modifier");

    // Presence Attack Modifiers
    const preAttackModInputs = form.querySelectorAll("INPUT:checked");
    for (const preAttackInput of preAttackModInputs) {
        const preAttack = actor.items.get(preAttackInput.id);
        const levels = parseInt(preAttack.system.LEVELS || 0);
        if (levels > 0) {
            preAttackRoller.addDice(levels, preAttack.name);
        }
    }

    await preAttackRoller.roll();

    const rollHtml = await preAttackRoller.render("Presence Attack");
    const tags = await preAttackRoller.tags();

    // render card
    const token = actor.token;
    const speaker = ChatMessage.getSpeaker({ actor: actor, token });
    speaker.alias = actor.name;

    const cardData = {
        tags: tags.map((tag) => {
            return { ...tag, value: tag.value.signedString() };
        }),
        rolls: preAttackRoller.rawRolls(),
        renderedRoll: rollHtml,
        user: game.user._id,
        speaker: speaker,
    };
    const template = `systems/${HEROSYS.module}/templates/chat/presence-attack-result-card.hbs`;
    const cardHtml = await renderTemplate(template, cardData);

    const chatData = {
        style: CONST.CHAT_MESSAGE_STYLES.OOC,
        rolls: preAttackRoller.rawRolls(),
        author: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    return ChatMessage.create(chatData);
}

export async function presenceAttackPopOut(actor) {
    const content = await _renderForm(actor, {});

    // Attack Card as a Pop Out
    let options = {
        width: 300,
    };

    return new Promise((resolve) => {
        const data = {
            title: "Presence Attack",
            content: content,
            buttons: {
                presenceAttack: {
                    label: "Make Presence Attack",
                    callback: (html) => resolve(presenceAttackRoll(actor, html)),
                },
            },
            default: "presenceAttack",
            close: () => resolve({}),
        };

        new Dialog(data, options).render(true);
    });
}
