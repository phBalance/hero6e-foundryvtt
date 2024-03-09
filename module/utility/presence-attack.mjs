import { HeroRoller } from "./dice.mjs";

async function _renderForm(actor, stateData) {
    const token = actor.token;

    const templateData = {
        actor: actor.system,
        tokenId: token?.uuid || null,
        state: stateData,
    };

    var path =
        "systems/hero6efoundryvttv2/templates/pop-out/presence-attack-card.hbs";

    return await renderTemplate(path, templateData);
}

async function presenceAttackRoll(actor, html) {
    let form = html[0].querySelector("form");

    const heroRoller = new HeroRoller()
        .makeBasicRoll()
        .addDice(
            parseInt(Math.floor(actor.system.characteristics.pre.value / 5)) +
                parseInt(form.mod.value),
            "Presence Attack",
        );
    await heroRoller.roll();

    const cardHtml = await heroRoller.render("Presence Attack");
    const token = actor.token;
    const speaker = ChatMessage.getSpeaker({ actor: actor, token });
    speaker.alias = actor.name;

    const chatData = {
        type: CONST.CHAT_MESSAGE_TYPES.ROLL,
        rolls: heroRoller.rawRolls(),
        user: game.user._id,
        content: cardHtml,
        speaker: speaker,
    };

    return ChatMessage.create(chatData);
}

async function presenceAttackPopOut(actor) {
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
                    callback: (html) =>
                        resolve(presenceAttackRoll(actor, html)),
                },
            },
            default: "presenceAttack",
            close: () => resolve({}),
        };

        new Dialog(data, options).render(true);
    });
}

export { presenceAttackPopOut };
