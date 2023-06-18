import { HEROSYS } from "../herosystem6e.js";
import { modifyForStrength } from "../utility/damage.js"
import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "quench.examples.damageFunctions",
        (context) => {
            const { describe, it, assert } = context

            // modifyForStrength(damageRoll, effectiveStr, item, actor)
            describe("modifyForStrength Suite", function () {
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

                it("Item does not use strength", function () {
                    assert.equal(modifyForStrength(damageRoll, 10, itemNoStrength, actor), "1D6");
                });

                it("(NKA) Effective Str > Normal Str", function () {
                    assert.equal(modifyForStrength(damageRoll, 20, itemUsesStrength, actor), "1D6 + 4D6");
                });

                it("(KA) Effective Str > Normal Str", function () {
                    assert.equal(modifyForStrength(damageRoll, 20, itemUsesStrengthKilling, actor), "1D6 + 2D6");
                });

                it("(NKA) Effective Str === 0 ", function () {
                    assert.equal(modifyForStrength(damageRoll, 0, itemUsesStrength, actor), "1D6");
                });

                it("(KA) Effective Str === 0 ", function () {
                    assert.equal(modifyForStrength(damageRoll, 0, itemUsesStrengthKilling, actor), "1D6");
                });

                it("(NKA) Effective Str just under pip", function () {
                    assert.equal(modifyForStrength(damageRoll, 9, itemUsesStrength, actor), "1D6 + 1D6");
                });

                it("(NKA) Effective Str just over pip", function () {
                    assert.equal(modifyForStrength(damageRoll, 11, itemUsesStrength, actor), "1D6 + 2D6");
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