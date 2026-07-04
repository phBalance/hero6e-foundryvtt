// Build a system payload for a forced replacement across a document type change: a full replacement
// object carrying the new type discriminator (`_type`). Used with { recursive: false }.
function _replace(systemData, type) {
    return foundry.utils.mergeObject(systemData, { _type: type });
}

export function registerTypeForceReplaceTests(quench) {
    quench.registerBatch(
        `${game.system.id}.testing.typeForceReplace`,
        (context) => {
            const { describe, it, before, after, assert } = context;

            // ==========================================
            // ACTOR TYPE TESTS
            // ==========================================
            describe(
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
                    // { recursive: false } performs a forced (non-merged) system replacement on both
                    // V13 and V14. (V14's native { forceReplace: true } instead requires the system to
                    // be wrapped in a ForcedReplacement operator.)
                    it("forceReplace type mutation", async function () {
                        const replaceOptions = { recursive: false };
                        for (const targetType of targetTypes) {
                            const currentSystemData = quenchActor.system?.toObject() || {};

                            await quenchActor.update(
                                {
                                    type: targetType,
                                    system: _replace(currentSystemData, targetType),
                                },
                                replaceOptions,
                            );
                            assert.equal(quenchActor.type, targetType);
                        }
                    });
                },
                { displayName: "HERO: Actor Type Tests" },
            );

            // ==========================================
            // ITEM TYPE TESTS
            // ==========================================
            describe("Item Type Mutation Matrix", function () {
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
                // Native V14 uses the forceReplace option; V13 achieves the same forced replacement
                // with { recursive: false }.
                it("forceReplace type mutation", async function () {
                    const replaceOptions = { recursive: false };
                    for (const targetType of itemTypes) {
                        const currentSystemData = quenchItem.system.toObject();

                        await quenchItem.update(
                            {
                                type: targetType,
                                system: _replace(currentSystemData, targetType),
                            },
                            replaceOptions,
                        );

                        assert.equal(quenchItem.type, targetType);
                        assert.equal(quenchItem.system.XMLID, "UNTRAINED");
                    }
                });
            });
        },
        { displayName: "HERO: Updates with type ForceReplace" },
    );
}
