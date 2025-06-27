class HeroNullClass {}

const FoundryTokenRuler = foundry.canvas.placeables?.tokens.TokenRuler || HeroNullClass;

export class HeroTokenRuler extends FoundryTokenRuler {
    static applyHeroMovementConfig() {
        // Adjusting `Blink (Teleport)` to just be Teleport and maintain its use elsewhere
        const teleport = {
            ...CONFIG.Token.movement.actions.blink,
            label: "TOKEN.MOVEMENT.ACTIONS.teleport.label",
            canSelect: (token) => parseInt(token.actor?.system.characteristics.teleportation?.value) > 0,
        };

        foundry.utils.mergeObject(
            CONFIG.Token.movement.actions,
            {
                "-=blink": null,
                burrow: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.tunneling?.value) > 0,
                },
                "-=crawl": null,

                fly: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.flight?.value) > 0,
                },
                jump: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.leaping?.value) > 0,
                },
                swim: {
                    canSelect: (token) => parseInt(token.actor?.system.characteristics.swimming?.value) > 0,
                },
                teleport,
                // Swinging
            },
            { performDeletions: true },
        );
    }
}
