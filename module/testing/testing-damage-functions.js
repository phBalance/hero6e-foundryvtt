import { HEROSYS } from "../herosystem6e.js";
import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import { determineStrengthDamage, determineExtraDiceDamage, simplifyDamageRoll } from "../utility/damage.js"

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "quench.examples.damageFunctions",
        (context) => {
            const { describe, it, assert } = context

            const actor = new HeroSystem6eActor({
                name: 'Test Actor',
                type: 'pc'
            });

            describe("Strength Damage Item Doesn't Use Strength", function () {
                const item = new HeroSystem6eItem({
                    name: 'Test Item No Strength',
                    type: 'attack',
                    system: {
                        usesStrength: false
                    },
                    parent: actor
                });

                it("Str 10", function () {
                    assert.equal(determineStrengthDamage(item, 10), null);
                });
            });

            describe("Strength Damage Item Uses Strength (Killing)", function () {
                const item = new HeroSystem6eItem({
                    name: 'Test Item Uses Strength',
                    type: 'attack',
                    system: {
                        usesStrength: true,
                        killing: true
                    },
                    parent: actor
                });

                it("Str 4", function () {
                    assert.equal(determineStrengthDamage(item, 4), null);
                });

                it("Str 5", function () {
                    assert.equal(determineStrengthDamage(item, 5), "+1");
                });

                it("Str 6", function () {
                    assert.equal(determineStrengthDamage(item, 6), "+1");
                });

                it("Str 9", function () {
                    assert.equal(determineStrengthDamage(item, 9), "+1");
                });

                it("Str 10", function () {
                    assert.equal(determineStrengthDamage(item, 10), "+1d3");
                });

                it("Str 15", function () {
                    assert.equal(determineStrengthDamage(item, 15), "1d6");
                });

                it("Str 20", function () {
                    assert.equal(determineStrengthDamage(item, 20), "1d6+1");
                });

                it("Str 25", function () {
                    assert.equal(determineStrengthDamage(item, 25), "1d6+1d3");
                });

                it("Str 30", function () {
                    assert.equal(determineStrengthDamage(item, 30), "2d6");
                });
            });

            describe("Strength Damage Item Uses Strength (Non-Killing)", function () {
                const item = new HeroSystem6eItem({
                    name: 'Test Item Uses Strength',
                    type: 'attack',
                    system: {
                        usesStrength: true
                    },
                    parent: actor
                });

                it("Str 0", function () {
                    assert.equal(determineStrengthDamage(item, 0), null);
                });

                it("Str 4", function () {
                    assert.equal(determineStrengthDamage(item, 4), null);
                });

                it("Str 5", function () {
                    assert.equal(determineStrengthDamage(item, 5), "1d6");
                });

                it("Str 6", function () {
                    assert.equal(determineStrengthDamage(item, 6), "1d6");
                });

                it("Str 10", function () {
                    assert.equal(determineStrengthDamage(item, 10), "2d6");
                });
            });

            describe("Extra Damage", function () {
                it("Extra Dice- Zero", function () {
                    const item = new HeroSystem6eItem({
                        name: 'Test',
                        type: 'attack',
                        system: {
                            extraDice: 'zero'
                        },
                        parent: actor
                    });

                    assert.equal(determineExtraDiceDamage(item), "");
                });

                it("Extra Dice - Pip", function () {
                    const item = new HeroSystem6eItem({
                        name: 'Test',
                        type: 'attack',
                        system: {
                            extraDice: 'pip'
                        },
                        parent: actor
                    });

                    assert.equal(determineExtraDiceDamage(item), "+1");
                });

                it("Extra Dice - Half", function () {
                    const item = new HeroSystem6eItem({
                        name: 'Test',
                        type: 'attack',
                        system: {
                            extraDice: 'half'
                        },
                        parent: actor
                    });

                    assert.equal(determineExtraDiceDamage(item), "+1d3");
                });
            });

            describe("simplifyDamageRoll", function () {
                it("Empty", function () {
                    assert.equal(simplifyDamageRoll(""), "");
                });

                it("1d3", function () {
                    assert.equal(simplifyDamageRoll("1d3"), "1d3");
                });

                it("2d3", function () {
                    assert.equal(simplifyDamageRoll("2d3"), "1d6");
                });

                it("1d6", function () {
                    assert.equal(simplifyDamageRoll("1d6"), "1d6");
                });

                it("1d6 + 1d3", function () {
                    assert.equal(simplifyDamageRoll("1d6 + 1d3"), "1d6 + 1d3");
                });

                it("1d6 + 2d3", function () {
                    assert.equal(simplifyDamageRoll("1d6 + 2d3"), "2d6");
                });

                it("1d6 + 1d3 + 2d6 + 2d3", function () {
                    assert.equal(simplifyDamageRoll("1d6 + 1d3 + 2d6 + 2d3"), "4d6 + 1d3");
                });
            });
        },
        { displayName: "HERO: Damage Functions" }
    );
}