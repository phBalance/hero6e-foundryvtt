import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import { HEROSYS } from "../herosystem6e.js";
import { XmlToItemData, SkillRollUpdateValue, makeAttack, updateItemDescription } from "../utility/upload_hdc.js";

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
                    assert.equal(item.system.description, "Climbing");
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

            describe("ENERGYBLAST", function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc'
                });

                const contents = `
                <POWER XMLID="ENERGYBLAST" ID="1686774389914" BASECOST="0.0" LEVELS="1" ALIAS="Fire Blast" POSITION="5" MULTIPLIER="1.0" GRAPHIC="zap" COLOR="255 0 0 " SFX="Fire/Heat" USE_END_RESERVE="Yes" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="PD" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                </POWER>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                item.actor = actor;

                it("description", function () {
                    assert.equal(item.system.description, "Fire Blast 1d6");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 5);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 5);
                });

                it("levels", function () {
                    assert.equal(item.system.LEVELS.max, 1);
                });

                it("end", function () {
                    assert.equal(item.system.end, 1);
                });

            });

            describe("Characteristics INT", function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc'
                });

                const contents = `
                <INT XMLID="INT" ID="1688339311497" BASECOST="0.0" LEVELS="3" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes" ADD_MODIFIERS_TO_BASE="No">
                <NOTES />
                </INT>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                item.actor = actor;

                it("description", function () {
                    assert.equal(item.system.description, "+3 INT");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 3);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 3);
                });

                it("levels", function () {
                    assert.equal(item.system.LEVELS.max, 3);
                });

                it("end", function () {
                    assert.equal(item.system.end, 0);
                });

            });

            describe("Offensive Strike", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                });
                actor.system.characteristics.str.value = 10

                const contents = `<MANEUVER XMLID="MANEUVER" ID="1688340787607" BASECOST="5.0" LEVELS="0" ALIAS="Offensive Strike" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Offensive Strike" OCV="-2" DCV="+1" DC="4" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="15" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                <NOTES />
                </MANEUVER>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const itemData = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
                itemData.actor = actor
                let item = itemData; // await HeroSystem6eItem.create(itemData, { parent: actor, temporary: true })
                makeAttack(item);
                updateItemDescription.call(item, item.system, item.type)

                it("description", function () {
                    assert.equal(item.system.description, "Offensive Strike: 1/2 Phase, -2 OCV, +1 DCV, 6d6 Strike");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 5);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 5);
                });

                it("dice", function () {
                    assert.equal(item.system.dice, 4);  // There are 4 raw dice, STR is added later
                });

                it("end", function () {
                    assert.equal(item.system.end, 0);
                });

            });


            describe("TELEKINESIS", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <POWER XMLID="TELEKINESIS" ID="1589145928828" BASECOST="0.0" LEVELS="62" ALIAS="Telekinesis" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Psychokinesis" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <MODIFIER XMLID="LIMITEDRANGE" ID="1596334078773" BASECOST="-0.25" LEVELS="0" ALIAS="Limited Range" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="OIHID" ID="1596334078774" BASECOST="-0.25" LEVELS="0" ALIAS="Only In Alternate Identity" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="EXTRATIME" ID="1596334078813" BASECOST="-0.25" LEVELS="0" ALIAS="Extra Time" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="PHASE" OPTIONID="PHASE" OPTION_ALIAS="Delayed Phase" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1596334078849" BASECOST="0.25" LEVELS="0" ALIAS="Requires A Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14- roll" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="ACV" ID="1596334078859" BASECOST="0.0" LEVELS="0" ALIAS="Alternate Combat Value" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="NONMENTALOMCV" OPTIONID="NONMENTALOMCV" OPTION_ALIAS="uses OMCV against DCV" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                </POWER>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
                item.actor = actor;

                it("description", function () {
                    assert.equal(item.system.description, "Telekinesis (62 STR) (93 Active Points); Alternate Combat Value (uses OMCV against DCV; +0); Limited Range (-1/4); Only In Alternate Identity (-1/4); Extra Time (Delayed Phase; -1/4); Requires A Roll (14- roll; -1/4)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 46);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 93);
                });

                it("levels", function () {
                    assert.equal(item.system.LEVELS.max, 62);
                });

                it("end", function () {
                    assert.equal(item.system.end, 9);
                });

            });

            describe("Sniper Rifle", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
            actor.system.characteristics.ego.value = 38

            const contents = `
                <POWER XMLID="RKA" ID="1688357238677" BASECOST="0.0" LEVELS="2" ALIAS="Killing Attack - Ranged" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Sniper Rifle" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <ADDER XMLID="PLUSONEHALFDIE" ID="1688357355014" BASECOST="10.0" LEVELS="0" ALIAS="+1/2 d6" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" SELECTED="YES">
                  <NOTES />
                </ADDER>
                <MODIFIER XMLID="FOCUS" ID="1688357355044" BASECOST="-1.0" LEVELS="0" ALIAS="Focus" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="OAF" OPTIONID="OAF" OPTION_ALIAS="OAF" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="CHARGES" ID="1688357368689" BASECOST="-0.5" LEVELS="0" ALIAS="Charges" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="EIGHT" OPTIONID="EIGHT" OPTION_ALIAS="8" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
              </POWER>
                `;
            let parser = new DOMParser()
            let xmlDoc = parser.parseFromString(contents, 'text/xml')
            let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
            let item = itemData; //await HeroSystem6eItem.create(itemData, { parent: actor, temporary: true })
            makeAttack(item);

            it("description", function () {
                assert.equal(item.system.description, "Killing Attack - Ranged 2 1/2d6 (40 Active Points); OAF (-1), 8 Charges (-1/2)");
            });
            it("realCost", function () {
                assert.equal(item.system.realCost, 16);
            });

            it("activePoints", function () {
                assert.equal(item.system.activePoints, 40);
            });

            it("dice", function () {
                assert.equal(item.system.dice, 2);
            });

            it("extraDice", function () {
                assert.equal(item.system.extraDice, "half");
            });

            it("end", function () {
                assert.equal(item.system.end, "[8]");
            });

        });


},
{ displayName: "HERO: Upload" }
    );
}