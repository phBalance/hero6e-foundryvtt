import { HEROSYS } from "../herosystem6e.js";
import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "quench.examples.damageFunctions",
        (context) => {
            const { describe, it, assert } = context

            describe("Example Suite", function () {
                const damageRoll = "1D6";
                const actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc'
                });
                const itemUsesStrength = new HeroSystem6eItem({
                    name: 'Test Item Uses Strength',
                    type: 'attack',
                    system: {
                        usesStrength: true
                    },
                    parent: actor
                });
                const itemUsesStrengthKilling = new HeroSystem6eItem({
                    name: 'Test Item Uses Strength',
                    type: 'attack',
                    system: {
                        usesStrength: true,
                        killing: true
                    },
                    parent: actor
                });
                const itemNoStrength = new HeroSystem6eItem({
                    name: 'Test Item No Strength',
                    type: 'attack',
                    system: {
                        usesStrength: false
                    },
                    parent: actor
                });

                before(function() {
                    // runs before each test
                });

                it("Test Name", function () {
                    assert.equal(true, true);
                });

                after(function() {
                    // runs after each test
                });

                // We don't need to delete these in our tests? 
                // Is it possible Quench deletes them automatically?

                // itemUsesStrength.delete();
                // itemNoStrength.delete();
                // actor.delete();
            }); 
        },
        { displayName: "HERO: Damage Functions" }
    );
}