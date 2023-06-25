import { HeroSystem6eActor } from "../actor/actor.js";
import { HEROSYS } from "../herosystem6e.js";
import { XmlToItemData, SkillRollUpdateValue } from "../utility/upload_hdc.js";

export function registerUploadTests(quench) {
    quench.registerBatch(
        "quench.utils.upload",
        (context) => {
            const { describe, it, assert } = context

            describe("NAKEDMODIFIER Kaden", function () {


                const contents = `<POWER XMLID="NAKEDMODIFIER" ID="1630831670004" BASECOST="0.0" LEVELS="70" ALIAS="Naked Advantage" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        <MODIFIER XMLID="LINKED" ID="1641177179396" BASECOST="-0.25" LEVELS="0" ALIAS="Linked to Opening of the Blind, Third Eye" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="Yes" FORCEALLOW="No" LINKED_ID="1630797085661">
                        <NOTES />
                        </MODIFIER>
                        <MODIFIER XMLID="GESTURES" ID="1641177179401" BASECOST="-0.25" LEVELS="0" ALIAS="Gestures" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="Yes" FORCEALLOW="No">
                        <NOTES />
                        <ADDER XMLID="BOTHHAND" ID="1641177179397" BASECOST="-0.25" LEVELS="0" ALIAS="Requires both hands" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                            <NOTES />
                        </ADDER>
                        </MODIFIER>
                        <MODIFIER XMLID="VISIBLE" ID="1641177179402" BASECOST="-0.25" LEVELS="0" ALIAS="Visible" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  " PRIVATE="Yes" FORCEALLOW="No">
                        <NOTES />
                        </MODIFIER>
                        <MODIFIER XMLID="REDUCEDEND" ID="1641177179407" BASECOST="0.5" LEVELS="0" ALIAS="Reduced Endurance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ZERO" OPTIONID="ZERO" OPTION_ALIAS="0 END" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                        <NOTES />
                        </MODIFIER>
                    </POWER>`;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData(xmlDoc.children[0], "power")

                // Naked Advantage: Reduced Endurance (0 END; +1/2) for up to 70 Active Points (35 Active Points); Gestures (Requires both hands; -1/2), Linked to Opening of the Blind, Third Eye (Opening of the Blind, Third Eye; -1/4), Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)
                // Naked Advantage for up to 70 Active points (35 Active Points); Reduced Endurance (0 END; +1/2); Linked to Opening of the Blind, Third Eye (-1/4); Gestures (Requires both hands; -1/2); Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)
                // it("description", function () {
                //     assert.equal(item.system.description, "Naked Advantage: Reduced Endurance (0 END; +1/2) for up to 70 Active Points (35 Active Points); Gestures (Requires both hands; -1/2), Linked to Opening of the Blind, Third Eye (Opening of the Blind, Third Eye; -1/4), Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)");
                // });
                it("realCost", function () {
                    assert.equal(item.system.realCost, "17");
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, "35");
                });
            });

            // https://discord.com/channels/609528652878839828/770825017729482772/1122607244035493888
            describe("MENTAL_COMBAT_LEVELS", function () {


                const contents = `
                <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1687721775906" BASECOST="0.0" LEVELS="2" ALIAS="Mental Combat Skill Levels" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with a group of Mental Powers" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Mind Empowered" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                <NOTES />
                </SKILL>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData(xmlDoc.children[0], "skill")
                
                it("description", function () {
                    assert.equal(item.system.description, "Mind Empowered: +2 with a group of Mental Powers");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 6);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 6);
                });

                it("levels", function () {
                    assert.equal(item.system.LEVELS.max, 2);
                });

                it("end", function () {
                    assert.equal(item.system.end, 0);
                });

                it("roll", function () {
                    SkillRollUpdateValue(item)
                    assert.equal(item.system.roll, "11-");
                });
            });

            describe("CLIMBING", function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc'
                });
                actor.system.characteristics.dex.value = 15

                const contents = `
                <SKILL XMLID="CLIMBING" ID="1687723638849" BASECOST="3.0" LEVELS="0" ALIAS="Climbing" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                <NOTES />
                </SKILL>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData.call(actor, xmlDoc.children[0], "skill")
                item.actor = actor;

                it("description", function () {
                    assert.equal(item.system.description, "Climbing 12-");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 3);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 3);
                });

                it("levels", function () {
                    assert.equal(item.system.LEVELS.max, 0);
                });

                it("end", function () {
                    assert.equal(item.system.end, 0);
                });

                it("roll", function () {
                    SkillRollUpdateValue(item)
                    assert.equal(item.system.roll, "12-");
                });
            });

        },
        { displayName: "HERO: Upload" }
    );
}