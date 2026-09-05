import { HeroSystem6eItem } from "../item/item.mjs";

const { Actor, Item } = foundry.documents;

export function registerItemEditionTests(quench) {
    quench.registerBatch(
        `${game.system.id}.testing.itemEdition`,
        (context) => {
            const { describe, it, before, after, assert } = context;

            describe("Item Edition Preservation and Type Conversion Validation", function () {
                let quenchActor6e = null;
                let quenchAutomaton6e = null;
                const worldItems = [];

                before(async function () {
                    quenchActor6e = await Actor.create({
                        name: "_Quench_Edition_Tester",
                        type: "pc",
                        img: "icons/svg/mystery-man.svg",
                        system: {
                            is5e: false,
                        },
                    });
                    quenchAutomaton6e = await Actor.create({
                        name: "_Quench_Edition_Automaton",
                        type: "automaton",
                        img: "icons/svg/mystery-man.svg",
                        system: {
                            is5e: false,
                        },
                    });
                });

                after(async function () {
                    for (const item of worldItems) {
                        await item.delete();
                    }
                    if (quenchActor6e) await quenchActor6e.delete();
                    if (quenchAutomaton6e) await quenchAutomaton6e.delete();
                });

                it("World item creation preserves the item's 5e edition (#4478)", async function () {
                    // Simulates dragging a 5e-only power (ARMOR) from an actor to the Item
                    // sidebar; the world default edition must not restamp it as 6e.
                    const item = await Item.create({
                        name: "_Quench_Dampen_The_Blow",
                        type: "power",
                        system: {
                            XMLID: "ARMOR",
                            xmlTag: "POWER",
                            is5e: true,
                        },
                    });
                    worldItems.push(item);

                    assert.strictEqual(item.system.is5e, true, "World item retains is5e=true.");
                    assert.ok(item.baseInfo, "ARMOR resolves baseInfo in the 5e power dictionary.");
                });

                it("Wrong-edition item fails type conversion validation without throwing", async function () {
                    // A 5e-only XMLID stamped as 6e has no baseInfo; validation must report
                    // a clean error rather than crash in the is* type getters.
                    const brokenItem = new HeroSystem6eItem({
                        name: "_Quench_Broken_Armor",
                        type: "power",
                        system: {
                            XMLID: "ARMOR",
                            xmlTag: "POWER",
                            is5e: false,
                        },
                    });
                    assert.ok(!brokenItem.baseInfo, "ARMOR has no baseInfo under 6e.");

                    const failures = brokenItem.validationTypeConversionFailures("equipment", quenchActor6e);
                    assert.ok(
                        failures.some((f) => f.severity === CONFIG.HERO.VALIDATION_SEVERITY.ERROR),
                        "Validation reports an ERROR failure.",
                    );
                    assert.strictEqual(
                        brokenItem.isValidTypeConversion("equipment", quenchActor6e),
                        false,
                        "Conversion is rejected.",
                    );
                });

                it("Non-ERROR validation severities do not block type conversion", async function () {
                    // Perks on an automaton produce an INFO severity failure; the ERROR count
                    // must still be zero so the conversion is allowed.
                    const perkItem = new HeroSystem6eItem({
                        name: "_Quench_Contact",
                        type: "perk",
                        system: {
                            XMLID: "CONTACT",
                            xmlTag: "PERK",
                            is5e: false,
                        },
                    });

                    const failures = perkItem.validationTypeConversionFailures("perk", quenchAutomaton6e);
                    assert.ok(
                        failures.some((f) => f.severity === CONFIG.HERO.VALIDATION_SEVERITY.INFO),
                        "Automaton perk reports an INFO severity failure.",
                    );
                    assert.ok(
                        !failures.some((f) => f.severity === CONFIG.HERO.VALIDATION_SEVERITY.ERROR),
                        "No ERROR severity failures.",
                    );
                    assert.strictEqual(
                        perkItem.isValidTypeConversion("perk", quenchAutomaton6e),
                        true,
                        "INFO severity failures do not block conversion.",
                    );
                });
            });
        },
        { displayName: "HERO: Item Edition and Type Conversion" },
    );
}
