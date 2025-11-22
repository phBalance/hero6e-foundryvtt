export class HeroEncounter {
    static AARON = "aaron";

    constructor() {}

    static get tokensFriendly() {
        return game.scenes.current.tokens.filter((t) => t.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY);
    }

    static get tokensHostile() {
        return game.scenes.current.tokens.filter((t) => t.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE);
    }

    static difficulty(friendlyActor, hostileActor) {
        return {
            pctHit: friendlyActor.system.characteristics.ocv.value / hostileActor.system.characteristics.dcv.value,
        };
    }

    static test() {
        const friendlyActor = HeroEncounter.tokensFriendly[0].actor;
        const hostileActor = HeroEncounter.tokensHostile[0].actor;
        console.log(`${friendlyActor.name} vs ${hostileActor.name}`);
        console.log(HeroEncounter.difficulty(friendlyActor, hostileActor));
    }
}
