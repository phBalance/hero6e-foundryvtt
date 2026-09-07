import { createQuenchActor, deleteQuenchActor, setQuenchTimeout } from "./quench-helper.mjs";
import { HeroSystem6eCompendiumDirectory } from "../compendium/compendiumDirectory.mjs";
import { HeroSystemActorSheetV2 } from "../applications/actor/actor-sheet-v2.mjs";

export function registerDragAndDropTests(quench) {
    quench.registerBatch(`${game.system.id}.testing.drop-tests`, (context) => {
        const { describe, it, before, beforeEach, after, expect } = context;

        const hdpContents = `<?xml version="1.0" encoding="UTF-16"?>
            <PREFAB version="6.0" TEMPLATE="builtIn.Heroic6E.hdt">
            <CHARACTER_INFO CHARACTER_NAME="_Quench Test" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
                <BACKGROUND />
                <PERSONALITY />
                <QUOTE />
                <TACTICS />
                <CAMPAIGN_USE />
                <APPEARANCE />
                <NOTES1 />
                <NOTES2 />
                <NOTES3 />
                <NOTES4 />
                <NOTES5 />
            </CHARACTER_INFO>
            <CHARACTERISTICS>
                <STR XMLID="STR" ID="1785778287885" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                <NOTES />
                </STR>
            </CHARACTERISTICS>
            <SKILLS />
            <PERKS />
            <TALENTS />
            <MARTIALARTS />
            <POWERS>
                <LIST XMLID="GENERIC_OBJECT" ID="1787873035926" BASECOST="0.0" LEVELS="0" ALIAS="List1" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                <NOTES />
                </LIST>
                <POWER XMLID="COMPOUNDPOWER" ID="1787873810737" BASECOST="0.0" LEVELS="0" ALIAS="Compound Power" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1787873035926" NAME="CompoundPower3" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <POWER XMLID="CLINGING" ID="1787873855191" BASECOST="10.0" LEVELS="0" ALIAS="Clinging" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                </POWER>
                </POWER>
                <VPP XMLID="GENERIC_OBJECT" ID="1787873419350" BASECOST="0.0" LEVELS="99" ALIAS="Variable Power Pool" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="VPP1" QUANTITY="1">
                <NOTES />
                <ADDER XMLID="CONTROLCOST" ID="1787873461743" BASECOST="0.0" LEVELS="99" ALIAS="Control Cost" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="No" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="1.0" LVLVAL="2.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                </VPP>
                <POWER XMLID="COMPOUNDPOWER" ID="1787873748619" BASECOST="0.0" LEVELS="0" ALIAS="Compound Power" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1787873419350" NAME="CompoundPower2" QUANTITY="99" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                <NOTES />
                <SWIMMING XMLID="SWIMMING" ID="1787873833383" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes" ADD_MODIFIERS_TO_BASE="No">
                    <NOTES />
                </SWIMMING>
                </POWER>
                <MULTIPOWER XMLID="GENERIC_OBJECT" ID="1787873173815" BASECOST="99.0" LEVELS="0" ALIAS="Multipower" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1">
                <NOTES />
                </MULTIPOWER>
                <POWER XMLID="COMPOUNDPOWER" ID="1787873271361" BASECOST="0.0" LEVELS="0" ALIAS="Compound Power" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1787873173815" ULTRA_SLOT="Yes" NAME="CompoundPower1" QUANTITY="1" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                <NOTES />
                <POWER XMLID="EGOATTACK" ID="1787873352472" BASECOST="0.0" LEVELS="1" ALIAS="Mental Blast" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="MentalBlast1" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                </POWER>
                <POWER XMLID="TUNNELING" ID="1787873394370" BASECOST="2.0" LEVELS="1" ALIAS="Tunneling" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                </POWER>
                </POWER>
                <POWER XMLID="ENERGYBLAST" ID="1787873261859" BASECOST="0.0" LEVELS="1" ALIAS="Blast M" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1787873173815" ULTRA_SLOT="Yes" NAME="Blast M" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                </POWER>
            </POWERS>
            <DISADVANTAGES />
            <EQUIPMENT />
            </PREFAB>`;

        describe("HDP Upload & Stacking", function () {
            setQuenchTimeout(this);
            let quenchActor6e;
            let quenchActor5e;
            let testCompendium;
            let actorSheet6e;
            let actorSheet5e;

            before(async () => {
                testCompendium = await HeroSystem6eCompendiumDirectory.uploadFromXml(hdpContents);
                quenchActor6e = await createQuenchActor({ quench: this, is5e: false, actorType: "pc" });
                actorSheet6e = quenchActor6e.sheet;
                await actorSheet6e.render(true);

                quenchActor5e = await createQuenchActor({ quench: this, is5e: true, actorType: "pc" });
                actorSheet5e = quenchActor5e.sheet;
            });

            beforeEach(async () => {
                if (quenchActor6e?.items?.size > 0) {
                    const ids = quenchActor6e.items.map((i) => i.id);
                    await quenchActor6e.deleteEmbeddedDocuments("Item", ids);
                }
            });

            after(async () => {
                if (actorSheet6e?.rendered) {
                    await actorSheet6e.close();
                }
                if (quenchActor6e) {
                    await deleteQuenchActor({ quench: this, actor: quenchActor6e });
                }
                if (quenchActor5e) {
                    await deleteQuenchActor({ quench: this, actor: quenchActor5e });
                }
                if (testCompendium) {
                    await testCompendium.deleteCompendium();
                }
            });

            it("Upload and verify 11 documents", async () => {
                expect(testCompendium).to.exist;
                const documents = await testCompendium.getDocuments();
                expect(documents.length).to.equal(11);
            });

            it("Add 'Blast M' to actor powers twice (no stacking)", async () => {
                const documents = await testCompendium.getDocuments();
                const blastMDoc = documents.find((d) => d.name === "Blast M");
                expect(blastMDoc).to.exist;

                const fakeEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: blastMDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet6e.element,
                };

                await actorSheet6e._onDrop(fakeEvent);
                let blastMItems = quenchActor6e.items.filter((item) => item.name === blastMDoc.name);
                expect(blastMItems.length).to.equal(1);

                await actorSheet6e._onDrop(fakeEvent);
                blastMItems = quenchActor6e.items.filter((item) => item.name === blastMDoc.name);
                expect(blastMItems.length).to.equal(2);
            });

            it("Drop 'Blast M' to equipment tab twice (stacking check)", async () => {
                const documents = await testCompendium.getDocuments();
                const blastMDoc = documents.find((d) => d.name === "Blast M");
                expect(blastMDoc).to.exist;

                const fakeEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: blastMDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet6e.element,
                };

                // Drop first instance into equipment tab
                await actorSheet6e._onDrop(fakeEvent);
                let equipmentItems = quenchActor6e.items.filter((item) => item.name === blastMDoc.name);
                expect(equipmentItems.length).to.equal(1);
                expect(equipmentItems[0].system.QUANTITY).to.equal(1);

                // Drop second instance into equipment tab (should stack into the existing equipment entry)
                await actorSheet6e._onDrop(fakeEvent);
                equipmentItems = quenchActor6e.items.filter((item) => item.name === blastMDoc.name);
                expect(equipmentItems.length).to.equal(1);
                expect(equipmentItems[0].system.QUANTITY).to.equal(2);
            });

            it("Add 'List1' twice to powers and equipment (stacking check)", async () => {
                const documents = await testCompendium.getDocuments();
                const listDoc = documents.find((d) => d.name === "List1");
                expect(listDoc).to.exist;

                const powersEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: listDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet6e.element,
                };

                const equipmentEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: listDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet6e.element,
                };

                // Test dropping List1 twice to Powers (expect 2 separate list items)
                await actorSheet6e._onDrop(powersEvent);
                await actorSheet6e._onDrop(powersEvent);
                let powerListItems = quenchActor6e.items.filter((item) => item.name === listDoc.name);
                expect(powerListItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor6e.items.map((i) => i.id);
                await quenchActor6e.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping List1 twice to Equipment (LIST doesn't support quantity, creates 2 items)
                await actorSheet6e._onDrop(equipmentEvent);
                await actorSheet6e._onDrop(equipmentEvent);
                let equipmentListItems = quenchActor6e.items.filter((item) => item.name === listDoc.name);
                expect(equipmentListItems.length).to.equal(2);
            });

            it("Add 'VPP1' twice to powers and equipment (stacking check)", async () => {
                const documents = await testCompendium.getDocuments();
                const vppDoc = documents.find((d) => d.name === "VPP1");
                expect(vppDoc).to.exist;

                const powersEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: vppDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet6e.element,
                };

                const equipmentEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: vppDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet6e.element,
                };

                // Test dropping VPP1 twice to Powers
                await actorSheet6e._onDrop(powersEvent);
                await actorSheet6e._onDrop(powersEvent);
                let powerVppItems = quenchActor6e.items.filter((item) => item.name === vppDoc.name);
                expect(powerVppItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor6e.items.map((i) => i.id);
                await quenchActor6e.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping VPP1 twice to Equipment (expect 1 item with quantity 2)
                await actorSheet6e._onDrop(equipmentEvent);
                await actorSheet6e._onDrop(equipmentEvent);
                let equipmentVppItems = quenchActor6e.items.filter((item) => item.name === vppDoc.name);
                expect(equipmentVppItems.length).to.equal(1);
                expect(equipmentVppItems[0].system.QUANTITY).to.equal(2);
            });

            it("Add 'Multipower' twice to powers and equipment (stacking check)", async () => {
                const documents = await testCompendium.getDocuments();
                const mpDoc = documents.find((d) => d.system.XMLID === "MULTIPOWER");
                expect(mpDoc).to.exist;

                const powersEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: mpDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet6e.element,
                };

                const equipmentEvent = {
                    preventDefault: () => {},
                    dataTransfer: {
                        getData: (format) => {
                            if (format === "text/plain") {
                                return JSON.stringify({
                                    type: "Item",
                                    uuid: mpDoc.uuid,
                                });
                            }
                            return "";
                        },
                    },
                    target:
                        actorSheet6e.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet6e.element,
                };

                // Test dropping Multipower twice to Powers
                await actorSheet6e._onDrop(powersEvent);
                await actorSheet6e._onDrop(powersEvent);
                let powerMpItems = quenchActor6e.items.filter((item) => item.system.XMLID === "MULTIPOWER");
                expect(powerMpItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor6e.items.map((i) => i.id);
                await quenchActor6e.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping Multipower twice to Equipment (currently fails due to stacking bug; expects 1 item with quantity 2)
                await actorSheet6e._onDrop(equipmentEvent);
                const itemCountAfterFirstMultiPower = quenchActor6e.items.size;
                await actorSheet6e._onDrop(equipmentEvent);
                let equipmentMpItems = quenchActor6e.items.filter((item) => item.system.XMLID === "MULTIPOWER");
                expect(equipmentMpItems.length).to.equal(1);
                expect(equipmentMpItems[0].system.QUANTITY).to.equal(2);
                expect(quenchActor6e.items.size).to.equal(itemCountAfterFirstMultiPower);
            });

            // Test dropping all the standard 5e/6e compendium items onto an actor
            for (const edition of [5, 6]) {
                describe(`Add all ${edition}e compendium items`, function () {
                    let compendium, actorSheet;
                    const compendiumName = `world.heroitems-${edition}e`;

                    before(async function () {
                        compendium = game.packs.get(compendiumName);
                        expect(compendium, `Unable to locate ${compendiumName}`).to.exist;

                        actorSheet = edition === 5 ? actorSheet5e : actorSheet6e;
                        await actorSheet.render(true);
                    });

                    beforeEach(async function () {
                        const itemIds = actorSheet.actor.items.map((i) => i.id);
                        if (itemIds.length > 0) {
                            await actorSheet.actor.deleteEmbeddedDocuments("Item", itemIds);
                        }
                    });

                    const targetPack = game.packs.get(compendiumName);
                    // Only target root folders that have no parent folder, sorted alphabetically by name
                    const rootFolders = (targetPack?.folders ?? [])
                        .filter((folder) => !folder.folder)
                        .sort((a, b) => a.name.localeCompare(b.name));

                    rootFolders.forEach((folder) => {
                        it(`${edition}e ${folder.name}`, async function () {
                            const itemType =
                                HeroSystemActorSheetV2._TAB_ITEM_TYPES[folder.name.toLowerCase()] ||
                                folder.name.toLowerCase();

                            const genericEvent = {
                                preventDefault: () => {},
                                dataTransfer: {
                                    getData: (format) => {
                                        if (format === "text/plain") {
                                            return JSON.stringify({
                                                type: folder.documentName,
                                                uuid: folder.uuid,
                                            });
                                        }
                                        return "";
                                    },
                                },
                                target: actorSheet6e.element,
                            };

                            await actorSheet._onDrop(genericEvent);

                            // Helper to recursively collect all nested subfolder IDs
                            const getDescendantFolderIds = (folder) => {
                                let ids = [];
                                for (const child of folder.children) {
                                    const childFolder = child.folder;
                                    ids.push(childFolder.id);
                                    ids.push(...getDescendantFolderIds(childFolder));
                                }
                                return ids;
                            };

                            const allFolderIds = [folder.id, ...getDescendantFolderIds(folder)];
                            const expectedEntries = targetPack.index.filter((entry) =>
                                allFolderIds.includes(entry.folder),
                            );
                            const expectedCount = expectedEntries.length;

                            const matchingItems = actorSheet.actor.items.filter((o) => o.type === itemType);

                            if (matchingItems.length !== expectedCount) {
                                const expectedNames = expectedEntries.map((e) => e.name).sort();
                                const actualNames = matchingItems.map((i) => i.name).sort();

                                console.warn(
                                    `[Test Mismatch] Folder "${folder.name}" (${edition}e): Expected ${expectedCount}, but found ${matchingItems.length}`,
                                );
                                console.warn("Expected items:", expectedNames);
                                console.warn("Actual items on actor:", actualNames);

                                // Find missing or extra items for convenience
                                const missing = expectedNames.filter((name) => !actualNames.includes(name));
                                const extra = actualNames.filter((name) => !expectedNames.includes(name));
                                if (missing.length > 0) console.warn("Missing items:", missing);
                                if (extra.length > 0) console.warn("Unexpected extra items:", extra);
                            }

                            expect(matchingItems.length).to.equal(expectedCount);
                        });
                    });
                });
            }
        });
    });
}
