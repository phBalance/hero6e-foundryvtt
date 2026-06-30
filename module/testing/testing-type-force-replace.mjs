import { HeroCompatibility } from "../utility/compatibility.mjs";

export function registerTypeForceReplaceTests(quench) {
    quench.registerBatch(`${game.system.id}.testing.typeForceReplace`, (context) => {
        const { describe, it, before, after, assert } = context;

        // ==========================================
        // ACTOR TYPE TESTS
        // ==========================================
        describe.only(
            "Actor Type Mutation Matrix",
            function () {
                let quenchActor = null;
                const targetTypes = Actor.TYPES.filter((t) => t !== "base");

                before(async function () {
                    quenchActor = await Actor.create({
                        name: "_Quench_Attacker",
                        type: "pc",
                        img: "icons/svg/sword.svg",
                    });
                });

                after(async function () {
                    if (quenchActor) await quenchActor.delete();
                });

                it("Custom system _changeType", async function () {
                    for (const targetType of targetTypes) {
                        await quenchActor._changeType(targetType);
                        assert.equal(quenchActor.type, targetType);
                    }
                });

                // Shared DataModels break _replace. TODO: refactor DataModel
                if (HeroCompatibility.isV14) {
                    it("Native V14 forceReplace", async function () {
                        for (const targetType of targetTypes) {
                            await quenchActor.update(
                                {
                                    type: targetType,
                                    system: _replace({}),
                                },
                                {
                                    forceReplace: true,
                                },
                            );
                            assert.equal(quenchActor.type, targetType);
                        }
                    });
                } else {
                    it.skip("Native V14 forceReplace (Skipped on V13)", () => {});
                }
            },
            { displayName: "HERO: Actor Type Tests" },
        );

        // ==========================================
        // ITEM TYPE TESTS
        // ==========================================
        describe.only(
            "Item Type Mutation Matrix",
            function () {
                let quenchItem = null;
                // Filter out 'base' and the deprecated 'complication' type
                const itemTypes = Item.TYPES.filter((t) => t !== "base" && t !== "complication");

                before(async function () {
                    const initialType = itemTypes[0] || "equipment";
                    quenchItem = await Item.create({
                        name: "_Quench_Test_Item",
                        type: initialType,
                        img: "icons/svg/item-bag.svg",
                        system: {
                            XMLID: "UNTRAINED",
                        },
                    });
                });

                after(async function () {
                    if (quenchItem) await quenchItem.delete();
                });

                it("Custom generic update pipeline", async function () {
                    for (const targetType of itemTypes) {
                        const currentSystemData = quenchItem.system.toObject();

                        await quenchItem.update(
                            {
                                type: targetType,
                                system: foundry.utils.mergeObject(currentSystemData, { _type: targetType }),
                            },
                            { recursive: false },
                        );

                        assert.equal(quenchItem.type, targetType);
                        assert.equal(quenchItem.system.XMLID, "UNTRAINED");
                    }
                });

                // Shared DataModels break _replace. TODO: refactor DataModel
                if (HeroCompatibility.isV14) {
                    it("Native V14 forceReplace", async function () {
                        for (const targetType of itemTypes) {
                            const currentSystemData = quenchItem.system.toObject();

                            await quenchItem.update(
                                {
                                    type: targetType,
                                    system: _replace(currentSystemData),
                                },
                                {
                                    forceReplace: true,
                                },
                            );

                            assert.equal(quenchItem.type, targetType);
                            assert.equal(quenchItem.system.XMLID, "UNTRAINED");
                        }
                    });
                } else {
                    it.skip("Native V14 forceReplace (Skipped on V13)", () => {});
                }
            },
            { displayName: "HERO: Item Type Tests" },
        );
    });
}
