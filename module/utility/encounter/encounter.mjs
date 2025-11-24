export class HeroEncounter {
    static AARON = "aaron";

    constructor() {}

    static get tokensFriendly() {
        return game.scenes.current.tokens.filter((t) => t.actor && t.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY);
    }

    static get tokensPc() {
        return game.scenes.current.tokens.filter((t) => t.actor?.type === "pc");
    }

    static get tokensHostile() {
        return game.scenes.current.tokens.filter((t) => t.actor && t.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE);
    }

    static difficulty(friendlyActor, hostileActor) {
        return {
            chanceForHostileToMiss:
                friendlyActor.system.characteristics.dcv.value / hostileActor.system.characteristics.ocv.value,
            chanceToHitHostile:
                friendlyActor.system.characteristics.ocv.value / hostileActor.system.characteristics.dcv.value,
        };
    }

    static test() {
        const friendlyActor = HeroEncounter.tokensPc[0].actor;
        const hostileActor = HeroEncounter.tokensHostile[0].actor;
        console.log(`${friendlyActor.name} vs ${hostileActor.name}`, friendlyActor);
        console.log(HeroEncounter.difficulty(friendlyActor, hostileActor));
    }
}
