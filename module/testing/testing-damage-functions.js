import { HEROSYS } from "../herosystem6e.js";
import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import {
    determineStrengthDamage, determineExtraDiceDamage,
    simplifyDamageRoll, getNumberOfEachDice, convertToDC,
    convertFromDC, addTerms, handleDamageNegation, convertToDcFromItem
} from "../utility/damage.js"

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "quench.damageFunctions",
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

            describe("getNumberOfEachDice", function () {
                it("Empty", function () {
                    assert.deepEqual(getNumberOfEachDice(""), [0, 0, 0]);
                });

                it("1d6 + 1d3 + 1", function () {
                    assert.deepEqual(getNumberOfEachDice("1d6 + 1d3 + 1"), [1, 1, 1]);
                });

                it("1d6 + 1d6", function () {
                    assert.deepEqual(getNumberOfEachDice("1d6 + 1d6"), [2, 0, 0]);
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
                    assert.deepEqual(getNumberOfEachDice("1d6 + 1d3"), [1, 1, 0]);
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
                    assert.equal(simplifyDamageRoll("1d6 + 1d3 + 2d6 + 2d3"), "4d6 + 1d3");
                });

                it("1d6 + 1d3 + 1", function () {
                    assert.equal(simplifyDamageRoll("1d6 + 1d3 + 1"), "1d6 + 1d3 + 1");
                });
            });

            describe("convertToDC", function () {
                const item = new HeroSystem6eItem({
                    name: 'Test',
                    type: 'attack',
                    system: {
                        killing: true
                    },
                    parent: actor
                });

                const item_nk = new HeroSystem6eItem({
                    name: 'Test',
                    type: 'attack',
                    parent: actor
                });

                it("\"\"", function () {
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
                        name: 'Test',
                        type: 'attack',
                        system: {
                            killing: true
                        },
                        parent: actor
                    });

                    it("\"\"", function () {
                        assert.equal(convertFromDC(item, 0), "");
                    });
                })

                describe("killing attacks", function () {
                    const killingItem = new HeroSystem6eItem({
                        name: 'Test',
                        type: 'attack',
                        system: {
                            killing: true
                        },
                        parent: actor
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
                        assert.equal(convertFromDC(killingItem, 5), "1d6 + 1d3");
                    });

                    it("6", function () {
                        assert.equal(convertFromDC(killingItem, 6), "2d6");
                    });

                    it("7", function () {
                        assert.equal(convertFromDC(killingItem, 7), "2d6 + 1");
                    });
                        
                })

                describe("Non killing attacks", function () {
                    const nonKillingItem = new HeroSystem6eItem({
                        name: 'Test',
                        type: 'attack',
                        parent: actor
                    });

                    it("0", function () {
                        assert.equal(convertFromDC(nonKillingItem, 0), "");
                    });

                    it("1", function () {
                        assert.equal(convertFromDC(nonKillingItem, 1), "1d6");
                    });

                    it("1.2", function () {
                        assert.equal(convertFromDC(nonKillingItem, 1.2), "1d6 + 1");
                    });

                    it("1.5", function () {
                        assert.equal(convertFromDC(nonKillingItem, 1.5), "1d6 + 1d3");
                    });

                    it("20", function () {
                        assert.equal(convertFromDC(nonKillingItem, 20), "20d6");
                    });
                })
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

            describe("handleDamageNegation", function () {
                const fakeItem_nk = {
                    "system": {
                        "killing": false
                    }
                }

                const fakeItem_k = {
                    "system": {
                        "killing": true
                    }
                }

                const plus = {
                    "_evaluated": true,
                    "isIntermediate": false,
                    "operator": "+",
                    "options": {}
                }

                const minus = {
                    "_evaluated": true,
                    "isIntermediate": false,
                    "operator": "+",
                    "options": {}
                }

                const numbericTerm = {
                    "_evaluated": false,
                    "isIntermediate": false,
                    "number": 1,
                    "options": {}
                }

                let die, damageResult, die_small, damageResult_small;

                beforeEach(function () {
                    die = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true },
                            { "result": 4, "active": true },
                            { "result": 5, "active": true }
                        ]
                    }

                    damageResult = {
                        "terms": [
                            die
                        ],
                        "dice": [
                            die
                        ]
                    }

                    die_small = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true }
                        ]
                    }

                    damageResult_small = {
                        "terms": [
                            die_small
                        ],
                        "dice": [
                            die_small
                        ]
                    }
                });

                it("No Damage Negation", async function () {
                    assert.equal(await handleDamageNegation(fakeItem_nk, damageResult, {}), damageResult);
                });

                it("(Non-Killing) Damage Negation is 0", async function () {
                    assert.equal(await handleDamageNegation(fakeItem_nk, damageResult, { "damageNegationValue": 0 }), damageResult);
                });

                it("(Non-Killing) Damage Negation is 1", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true },
                            { "result": 4, "active": true }
                        ]
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_nk, damageResult, { "damageNegationValue": 1 });

                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results);
                });

                it("(Non-Killing) Damage Negation is 2", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true }
                        ]
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_nk, damageResult, { "damageNegationValue": 2 });

                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results);
                });

                it("(Non-Killing) Damage Negation is 5", async function () {
                    const newDie = {
                        "results": []
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_nk, damageResult, { "damageNegationValue": 5 });

                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results);
                });

                it("(Non-Killing) Damage Negation is 6", async function () {
                    const newDie = {
                        "results": []
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_nk, damageResult, { "damageNegationValue": 6 });

                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results);
                });

                it("(Killing) Damage Negation is 1", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true },
                            { "result": 4, "active": true },
                            { "result": 5, "active": true }
                        ]
                    }

                    const expectedDamageResult = {
                        "terms": [
                            newDie,
                            minus,
                            numbericTerm
                        ],
                        "dice": [
                            newDie
                        ],
                        "total": 14
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult, { "damageNegationValue": 1 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                    assert.equal(newDamageResult.terms[1].operator, "-")
                    assert.equal(newDamageResult.terms[2].number, 1)
                });

                it("(Killing) Damage Negation is 2", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true },
                            { "result": 4, "active": true }
                        ]
                    }

                    const expectedDamageResult = {
                        "total": 11
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult, { "damageNegationValue": 2 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                    assert.equal(newDamageResult.terms[1].operator, "+")
                    assert.equal(newDamageResult.terms[2].number, 1)
                });

                it("(Killing) Damage Negation is 3", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true },
                            { "result": 2, "active": true },
                            { "result": 3, "active": true },
                            { "result": 4, "active": true }
                        ]
                    }

                    const expectedDamageResult = {
                        "total": 10
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult, { "damageNegationValue": 3 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                });

                it("(Killing) DC Negated to 0", async function () {
                    const newDie = {
                        "results": []
                    }

                    const expectedDamageResult = {
                        "total": 0
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult_small, { "damageNegationValue": 6 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                });

                it("(Killing) DC Negated to 1", async function () {
                    const newDie = {
                        "results": []
                    }

                    const expectedDamageResult = {
                        "total": 1
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult_small, { "damageNegationValue": 5 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                });

                it("(Killing) DC Negated to 2", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true }
                        ]
                    }

                    const expectedDamageResult = {
                        "total": 0
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult_small, { "damageNegationValue": 4 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                    assert.equal(newDamageResult.terms[1].operator, "-")
                    assert.equal(newDamageResult.terms[2].number, 1)
                });

                it("(Killing) DC Negated to 3", async function () {
                    const newDie = {
                        "results": [
                            { "result": 1, "active": true }
                        ]
                    }

                    const expectedDamageResult = {
                        "total": 1
                    }

                    const newDamageResult = await handleDamageNegation(fakeItem_k, damageResult_small, { "damageNegationValue": 3 });

                    assert.equal(newDamageResult.total, expectedDamageResult.total)
                    assert.deepEqual(newDamageResult.terms[0].results, newDie.results)
                });

                


            });

            describe("convertToDcFromItem", function () {
                const item = new HeroSystem6eItem({
                    name: 'Test',
                    type: 'attack',
                    system: {
                        dice: 1,
                        extraDice: 'pip',
                        killing: true
                    },
                    parent: actor
                });

                const item_nk = new HeroSystem6eItem({
                    name: 'Test',
                    type: 'attack',
                    system: {
                        dice: 1,
                        extraDice: 'pip',
                        killing: false,
                    },
                    parent: actor
                });

                //return { dc: dc, tags: tags, end: end };

                it("Killing dc", function () {
                    assert.equal(convertToDcFromItem(item).dc, 4);
                });

                it("normal", function () {
                    assert.equal(convertToDcFromItem(item_nk).dc, 1.20);
                });
            });

        },
        { displayName: "HERO: Damage Functions" }
    );
}
