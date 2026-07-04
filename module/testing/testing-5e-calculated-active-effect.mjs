import { HeroSystem6eItem } from "../item/item.mjs";
import { roundFavorPlayerAwayFromZero } from "../utility/round.mjs";

/**
 * Registers 5e Calculated Active Effect Automation Tests with Quench.
 * Validates baseline ratios and dynamic buffs while enforcing 5e non-cascading rules.
 * @param {object} quench - The Quench test runner instance injected by the system loader.
 */
export function register5eCalculatedActiveEffectAutomationTests(quench) {
    quench.registerBatch(
        `${game.system.id}.testing.5eCalculatedActiveEffects`,
        (context) => {
            const { after, describe, it, assert } = context;
            const waitForHook = (hookName) =>
                new Promise((resolve) => Hooks.once(hookName, (...args) => resolve(args)));

            const actorTypes = Actor.TYPES.filter((t) => t !== "base");
            const createdActorIds = [];
            const create5eActor = async (name) => {
                const createHook = waitForHook("createActor");
                const initialActor = await Actor.create({
                    name,
                    type: "pc",
                    system: { is5e: true },
                });
                await createHook;
                createdActorIds.push(initialActor.id);

                const actor = game.actors.get(initialActor.id);
                assert.ok(!!actor, `[${name}] Failed to fetch instantiated actor record.`);
                return actor;
            };

            const createAdjustmentEffect = async (actor, { adjustmentActivePoints = 0, flags = {}, ...effectData }) => {
                const [effect] = await actor.createEmbeddedDocuments("ActiveEffect", [
                    {
                        ...effectData,
                        flags: {
                            ...flags,
                            [game.system.id]: {
                                ...(flags[game.system.id] ?? {}),
                                type: "adjustment",
                                adjustmentActivePoints,
                            },
                        },
                    },
                ]);
                return effect;
            };
            const addAdjustmentEffect = async (actor, effectData) => {
                await createAdjustmentEffect(actor, effectData);
                return actor.system.characteristics;
            };

            const expectedOcvFromDex = (dex) => roundFavorPlayerAwayFromZero(Math.max(0, dex) / 3);
            const expectedSpdFromDex = (actor, dex) =>
                Math.floor(
                    1 +
                        Number((dex / 10).toFixed(1)) +
                        Number(
                            actor
                                .getCharacteristic("dex")
                                .baseSumFiguredCharacteristicsNoRoundingFromItems(10)
                                .toFixed(1),
                        ) +
                        (actor.system.SPD?.LEVELS ?? 0),
                );
            const expectedPdFromStr = (actor, str) =>
                roundFavorPlayerAwayFromZero(str / 5) +
                actor.getCharacteristic("str").baseSumFiguredCharacteristicsFromItems(5) +
                (actor.system.PD?.LEVELS ?? 0);
            const expectedRecFromStrCon = (actor, str, con) =>
                roundFavorPlayerAwayFromZero(str / 5) +
                actor.getCharacteristic("str").baseSumFiguredCharacteristicsFromItems(5) +
                roundFavorPlayerAwayFromZero(con / 5) +
                actor.getCharacteristic("con").baseSumFiguredCharacteristicsFromItems(5) +
                (actor.system.REC?.LEVELS ?? 0);
            const expectedStunFromStrCon = (actor, str, con) =>
                actor.getCharacteristic("body").basePlusLevels +
                roundFavorPlayerAwayFromZero(str / 2) +
                actor.getCharacteristic("str").baseSumFiguredCharacteristicsFromItems(2) +
                roundFavorPlayerAwayFromZero(con / 2) +
                actor.getCharacteristic("con").baseSumFiguredCharacteristicsFromItems(2) +
                (actor.system.STUN?.LEVELS ?? 0);

            describe("Hero System 5e Calculated and Figured Characteristics State Machine", function () {
                // Multi-client database sweep block to guarantee multi-client parity
                after(async function () {
                    for (const actorId of createdActorIds) {
                        const actor = game.actors.get(actorId);
                        if (actor) {
                            const deleteHook = waitForHook("deleteActor");
                            await actor.delete();
                            await deleteHook;
                        }
                    }
                });

                for (const targetType of actorTypes) {
                    describe(`Actor Type Matrix: [${targetType}]`, function () {
                        it(`Validates Baseline and Buffs for ${targetType}`, async function () {
                            // 1. Structural Validation via Exhaustive Switch Catch-All
                            switch (targetType) {
                                case "pc":
                                case "npc":
                                case "vehicle":
                                case "automaton":
                                    break;
                                case "base2":
                                case "computer":
                                case "ai":
                                    break;
                                default:
                                    assert.fail(`Undocumented actor type detected: ${targetType}`);
                            }

                            // 2. Database Record Instantiation
                            const createHook = waitForHook("createActor");
                            const initialActor = await Actor.create({
                                name: `_Quench_5e_${targetType}_Tester`,
                                type: targetType,
                                system: { is5e: true },
                            });
                            await createHook;
                            createdActorIds.push(initialActor.id);

                            const qActor = game.actors.get(initialActor.id);
                            assert.ok(!!qActor, `[${targetType}] Failed to fetch instantiated actor record.`);

                            // 3. Absence vs Boundary Node Inspection (Safety check for intangibles)
                            if (!qActor.hasCharacteristic("ocv")) {
                                assert.isFalse(
                                    targetType === "pc" || targetType === "npc",
                                    `[${targetType}] Missing OCV characteristic node.`,
                                );
                                return;
                            }

                            const isIntangibleType = ["computer", "ai"].includes(targetType);

                            // Step 1: Verify Initial 5e Baseline Starting Values
                            for (const key of ["ocv", "spd", "rec", "stun"]) {
                                if (qActor.hasCharacteristic(key)) {
                                    const liveNode = qActor.system.characteristics[key];
                                    const isPurePhysicalTrait = ["rec", "stun"].includes(key);

                                    if (isIntangibleType && isPurePhysicalTrait) {
                                        assert.equal(
                                            liveNode.max,
                                            0,
                                            `[${targetType}] Intangible should override physical ${key.toUpperCase()} max to 0.`,
                                        );
                                    } else {
                                        const finalMax =
                                            liveNode.max === 0 && liveNode.base > 0 ? liveNode.base : liveNode.max;
                                        assert.equal(
                                            finalMax,
                                            liveNode.base,
                                            `[${targetType}] Baseline ${key.toUpperCase()} should match schema configuration.`,
                                        );
                                    }
                                }
                            }

                            if (isIntangibleType) return;

                            // Step 2: Add Positive ActiveEffect and Validate Upward Recalculations
                            await qActor.createEmbeddedDocuments("ActiveEffect", [
                                {
                                    name: "Buff Primaries",
                                    changes: [
                                        {
                                            key: "system.characteristics.str.max",
                                            value: "10",
                                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                        },
                                        {
                                            key: "system.characteristics.dex.max",
                                            value: "10",
                                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                        },
                                    ],
                                },
                            ]);

                            // Force derived recompute now that the effect is embedded; no render occurs in tests
                            qActor.prepareData();
                            const buffedChars = qActor.system.characteristics;

                            assert.isAbove(
                                buffedChars.dex.max,
                                buffedChars.dex.base,
                                `[${targetType}] Active effect failed to modify DEX max proxy.`,
                            );

                            const effectiveSourceValue = (key) =>
                                Math.max(Number(buffedChars[key]?.value ?? 0), Number(buffedChars[key]?.max ?? 0));
                            const dexSourceValue = effectiveSourceValue("dex");
                            const strSourceValue = effectiveSourceValue("str");

                            const expectedOcv = roundFavorPlayerAwayFromZero(Math.max(0, dexSourceValue) / 3);
                            const expectedPd =
                                roundFavorPlayerAwayFromZero(strSourceValue / 5) +
                                qActor.getCharacteristic("str").baseSumFiguredCharacteristicsFromItems(5) +
                                (qActor.system.PD?.LEVELS ?? 0);

                            assert.equal(
                                buffedChars.ocv.max,
                                expectedOcv,
                                `[${targetType}] Calculated OCV calculation ratio mismatch.`,
                            );
                            assert.equal(
                                buffedChars.pd.max,
                                expectedPd,
                                `[${targetType}] Figured PD calculation ratio mismatch.`,
                            );
                            if (qActor.hasCharacteristic("spd")) {
                                const expectedSpd = Math.floor(
                                    1 +
                                        Number((dexSourceValue / 10).toFixed(1)) +
                                        Number(
                                            qActor
                                                .getCharacteristic("dex")
                                                .baseSumFiguredCharacteristicsNoRoundingFromItems(10)
                                                .toFixed(1),
                                        ) +
                                        (qActor.system.SPD?.LEVELS ?? 0),
                                );
                                assert.equal(
                                    buffedChars.spd.max,
                                    expectedSpd,
                                    `[${targetType}] Figured SPD calculation ratio mismatch.`,
                                );
                            }
                            if (qActor.hasCharacteristic("rec")) {
                                const conSourceValue = effectiveSourceValue("con");
                                const expectedRec =
                                    roundFavorPlayerAwayFromZero(strSourceValue / 5) +
                                    qActor.getCharacteristic("str").baseSumFiguredCharacteristicsFromItems(5) +
                                    roundFavorPlayerAwayFromZero(conSourceValue / 5) +
                                    qActor.getCharacteristic("con").baseSumFiguredCharacteristicsFromItems(5) +
                                    (qActor.system.REC?.LEVELS ?? 0);
                                assert.equal(
                                    buffedChars.rec.max,
                                    expectedRec,
                                    `[${targetType}] Figured REC calculation ratio mismatch.`,
                                );
                            }

                            const buffEffect = qActor.effects.find((e) => e.name === "Buff Primaries");
                            if (buffEffect) {
                                await buffEffect.delete();
                            }

                            // Step 3: Add Negative ActiveEffect and Validate Raw Tracking Sink (Allowing Negative States)
                            await qActor.createEmbeddedDocuments("ActiveEffect", [
                                {
                                    name: "Massive Characteristic Drain",
                                    changes: [
                                        {
                                            key: "system.characteristics.str.max",
                                            value: "-40",
                                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                        },
                                        {
                                            key: "system.characteristics.dex.max",
                                            value: "-30",
                                            mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                        },
                                    ],
                                },
                            ]);

                            qActor.prepareData();
                            const drainedChars = qActor.system.characteristics;

                            // 1. Primary Characteristics Verification
                            // Primary stats (like DEX) MUST drop below zero cleanly to map adjustment decay fading values.
                            assert.isBelow(
                                drainedChars.dex.max,
                                0,
                                `[${targetType}] Primary metric DEX should drop below zero cleanly to map adjustment decay.`,
                            );

                            // 2. Figured Characteristics Verification (5e Non-Cascading Rules Enforcement)
                            // Since OCV is a calculated characteristic, a Drain on DEX does NOT cascade to reduce it.
                            // It should stay perfectly insulated at its uncommitted rulebook base configuration total.
                            const unreducedOcvBase = qActor.getCharacteristic("ocv")?.base ?? 3;
                            assert.equal(
                                drainedChars.ocv.max,
                                unreducedOcvBase,
                                `[${targetType}] Calculated OCV should stay insulated from primary DRAIN per non-cascading rules.`,
                            );
                        });
                    });
                }

                describe("Focused 5e ActiveEffect dependency boundaries", function () {
                    it("AID DEX from an external origin updates calculated and figured DEX dependents", async function () {
                        const sourceActor = await create5eActor("_Quench_5e_AID_DEX_Source");
                        const targetActor = await create5eActor("_Quench_5e_AID_DEX_Target");

                        const chars = await addAdjustmentEffect(targetActor, {
                            name: "AID DEX",
                            origin: sourceActor.uuid,
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "10",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        const dexSource = 20;
                        assert.equal(chars.dex.max, dexSource, "AID DEX should raise the primary max.");
                        assert.equal(chars.ocv.max, expectedOcvFromDex(dexSource), "AID DEX should raise OCV.");
                        assert.equal(chars.dcv.max, expectedOcvFromDex(dexSource), "AID DEX should raise DCV.");
                        assert.equal(
                            chars.spd.max,
                            expectedSpdFromDex(targetActor, dexSource),
                            "AID DEX should raise SPD.",
                        );
                    });

                    it("combined primary and dependent ActiveEffects both apply in one pass", async function () {
                        const actor = await create5eActor("_Quench_5e_Combined_Primary_Dependent_Target");

                        const chars = await addAdjustmentEffect(actor, {
                            name: "Combined DEX and DCV adjustment",
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "10",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.dcv.max",
                                    value: "-8",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        const dexSource = 20;
                        assert.equal(chars.dex.max, dexSource, "Combined effect should raise DEX.");
                        assert.equal(chars.ocv.max, expectedOcvFromDex(dexSource), "Combined effect should raise OCV.");
                        assert.equal(
                            chars.spd.max,
                            expectedSpdFromDex(actor, dexSource),
                            "Combined effect should raise SPD from DEX.",
                        );
                        assert.equal(
                            chars.dcv.max,
                            expectedOcvFromDex(dexSource) - 8,
                            "Combined effect should apply direct DCV after DEX-derived DCV.",
                        );
                    });

                    it("AID STR updates STR figured dependents", async function () {
                        const actor = await create5eActor("_Quench_5e_AID_STR_Target");

                        const chars = await addAdjustmentEffect(actor, {
                            name: "AID STR",
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.str.max",
                                    value: "20",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        const strSource = 30;
                        const conSource = actor.getCharacteristic("con").basePlusLevels;
                        assert.equal(chars.str.max, strSource, "AID STR should raise the primary max.");
                        assert.equal(chars.pd.max, expectedPdFromStr(actor, strSource), "AID STR should raise PD.");
                        assert.equal(
                            chars.rec.max,
                            expectedRecFromStrCon(actor, strSource, conSource),
                            "AID STR should raise REC.",
                        );
                        assert.equal(
                            chars.stun.max,
                            expectedStunFromStrCon(actor, strSource, conSource),
                            "AID STR should raise STUN.",
                        );
                    });

                    it("actor-owned adjustment updates and deletes recompute derived values", async function () {
                        const actor = await create5eActor("_Quench_5e_Adjustment_Update_Target");

                        const effect = await createAdjustmentEffect(actor, {
                            name: "Scaling AID DEX",
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "10",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.equal(actor.system.characteristics.dex.max, 20, "Initial AID should raise DEX.");
                        assert.equal(
                            actor.system.characteristics.ocv.max,
                            expectedOcvFromDex(20),
                            "Initial AID should raise OCV.",
                        );
                        assert.equal(
                            actor.system.characteristics.spd.max,
                            expectedSpdFromDex(actor, 20),
                            "Initial AID should raise SPD.",
                        );

                        await effect.update({
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "5",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                            flags: {
                                [game.system.id]: {
                                    ...effect.flags[game.system.id],
                                    adjustmentActivePoints: 15,
                                },
                            },
                        });

                        assert.equal(actor.system.characteristics.dex.max, 15, "Updated AID should reduce DEX bonus.");
                        assert.equal(
                            actor.system.characteristics.ocv.max,
                            expectedOcvFromDex(15),
                            "Updated AID should recompute OCV.",
                        );
                        assert.equal(
                            actor.system.characteristics.spd.max,
                            expectedSpdFromDex(actor, 15),
                            "Updated AID should recompute SPD.",
                        );

                        await effect.delete();

                        assert.equal(actor.system.characteristics.dex.max, 10, "Deleted AID should restore DEX max.");
                        assert.equal(
                            actor.system.characteristics.ocv.max,
                            expectedOcvFromDex(10),
                            "Deleted AID should restore OCV.",
                        );
                        assert.equal(
                            actor.system.characteristics.spd.max,
                            expectedSpdFromDex(actor, 10),
                            "Deleted AID should restore SPD.",
                        );
                    });

                    it("DRAIN DEX and STR tracks primary loss without cascading dependents downward", async function () {
                        const actor = await create5eActor("_Quench_5e_DRAIN_Primaries_Target");
                        const baseline = {
                            ocv: actor.system.characteristics.ocv.max,
                            dcv: actor.system.characteristics.dcv.max,
                            spd: actor.system.characteristics.spd.max,
                            pd: actor.system.characteristics.pd.max,
                        };

                        const chars = await addAdjustmentEffect(actor, {
                            name: "DRAIN STR DEX",
                            adjustmentActivePoints: -60,
                            changes: [
                                {
                                    key: "system.characteristics.str.max",
                                    value: "-40",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "-30",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.isBelow(chars.dex.max, 0, "DRAIN DEX should track primary max below zero.");
                        assert.isBelow(chars.str.max, 0, "DRAIN STR should track primary max below zero.");
                        assert.equal(chars.ocv.max, baseline.ocv, "DRAIN DEX should not reduce OCV.");
                        assert.equal(chars.dcv.max, baseline.dcv, "DRAIN DEX should not reduce DCV.");
                        assert.equal(chars.spd.max, baseline.spd, "DRAIN DEX should not reduce SPD.");
                        assert.equal(chars.pd.max, baseline.pd, "DRAIN STR should not reduce PD.");
                    });

                    it("TRANSFER-style opposing actor effects aid one actor without cascading the drained actor", async function () {
                        const drainedActor = await create5eActor("_Quench_5e_TRANSFER_Drained");
                        const aidedActor = await create5eActor("_Quench_5e_TRANSFER_Aided");
                        const drainedBaseline = {
                            ocv: drainedActor.system.characteristics.ocv.max,
                            pd: drainedActor.system.characteristics.pd.max,
                        };

                        const drainedChars = await addAdjustmentEffect(drainedActor, {
                            name: "TRANSFER drain side",
                            origin: aidedActor.uuid,
                            adjustmentActivePoints: -40,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "-30",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.str.max",
                                    value: "-40",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });
                        const aidedChars = await addAdjustmentEffect(aidedActor, {
                            name: "TRANSFER aid side",
                            origin: drainedActor.uuid,
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "10",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.str.max",
                                    value: "20",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.equal(
                            drainedChars.ocv.max,
                            drainedBaseline.ocv,
                            "TRANSFER drain side should not reduce OCV.",
                        );
                        assert.equal(
                            drainedChars.pd.max,
                            drainedBaseline.pd,
                            "TRANSFER drain side should not reduce PD.",
                        );
                        assert.equal(aidedChars.ocv.max, expectedOcvFromDex(20), "TRANSFER aid side should raise OCV.");
                        assert.equal(
                            aidedChars.spd.max,
                            expectedSpdFromDex(aidedActor, 20),
                            "TRANSFER aid side should raise SPD.",
                        );
                        assert.equal(
                            aidedChars.pd.max,
                            expectedPdFromStr(aidedActor, 30),
                            "TRANSFER aid side should raise PD.",
                        );
                    });

                    it("item-origin actor effects still drive 5e dependents", async function () {
                        const sourceActor = await create5eActor("_Quench_5e_Item_Origin_Source");
                        const targetActor = await create5eActor("_Quench_5e_Item_Origin_Target");
                        const dexContents = `
                            <DEX XMLID="DEX" ID="1766170024718" BASECOST="0.0" LEVELS="10" ALIAS="DEX" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Source DEX Aid" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes" ADD_MODIFIERS_TO_BASE="No">
                            <NOTES />
                            </DEX>
                        `;
                        const sourceItem = await HeroSystem6eItem.create(
                            HeroSystem6eItem.itemDataFromXml(dexContents, sourceActor),
                            {
                                parent: sourceActor,
                            },
                        );

                        const chars = await addAdjustmentEffect(targetActor, {
                            name: "Item-origin AID DEX",
                            origin: sourceItem.uuid,
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.dex.max",
                                    value: "10",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.equal(chars.dex.max, 20, "Item-origin actor effect should raise DEX.");
                        assert.equal(
                            chars.ocv.max,
                            expectedOcvFromDex(20),
                            "Item-origin actor effect should raise OCV.",
                        );
                        assert.equal(
                            chars.spd.max,
                            expectedSpdFromDex(targetActor, 20),
                            "Item-origin actor effect should raise SPD.",
                        );
                    });

                    it("item-transferred ActiveEffects on a primary drive 5e dependents", async function () {
                        const actor = await create5eActor("_Quench_5e_Item_Transferred_AE_Target");
                        const tkContents = `
                            <POWER XMLID="TELEKINESIS" ID="1767554249145" BASECOST="0.0" LEVELS="10" ALIAS="Telekinesis" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </POWER>
                        `;
                        const hostItem = await HeroSystem6eItem.create(
                            HeroSystem6eItem.itemDataFromXml(tkContents, actor),
                            {
                                parent: actor,
                            },
                        );

                        // legacyTransferral is false, so this effect stays on the item and reaches the
                        // actor through allApplicableEffects(); it must cascade like an actor-owned one.
                        await hostItem.createEmbeddedDocuments("ActiveEffect", [
                            {
                                name: "Transferred DEX boost",
                                transfer: true,
                                changes: [
                                    {
                                        key: "system.characteristics.dex.max",
                                        value: "10",
                                        mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                    },
                                ],
                            },
                        ]);
                        actor.prepareData();

                        const chars = actor.system.characteristics;
                        const dexSource = 20;
                        assert.equal(chars.dex.max, dexSource, "Item-transferred AE should raise DEX.");
                        assert.equal(
                            chars.ocv.max,
                            expectedOcvFromDex(dexSource),
                            "Item-transferred AE should raise OCV.",
                        );
                        assert.equal(
                            chars.spd.max,
                            expectedSpdFromDex(actor, dexSource),
                            "Item-transferred AE should raise SPD.",
                        );
                    });

                    it("disabled primary ActiveEffects do not drive dependent formulas", async function () {
                        const actor = await create5eActor("_Quench_5e_Disabled_Primary_AE_Target");
                        const baseline = {
                            str: actor.system.characteristics.str.max,
                            pd: actor.system.characteristics.pd.max,
                            rec: actor.system.characteristics.rec.max,
                            stun: actor.system.characteristics.stun.max,
                        };

                        const chars = await addAdjustmentEffect(actor, {
                            name: "Disabled AID STR",
                            disabled: true,
                            adjustmentActivePoints: 30,
                            changes: [
                                {
                                    key: "system.characteristics.str.max",
                                    value: "20",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.equal(chars.str.max, baseline.str, "Disabled STR effect should not raise STR.");
                        assert.equal(chars.pd.max, baseline.pd, "Disabled STR effect should not raise PD.");
                        assert.equal(chars.rec.max, baseline.rec, "Disabled STR effect should not raise REC.");
                        assert.equal(chars.stun.max, baseline.stun, "Disabled STR effect should not raise STUN.");
                    });

                    it("active characteristic items do not enter the actor-owned AE formula source path", async function () {
                        const actor = await create5eActor("_Quench_5e_Item_DEX_Target");
                        const dexContents = `
                            <DEX XMLID="DEX" ID="1766170024717" BASECOST="0.0" LEVELS="10" ALIAS="DEX" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes" ADD_MODIFIERS_TO_BASE="No">
                            <NOTES />
                            </DEX>
                        `;

                        const dexItem = await HeroSystem6eItem.create(
                            HeroSystem6eItem.itemDataFromXml(dexContents, actor),
                            {
                                parent: actor,
                            },
                        );
                        await dexItem.turnOn();
                        await actor.fullHealth();
                        actor.prepareData();

                        assert.equal(actor.system.characteristics.dex.value, 20, "Active DEX item should raise DEX.");
                        assert.equal(
                            actor.system.characteristics.ocv.base,
                            7,
                            "Active DEX item should raise OCV through the item path.",
                        );
                        assert.equal(
                            actor.system.characteristics.spd.value,
                            3,
                            "Active DEX item should not double-propagate into SPD.",
                        );
                    });

                    it("direct dependent max ActiveEffects survive formula recomputation", async function () {
                        const actor = await create5eActor("_Quench_5e_Dependent_AE_Target");

                        const chars = await addAdjustmentEffect(actor, {
                            name: "Direct dependent adjustments",
                            adjustmentActivePoints: 15,
                            changes: [
                                {
                                    key: "system.characteristics.pd.max",
                                    value: "5",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.ed.max",
                                    value: "5",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                                {
                                    key: "system.characteristics.dcv.max",
                                    value: "-8",
                                    mode: CONST.ACTIVE_EFFECT_MODES.ADD,
                                },
                            ],
                        });

                        assert.equal(chars.pd.max, 7, "Direct PD max AE should survive formula recomputation.");
                        assert.equal(chars.ed.max, 7, "Direct ED max AE should survive formula recomputation.");
                        assert.equal(chars.dcv.max, -5, "Direct DCV max AE should survive formula recomputation.");
                    });
                });
            });
        },
        { displayName: "HERO: 5e Calculated Combat & Figured Values" },
    );
}
