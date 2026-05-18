// No reason to extend RegionDocument at this time.
// Currently only used to set Region behaviors as only GM's have permissions.

export class HeroSystem6eRegion {
    static async applyBehaviorTokenAutomaticTargeting(regionUuid) {
        const region = await fromUuid(regionUuid);
        if (!region) {
            console.error(`Region not found: ${regionUuid}`);
            return;
        }

        // Keep any existing behaviors other than Token Automatic Targeting, which we will replace if it already exists.
        let behaviors = region.behaviors.toObject().filter((b) => b.name !== "Token Automatic Targeting");
        behaviors.push({
            name: "Token Automatic Targeting",
            type: "executeScript",
            system: {
                events: ["tokenEnter", "tokenExit"],
                source: `const token = event.data.token;
                    if (!token) {
                    console.error(\`Token Automatic Targeting: No token found, which should not happen.\`, event);
                    return;
                    }
                    if (game.user.id !== region.flags[game.system.id].userId) {
                    console.debug(
                        \`Token Automatic Targeting: setTarget skipped because game.user.id = \${game.user.id} is not the creator (\${region.flags[game.system.id].userId}) of the region.\`,
                        event,
                    );
                    return;
                    }
                    token.object.setTarget(!!region.tokens.find((t) => t.id === token.id), {
                    releaseOthers: false,
                    });
                `,
            },
        });

        // Update the region with the new behaviors array.
        // Careful as Foundry has issues with updating arrays.
        await region.update({
            behaviors: behaviors,
        });
    }
}
