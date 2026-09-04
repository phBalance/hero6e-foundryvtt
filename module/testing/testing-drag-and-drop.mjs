import { createQuenchActor, deleteQuenchActor, setQuenchTimeout } from "./quench-helper.mjs";
import { HeroSystem6eCompendiumDirectory } from "../compendium/compendiumDirectory.mjs";

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
            let quenchActor;
            let testCompendium;
            let actorSheet;

            before(async () => {
                testCompendium = await HeroSystem6eCompendiumDirectory.uploadFromXml(hdpContents);
                quenchActor = await createQuenchActor({ quench: this, is5e: true, actorType: "pc" });

                actorSheet = quenchActor.sheet;
                await actorSheet.render(true);
            });

            beforeEach(async () => {
                if (quenchActor?.items?.size > 0) {
                    const ids = quenchActor.items.map((i) => i.id);
                    await quenchActor.deleteEmbeddedDocuments("Item", ids);
                }
            });

            after(async () => {
                if (actorSheet?.rendered) {
                    await actorSheet.close();
                }
                if (quenchActor) {
                    await deleteQuenchActor({ quench: this, actor: quenchActor });
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
                        actorSheet.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet.element,
                };

                await actorSheet._onDrop(fakeEvent);
                let blastMItems = quenchActor.items.filter((item) => item.name === blastMDoc.name);
                expect(blastMItems.length).to.equal(1);

                await actorSheet._onDrop(fakeEvent);
                blastMItems = quenchActor.items.filter((item) => item.name === blastMDoc.name);
                expect(blastMItems.length).to.equal(2);
            });

            it("Drop 'Blast M' to equipment tab twice (auto-converts to equipment and stacks)", async () => {
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
                        actorSheet.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet.element,
                };

                // Drop first instance into equipment tab
                await actorSheet._onDrop(fakeEvent);
                let equipmentItems = quenchActor.items.filter((item) => item.name === blastMDoc.name);
                expect(equipmentItems.length).to.equal(1);
                expect(equipmentItems[0].system.QUANTITY).to.equal(1);

                // Drop second instance into equipment tab (should stack into the existing equipment entry)
                await actorSheet._onDrop(fakeEvent);
                equipmentItems = quenchActor.items.filter((item) => item.name === blastMDoc.name);
                expect(equipmentItems.length).to.equal(1);
                expect(equipmentItems[0].system.QUANTITY).to.equal(2);
            });

            it("Add 'List1' twice to powers and equipment (no stacking, creates multiple copies)", async () => {
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
                        actorSheet.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet.element,
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
                        actorSheet.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet.element,
                };

                // Test dropping List1 twice to Powers (expect 2 separate list items)
                await actorSheet._onDrop(powersEvent);
                await actorSheet._onDrop(powersEvent);
                let powerListItems = quenchActor.items.filter((item) => item.name === listDoc.name);
                expect(powerListItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor.items.map((i) => i.id);
                await quenchActor.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping List1 twice to Equipment (LIST doesn't support quantity, creates 2 items)
                await actorSheet._onDrop(equipmentEvent);
                await actorSheet._onDrop(equipmentEvent);
                let equipmentListItems = quenchActor.items.filter((item) => item.name === listDoc.name);
                expect(equipmentListItems.length).to.equal(2);
            });

            it("Add 'VPP1' twice to powers and equipment (no stacking, creates multiple copies)", async () => {
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
                        actorSheet.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet.element,
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
                        actorSheet.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet.element,
                };

                // Test dropping VPP1 twice to Powers
                await actorSheet._onDrop(powersEvent);
                await actorSheet._onDrop(powersEvent);
                let powerVppItems = quenchActor.items.filter((item) => item.name === vppDoc.name);
                expect(powerVppItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor.items.map((i) => i.id);
                await quenchActor.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping VPP1 twice to Equipment (expect 1 item with quantity 2)
                await actorSheet._onDrop(equipmentEvent);
                await actorSheet._onDrop(equipmentEvent);
                let equipmentVppItems = quenchActor.items.filter((item) => item.name === vppDoc.name);
                expect(equipmentVppItems.length).to.equal(1);
                expect(equipmentVppItems[0].system.QUANTITY).to.equal(2);
            });

            it.only("Add 'Multipower' twice to powers and equipment (no stacking, creates multiple copies)", async () => {
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
                        actorSheet.element?.querySelector(".tab[data-tab='powers'], [data-tab='powers']") ||
                        actorSheet.element,
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
                        actorSheet.element?.querySelector(".tab[data-tab='equipment'], [data-tab='equipment']") ||
                        actorSheet.element,
                };

                // Test dropping Multipower twice to Powers
                await actorSheet._onDrop(powersEvent);
                await actorSheet._onDrop(powersEvent);
                let powerMpItems = quenchActor.items.filter((item) => item.system.XMLID === "MULTIPOWER");
                expect(powerMpItems.length).to.equal(2);

                // Clear out items for equipment test
                const currentIds = quenchActor.items.map((i) => i.id);
                await quenchActor.deleteEmbeddedDocuments("Item", currentIds);

                // Test dropping Multipower twice to Equipment (currently fails due to stacking bug; expects 1 item with quantity 2)
                await actorSheet._onDrop(equipmentEvent);
                const itemCountAfterFirstMultiPower = quenchActor.items.size;
                await actorSheet._onDrop(equipmentEvent);
                let equipmentMpItems = quenchActor.items.filter((item) => item.system.XMLID === "MULTIPOWER");
                expect(equipmentMpItems.length).to.equal(1);
                expect(equipmentMpItems[0].system.QUANTITY).to.equal(2);
                expect(quenchActor.items.size).to.equal(itemCountAfterFirstMultiPower);
            });
        });
    });
}
