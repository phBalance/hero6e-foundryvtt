import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import {
    determineStrengthDamage,
    determineExtraDiceDamage,
    simplifyDamageRoll,
    getNumberOfEachDice,
    convertToDC,
    convertFromDC,
    addTerms,
    convertToDcFromItem,
} from "../utility/damage.js";

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.damageFunctions",
        (context) => {
            const { assert, beforeEach, describe, it } = context;

            const actor = new HeroSystem6eActor({
                name: "Test Actor",
                type: "pc",
            });

            describe("Strength Damage Item Doesn't Use Strength", function () {
                const item = new HeroSystem6eItem({
                    name: "Test Item No Strength",
                    type: "attack",
                    system: {
                        usesStrength: false,
                    },
                    parent: actor,
                });

                it("Str 10", function () {
                    assert.equal(determineStrengthDamage(item, 10), null);
                });
            });

            describe("Strength Damage Item Uses Strength (Killing)", function () {
                const item = new HeroSystem6eItem({
                    name: "Test Item Uses Strength",
                    type: "attack",
                    system: {
                        usesStrength: true,
                        killing: true,
                    },
                    parent: actor,
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
                    name: "Test Item Uses Strength",
                    type: "attack",
                    system: {
                        usesStrength: true,
                    },
                    parent: actor,
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
                        name: "Test",
                        type: "attack",
                        system: {
                            extraDice: "zero",
                        },
                        parent: actor,
                    });

                    assert.equal(determineExtraDiceDamage(item), "");
                });

                it("Extra Dice - Pip", function () {
                    const item = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            extraDice: "pip",
                        },
                        parent: actor,
                    });

                    assert.equal(determineExtraDiceDamage(item), "+1");
                });

                it("Extra Dice - Half", function () {
                    const item = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            extraDice: "half",
                        },
                        parent: actor,
                    });

                    assert.equal(determineExtraDiceDamage(item), "+1d3");
                });
            });

            describe("getNumberOfEachDice", function () {
                it("Empty", function () {
                    assert.deepEqual(getNumberOfEachDice(""), [0, 0, 0]);
                });

                it("1d6 + 1d3 + 1", function () {
                    assert.deepEqual(
                        getNumberOfEachDice("1d6 + 1d3 + 1"),
                        [1, 1, 1],
                    );
                });

                it("1d6 + 1d6", function () {
                    assert.deepEqual(
                        getNumberOfEachDice("1d6 + 1d6"),
                        [2, 0, 0],
                    );
                });

                it("+1", function () {
                    assert.deepEqual(getNumberOfEachDice("+1"), [0, 0, 1]);
                });

                it("1d6", function () {
                    assert.deepEqual(getNumberOfEachDice("1d6"), [1, 0, 0]);
                });

                it("1d3", function () {
                    assert.deepEqual(getNumberOfEachDice("1d3"), [0, 1, 0]);
                });

                it("1d6 + 1d3", function () {
                    assert.deepEqual(
                        getNumberOfEachDice("1d6 + 1d3"),
                        [1, 1, 0],
                    );
                });
            });

            describe("simplifyDamageRoll", function () {
                it("Empty", function () {
                    assert.equal(simplifyDamageRoll(""), "");
                });

                it("+1", function () {
                    assert.equal(simplifyDamageRoll("+1"), "1");
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
                    assert.equal(
                        simplifyDamageRoll("1d6 + 1d3 + 2d6 + 2d3"),
                        "4d6 + 1d3",
                    );
                });

                it("1d6 + 1d3 + 1", function () {
                    assert.equal(
                        simplifyDamageRoll("1d6 + 1d3 + 1"),
                        "1d6 + 1d3 + 1",
                    );
                });
            });

            describe("convertToDC", function () {
                const item = new HeroSystem6eItem({
                    name: "Test",
                    type: "attack",
                    system: {
                        killing: true,
                    },
                    parent: actor,
                });

                const item_nk = new HeroSystem6eItem({
                    name: "Test",
                    type: "attack",
                    parent: actor,
                });

                it('""', function () {
                    assert.equal(convertToDC(item, ""), 0);
                });

                it("(Killing) 1", function () {
                    assert.equal(convertToDC(item, "1"), 1);
                });

                it("(Killing) 2", function () {
                    assert.equal(convertToDC(item, "1d3"), 2);
                });

                it("(Killing) 3", function () {
                    assert.equal(convertToDC(item, "1d6"), 3);
                });

                it("(Killing) 4", function () {
                    assert.equal(convertToDC(item, "1d6+1"), 4);
                });

                it("(Killing) 5", function () {
                    assert.equal(convertToDC(item, "1d6 + 1d3"), 5);
                });

                it("(Killing) 6", function () {
                    assert.equal(convertToDC(item, "2d6"), 6);
                });

                it("(Killing) 7", function () {
                    assert.equal(convertToDC(item, "2d6 + 1"), 7);
                });

                it("(Non-Killing) 0", function () {
                    assert.equal(convertToDC(item_nk, "0d6"), 0);
                });

                it("(Non-Killing) 1", function () {
                    assert.equal(convertToDC(item_nk, "1d6"), 1);
                });

                it("(Non-Killing) 20", function () {
                    assert.equal(convertToDC(item_nk, "20d6"), 20);
                });
            });

            describe("convertFromDC", function () {
                describe("invalid inputs", function () {
                    const item = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            killing: true,
                        },
                        parent: actor,
                    });

                    it('""', function () {
                        assert.equal(convertFromDC(item, 0), "");
                    });
                });

                describe("killing attacks", function () {
                    const killingItem = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            killing: true,
                        },
                        parent: actor,
                    });

                    it("1", function () {
                        assert.equal(convertFromDC(killingItem, 1), "1");
                    });

                    it("2", function () {
                        assert.equal(convertFromDC(killingItem, 2), "1d3");
                    });

                    it("3", function () {
                        assert.equal(convertFromDC(killingItem, 3), "1d6");
                    });

                    it("4", function () {
                        assert.equal(convertFromDC(killingItem, 4), "1d6 + 1");
                    });

                    it("5", function () {
                        assert.equal(
                            convertFromDC(killingItem, 5),
                            "1d6 + 1d3",
                        );
                    });

                    it("6", function () {
                        assert.equal(convertFromDC(killingItem, 6), "2d6");
                    });

                    it("7", function () {
                        assert.equal(convertFromDC(killingItem, 7), "2d6 + 1");
                    });
                });

                describe("Non killing attacks", function () {
                    const nonKillingItem = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        parent: actor,
                    });

                    it("0", function () {
                        assert.equal(convertFromDC(nonKillingItem, 0), "");
                    });

                    it("1", function () {
                        assert.equal(convertFromDC(nonKillingItem, 1), "1d6");
                    });

                    it("1.2", function () {
                        assert.equal(
                            convertFromDC(nonKillingItem, 1.2),
                            "1d6 + 1",
                        );
                    });

                    it("1.5", function () {
                        assert.equal(
                            convertFromDC(nonKillingItem, 1.5),
                            "1d6 + 1d3",
                        );
                    });

                    it("13.2", function () {
                        assert.equal(
                            convertFromDC(nonKillingItem, 13.2),
                            "13d6 + 1",
                        );
                    });

                    it("20", function () {
                        assert.equal(convertFromDC(nonKillingItem, 20), "20d6");
                    });

                    it("1234567890.2", function () {
                        assert.equal(
                            convertFromDC(nonKillingItem, 1234567890.2),
                            "1234567890d6 + 1",
                        );
                    });
                });
            });

            describe("Add Terms", function () {
                it("'' ''", function () {
                    assert.equal(addTerms("", ""), "");
                });

                it("null null", function () {
                    assert.equal(addTerms(null, null), "");
                });

                it("1d6 null", function () {
                    assert.equal(addTerms("1d6", null), "1d6");
                });

                it("null 1d6", function () {
                    assert.equal(addTerms(null, "1d6"), "1d6");
                });

                it("1d6 1d6", function () {
                    assert.equal(addTerms("1d6", "1d6"), "1d6 + 1d6");
                });

                it("1d6 ''", function () {
                    assert.equal(addTerms("1d6", ""), "1d6");
                });

                it("'' 1d6", function () {
                    assert.equal(addTerms("", "1d6"), "1d6");
                });

                it("1d6 1d6", function () {
                    assert.equal(addTerms("1d6", "1d6"), "1d6 + 1d6");
                });
            });

            describe("convertToDcFromItem", function () {
                const item = new HeroSystem6eItem({
                    name: "Test",
                    type: "attack",
                    system: {
                        dice: 1,
                        extraDice: "pip",
                        killing: true,
                    },
                    parent: actor,
                });

                const item_nk = new HeroSystem6eItem({
                    name: "Test",
                    type: "attack",
                    system: {
                        dice: 1,
                        extraDice: "pip",
                        killing: false,
                    },
                    parent: actor,
                });

                //return { dc: dc, tags: tags, end: end };

                it("Killing dc", function () {
                    assert.equal(convertToDcFromItem(item).dc, 4);
                });

                it("normal", function () {
                    assert.equal(convertToDcFromItem(item_nk).dc, 1.2);
                });
            });
        },
        { displayName: "HERO: Damage Functions" },
    );
}
