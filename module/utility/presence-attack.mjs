import { HEROSYS } from "../herosystem6e.mjs";
import { HeroRoller } from "./dice.mjs";

// v13 compatibility
const foundryVttRenderTemplate = foundry.applications?.handlebars?.renderTemplate || renderTemplate;

async function _renderForm(actor, stateData) {
    const token = actor.token;

    // Certain skills/talents/powers may help this roll
    const preAttackMods = [];

    // Striking appearance may help
    const strikingAppearances = actor.items.filter((item) => item.system.XMLID === "STRIKING_APPEARANCE");
    for (const saTalent of strikingAppearances) {
        saTalent.system.checked = false;
        saTalent.system.active = true;
        preAttackMods.push(saTalent);
    }

    // Positive reputation or negative reputation may help this roll
    const reputations = actor.items.filter((item) => item.system.XMLID === "REPUTATION");
    for (const reputation of reputations) {
        reputation.system.checked = false;
        reputation.system.active = true;
        preAttackMods.push(reputation);
    }

    const templateData = {
        actor: actor.system,
        tokenId: token?.uuid || null,
        state: stateData,
        preAttackMods,
    };

    const path = `systems/${HEROSYS.module}/templates/pop-out/presence-attack-card.hbs`;
    return await foundryVttRenderTemplate(path, templateData);
}

function clampFractionalPortionToZeroOrHalf(value) {
    const fractional = value % 1;
    if (fractional) {
        return Math.trunc(value) + Math.sign(value) * 0.5;
    }

    return value;
}

async function presenceAttackRoll(actor, html) {
    const tags = [];

    const presence = parseInt(actor.system.characteristics.pre.value);
    const presenceAttackBasicDice = clampFractionalPortionToZeroOrHalf(presence / 5);
    if (presenceAttackBasicDice !== 0) {
        tags.push({
            value: presenceAttackBasicDice,
            name: "Presence Attack",
            title: `Presence Attack (${presence} PRE)`,
        });
    }

    const form = html[0].querySelector("form");
    const rollModifier = clampFractionalPortionToZeroOrHalf(parseFloat(form.mod.value));
    if (rollModifier !== 0) {
        tags.push({
            value: rollModifier,
            name: "Roll Modifier",
            title: `User Added Roll Modifier ${rollModifier}`,
        });
    }

    // Presence Attack Modifiers (striking appearance & reputation)
    let preAttackMods = 0;
    const preAttackModInputs = form.querySelectorAll("INPUT:checked");
    for (const preAttackInput of preAttackModInputs) {
        const preAttackModItem = actor.items.get(preAttackInput.id);

        let numDice = 0;
        if (preAttackModItem.system.XMLID === "STRIKING_APPEARANCE") {
            numDice = parseInt(preAttackModItem.system.LEVELS || 0);
        } else if (preAttackModItem.system.XMLID === "REPUTATION") {
            if (preAttackModItem.type === "disadvantage") {
                const recognizedOptionId = (preAttackModItem.system.ADDER || []).find(
                    (adder) => adder.XMLID === "RECOGNIZED",
                )?.OPTIONID;

                if (recognizedOptionId === "SOMETIMES") {
                    numDice = -1;
                } else if (recognizedOptionId === "FREQUENTLY") {
                    numDice = -2;
                } else if (recognizedOptionId === "ALWAYS") {
                    numDice = -3;
                } else {
                    console.error(`Unrecognized REPUTATION (disad) OPTIONID ${recognizedOptionId}`);
                    numDice = 0;
                }
            } else {
                numDice = parseInt(preAttackModItem.system.LEVELS || 0);
            }
        } else {
            console.warn(
                `Unexpected item ${preAttackModItem.system.XMLID}/${preAttackModItem.type} providing modification for presence attack`,
            );
            numDice = parseInt(preAttackModItem.system.LEVELS || 0);
        }

        if (numDice !== 0) {
            tags.push({
                value: numDice,
                name: preAttackModItem.name,
                title: preAttackModItem.system.description,
            });
        }

        preAttackMods += numDice;
    }

    const presenceAttackDice = presenceAttackBasicDice + preAttackMods + rollModifier;
    const presenceAttackFullDice = Math.trunc(presenceAttackDice);
    const presenceAttackPartialDice = Math.sign(presenceAttackDice) * (Math.abs(presenceAttackDice % 1) >= 0.5 ? 1 : 0);

    const preAttackRoller = new HeroRoller()
        .makeBasicRoll()
        .addDice(presenceAttackFullDice, "Presence Attack")
        .addHalfDice(presenceAttackPartialDice, "Presence Attack Half Dice");
    await preAttackRoller.roll();

    const rollHtml = await preAttackRoller.render("Presence Attack");

    // render card
    const token = actor.token;
    const speaker = ChatMessage.getSpeaker({ actor: actor, token });
    speaker.alias = actor.name;

    const cardData = {
        tags: tags.map((tag) => {
            return { ...tag, value: tag.value.signedStringHero() };
        }),
        rolls: preAttackRoller.rawRolls(),
        renderedRoll: rollHtml,
        user: game.user._id,
        speaker: speaker,
    };
    const template = `systems/${HEROSYS.module}/templates/chat/presence-attack-result-card.hbs`;
    const cardHtml = await foundryVttRenderTemplate(template, cardData);

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
    const options = {
        width: "auto",
        classes: ["hero"],
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
