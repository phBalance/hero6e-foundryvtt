import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import { HEROSYS } from "../herosystem6e.js";
import { XmlToItemData, SkillRollUpdateValue, makeAttack, updateItemDescription } from "../utility/upload_hdc.js";
import { convertToDcFromItem } from "../utility/damage.js";

export function registerUploadTests(quench) {
    quench.registerBatch(
        "quench.utils.upload",
        (context) => {
            const { describe, it, assert } = context

            describe("NAKEDMODIFIER Kaden", function () {


                const contents = `
                <POWER XMLID="NAKEDMODIFIER" ID="1630831670004" BASECOST="0.0" LEVELS="70" ALIAS="Naked Advantage" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <MODIFIER XMLID="GESTURES" ID="1690416300795" BASECOST="-0.25" LEVELS="0" ALIAS="Gestures" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="Yes" FORCEALLOW="No">
                    <NOTES />
                    <ADDER XMLID="BOTHHAND" ID="1690416300791" BASECOST="-0.25" LEVELS="0" ALIAS="Requires both hands" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                    <NOTES />
                    </ADDER>
                </MODIFIER>
                <MODIFIER XMLID="VISIBLE" ID="1690416300801" BASECOST="-0.25" LEVELS="0" ALIAS="Visible" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="INVISIBLEINOBVIOUS" OPTIONID="INVISIBLEINOBVIOUS" OPTION_ALIAS="Invisible Power becomes Inobvious" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  " PRIVATE="Yes" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="REDUCEDEND" ID="1690416300807" BASECOST="0.5" LEVELS="0" ALIAS="Reduced Endurance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ZERO" OPTIONID="ZERO" OPTION_ALIAS="0 END" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                </POWER>
                `;
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData(xmlDoc.children[0], "power")

                // Naked Advantage: Reduced Endurance (0 END; +1/2) for up to 70 Active Points (35 Active Points); Gestures (Requires both hands; -1/2), Linked to Opening of the Blind, Third Eye (Opening of the Blind, Third Eye; -1/4), Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)
                // Naked Advantage for up to 70 Active points (35 Active Points); Reduced Endurance (0 END; +1/2); Linked to Opening of the Blind, Third Eye (-1/4); Gestures (Requires both hands; -1/2); Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)
                // it("description", function () {
                //     assert.equal(item.system.description, "Reduced Endurance (0 END; +1/2) for up to 70 Active Points (35 Active Points); Gestures (Requires both hands; -1/2), Visible (Tattoos of flames encompass the biceps and shoulders.  When this power is active, these flames appear to burn, emitting firelight.  ; -1/4)");
                // });
                it("realCost", function () {
                    assert.equal(item.system.realCost, "20");
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
                    assert.equal(item.system.description, "+2 with a group of Mental Powers");
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

                // it("roll", function () {
                //     SkillRollUpdateValue(item)
                //     assert.equal(item.system.roll, "11-");
                // });
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
                    assert.equal(item.system.description, ""); // Climbing is part of the name
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
                    assert.equal(item.system.description, "1d6");
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
                updateItemDescription(item)

                it("description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -2 OCV, +1 DCV, 6d6 Strike");
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


            // WillForce362.hdc
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
                    assert.equal(item.system.description, "Telekinesis (62 STR), Alternate Combat Value (uses OMCV against DCV; +0) (93 Active Points); Limited Range (-1/4), Only In Alternate Identity (-1/4), Extra Time (Delayed Phase, -1/4), Requires A Roll (14- roll; -1/4)");
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
                    assert.equal(item.system.end, 0);
                });

                it("charges", function () {
                    assert.equal(item.system.charges.max, 8);
                });
                it("chargesRecoverable", function () {
                    assert.equal(item.system.charges.recoverable, false);
                });

            });

            describe("MINDCONTROL", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <POWER XMLID="MINDCONTROL" ID="1688874983494" BASECOST="0.0" LEVELS="15" ALIAS="Mind Control" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
              </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
                let item = itemData;
                makeAttack(item);

                it("description", function () {
                    assert.equal(item.system.description, "15d6");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 75);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 75);
                });

                it("dice", function () {
                    assert.equal(item.system.dice, 15);
                });

                it("extraDice", function () {
                    assert.equal(item.system.extraDice, "zero");
                });

                it("end", function () {
                    assert.equal(item.system.end, "7");
                });
            });

            // MalnacharOrc_Lars_Servant.hdc
            describe("MINDCONTROL advanced", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <POWER XMLID="MINDCONTROL" ID="1693772868443" BASECOST="0.0" LEVELS="15" ALIAS="Mind Control" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <MODIFIER XMLID="ARMORPIERCING" ID="1693773081504" BASECOST="0.0" LEVELS="1" ALIAS="Armor Piercing" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="REDUCEDEND" ID="1693773081509" BASECOST="0.25" LEVELS="0" ALIAS="Reduced Endurance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HALFEND" OPTIONID="HALFEND" OPTION_ALIAS="1/2 END" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="TELEPATHIC" ID="1693773081511" BASECOST="0.25" LEVELS="0" ALIAS="Telepathic" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="INVISIBLE" ID="1693773081515" BASECOST="0.25" LEVELS="0" ALIAS="Invisible Power Effects" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="INOBVIOUSINVISIBLEONE" OPTIONID="INOBVIOUSINVISIBLEONE" OPTION_ALIAS="Inobvious Power, Invisible to Mental Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="CUMULATIVE" ID="1693773081517" BASECOST="0.5" LEVELS="1" ALIAS="Cumulative" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="EXTRATIME" ID="1693773081558" BASECOST="-0.5" LEVELS="0" ALIAS="Extra Time" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="FULL" OPTIONID="FULL" OPTION_ALIAS="Full Phase" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
              </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
                let item = itemData;
                makeAttack(item);

                it("description", function () {
                    //                                     Mind Control 15d6, Armor Piercing (+1/4), Reduced Endurance (1/2 END; +1/4), Telepathic (+1/4), Invisible Power Effects (Invisible to Mental Group; +1/4), Cumulative (180 points; +3/4) (206 Active Points); Extra Time (Full Phase, -1/2)
                    //                                     15d6, Armor Piercing (+1/4), Reduced Endurance (1/2 END; +1/4), Telepathic (+1/4), Invisible Power Effects (Invisible to Mental Group; +1/4), Cumulative (180 points; +3/4) (206 Active Points); Extra Time (Full Phase, -1/2)
                    assert.equal(item.system.description, "15d6, Armor Piercing (+1/4), Reduced Endurance (1/2 END; +1/4), Telepathic (+1/4), Invisible Power Effects (Invisible to Mental Group; +1/4), Cumulative (180 points; +3/4) (206 Active Points); Extra Time (Full Phase, -1/2)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 137);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 206);
                });

                it("dice", function () {
                    assert.equal(item.system.dice, 15);
                });

                it("extraDice", function () {
                    assert.equal(item.system.extraDice, "zero");
                });

                it("end", function () {
                    assert.equal(item.system.end, "9");
                });
            });


            describe("COMBAT_LEVELS", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <SKILL XMLID="COMBAT_LEVELS" ID="1688944834273" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                <NOTES />
                </SKILL>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "martialart")
                let item = itemData;

                it("description", function () {
                    assert.equal(item.system.description, "+1 with any single attack");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 2);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 2);
                });

                it("end", function () {
                    assert.equal(item.system.end, "0");
                });
            });


            describe("INVISIBILITY", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <POWER XMLID="INVISIBILITY" ID="1689283663052" BASECOST="20.0" LEVELS="0" ALIAS="Invisibility" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Blind Minds" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <ADDER XMLID="TOUCHGROUP" ID="1689356871509" BASECOST="5.0" LEVELS="0" ALIAS="Touch Group" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                  <NOTES />
                </ADDER>
                <ADDER XMLID="NORMALSMELL" ID="1689356871510" BASECOST="3.0" LEVELS="0" ALIAS="Normal Smell" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                  <NOTES />
                </ADDER>
                <ADDER XMLID="COMBAT_SENSE" ID="1689356871511" BASECOST="5.0" LEVELS="0" ALIAS="Combat Sense" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                  <NOTES />
                </ADDER>
                <ADDER XMLID="HEARINGGROUP" ID="1689356871512" BASECOST="5.0" LEVELS="0" ALIAS="Hearing Group" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                  <NOTES />
                </ADDER>
                <MODIFIER XMLID="CONDITIONALPOWER" ID="1689356871533" BASECOST="-0.5" LEVELS="0" ALIAS="Conditional Power" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="COMMON" OPTIONID="COMMON" OPTION_ALIAS="Only vs organic perception" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                  <NOTES />
                </MODIFIER>
              </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                let item = itemData;

                it("description", function () {
                    assert.equal(item.system.description, "Invisibility to Sight, Touch and Hearing Groups, Normal Smell and Combat Sense (38 Active Points); Conditional Power Only vs organic perception (-1/2)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 25);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 38);
                });

                it("end", function () {
                    assert.equal(item.system.end, "4");
                });
            });


            describe("Killing Strike", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <MANEUVER XMLID="MANEUVER" ID="1689357675658" BASECOST="4.0" LEVELS="0" ALIAS="Killing Strike" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Killing Strike" OCV="-2" DCV="+0" DC="2" PHASE="1/2" EFFECT="[KILLINGDC]" ADDSTR="Yes" ACTIVECOST="10" DAMAGETYPE="0" MAXSTR="10" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="[WEAPONKILLINGDC]">
                <NOTES />
                </MANEUVER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);

                it("description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -2 OCV, +0 DCV, HKA 1d6 +1");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 4);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 4);
                });

                it("end", function () {
                    assert.equal(item.system.end, "0");
                });
            });


            // Cobalt
            describe("Laser Cutter", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.str.value = 15

                const contents = `
                <POWER XMLID="HKA" ID="1612300630772" BASECOST="0.0" LEVELS="2" ALIAS="Killing Attack - Hand-To-Hand" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1612300169863" NAME="Laser Cutter" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <MODIFIER XMLID="NOSTRBONUS" ID="1612300735512" BASECOST="-0.5" LEVELS="0" ALIAS="No STR Bonus" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="PENETRATING" ID="1612300743528" BASECOST="0.0" LEVELS="1" ALIAS="Penetrating" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="FOCUS" ID="1612300783360" BASECOST="-1.0" LEVELS="0" ALIAS="Focus" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="OAF" OPTIONID="OAF" OPTION_ALIAS="OAF" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="Pen-sized Device in pocket" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);
                let dcItem = convertToDcFromItem(item);

                it("description", function () {
                    assert.equal(item.system.description, "Killing Attack - Hand-To-Hand 2d6, Penetrating (+1/2) (45 Active Points); OAF (Pen-sized Device in pocket; -1), No STR Bonus (-1/2)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 18);
                });
                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 45);
                });
                it("end", function () {
                    assert.equal(item.system.end, "4");
                });
                it("dice", function () {
                    assert.equal(item.system.dice, "2");
                });
                it("extraDice", function () {
                    assert.equal(item.system.extraDice, "zero");
                });
                it("DC", function () {
                    assert.equal(dcItem.dc, 6);
                });
                it("killing", function () {
                    assert.equal(item.system.killing, true);
                });
            });



            // Crusher
            describe("Crush", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.str.value = 15

                const contents = `
                <POWER XMLID="RKA" ID="1624916890101" BASECOST="0.0" LEVELS="3" ALIAS="Killing Attack - Ranged" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Crush" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <MODIFIER XMLID="AOE" ID="1624916927944" BASECOST="0.0" LEVELS="6" ALIAS="Area Of Effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RADIUS" OPTIONID="RADIUS" OPTION_ALIAS="Radius" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="PERSONALIMMUNITY" ID="1624916935311" BASECOST="0.25" LEVELS="0" ALIAS="Personal Immunity" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="NORANGE" ID="1624916938937" BASECOST="-0.5" LEVELS="0" ALIAS="No Range" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="REDUCEDEND" ID="1624916950033" BASECOST="0.25" LEVELS="0" ALIAS="Reduced Endurance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HALFEND" OPTIONID="HALFEND" OPTION_ALIAS="1/2 END" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                <MODIFIER XMLID="MODIFIER" ID="1624916962588" BASECOST="-0.5" LEVELS="0" ALIAS="Must Follow Grab" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                    <NOTES />
                </MODIFIER>
                </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);
                let dcItem = convertToDcFromItem(item);

                it("description", function () {
                    assert.equal(item.system.description, "Killing Attack - Ranged 3d6, Personal Immunity (+1/4), Reduced Endurance (1/2 END; +1/4), Area Of Effect (6m Radius; +1/2) (90 Active Points); No Range (-1/2), Must Follow Grab (-1/2)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 45);
                });
                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 90);
                });
                it("end", function () {
                    assert.equal(item.system.end, "4");
                });
                it("dice", function () {
                    assert.equal(item.system.dice, "3");
                });
                it("extraDice", function () {
                    assert.equal(item.system.extraDice, "zero");
                });
                it("DC", function () {
                    assert.equal(dcItem.dc, 9);
                });
                it("killing", function () {
                    assert.equal(item.system.killing, true);
                });
            });



            describe("ENDURANCERESERVE", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.str.value = 15

                const contents = `
                <POWER XMLID="ENDURANCERESERVE" ID="1690410553721" BASECOST="0.0" LEVELS="20" ALIAS="Endurance Reserve" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <POWER XMLID="ENDURANCERESERVEREC" ID="1690410749576" BASECOST="0.0" LEVELS="5" ALIAS="Recovery" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                </POWER>
                </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                updateItemDescription(item);

                it("description", function () {
                    assert.equal(item.system.description, "(20 END, 5 REC)");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 9);
                });
                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 9);
                });
                it("end", function () {
                    assert.equal(item.system.end, "0");
                });
            });


            describe("Martial Dodge", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <MANEUVER XMLID="MANEUVER" ID="1691013321509" BASECOST="4.0" LEVELS="0" ALIAS="Martial Dodge" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Martial Dodge" OCV="--" DCV="+5" DC="0" PHASE="1/2" EFFECT="Dodge, Affects All Attacks, Abort" ADDSTR="No" ACTIVECOST="35" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No">
                <NOTES />
                </MANEUVER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);

                it("description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -- OCV, +5 DCV, Dodge, Affects All Attacks, Abort");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 4);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 4);
                });

                it("end", function () {
                    assert.equal(item.system.end, "0");
                });
            });

            describe("Skill Levels", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.ego.value = 38

                const contents = `
                <SKILL XMLID="SKILL_LEVELS" ID="1605812225611" BASECOST="0.0" LEVELS="10" ALIAS="Skill Levels" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="CHARACTERISTIC" OPTIONID="CHARACTERISTIC" OPTION_ALIAS="with single Skill or Characteristic Roll" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1604669259284" NAME="Martial Practice" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                <NOTES />
                </SKILL>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);

                it("description", function () {
                    assert.equal(item.system.description, "+10 with single Skill or Characteristic Roll");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 20);
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 20);
                });

                it("end", function () {
                    assert.equal(item.system.end, "0");
                });

                it("LEVELS", function () {
                    assert.equal(item.system.LEVELS.max, 10);
                });
            });




            describe("Flash", async function () {

                let actor = new HeroSystem6eActor({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true });
                actor.system.characteristics.str.value = 15

                const contents = `
                <POWER XMLID="FLASH" ID="1692225594431" BASECOST="0.0" LEVELS="5" ALIAS="Flash" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                <NOTES />
                <ADDER XMLID="HEARINGGROUP" ID="1692227848754" BASECOST="5.0" LEVELS="0" ALIAS="Hearing Group" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                <ADDER XMLID="PLUSONEHALFDIE" ID="1692227848755" BASECOST="3.0" LEVELS="0" ALIAS="+1/2 d6" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="No" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                <ADDER XMLID="MENTALGROUP" ID="1692227851548" BASECOST="5.0" LEVELS="0" ALIAS="Mental Group" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                <ADDER XMLID="NORMALSMELL" ID="1692227860234" BASECOST="3.0" LEVELS="0" ALIAS="Normal Smell" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                <ADDER XMLID="DANGER_SENSE" ID="1692227865084" BASECOST="3.0" LEVELS="0" ALIAS="Danger Sense" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                <ADDER XMLID="COMBAT_SENSE" ID="1692227866025" BASECOST="5.0" LEVELS="0" ALIAS="Combat Sense" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="-1.0" LVLVAL="-1.0" SELECTED="YES">
                    <NOTES />
                </ADDER>
                </POWER>
                    `;
                let parser = new DOMParser()
                let xmlDoc = parser.parseFromString(contents, 'text/xml')
                let itemData = XmlToItemData.call(actor, xmlDoc.children[0], "power")
                itemData.actor = actor
                let item = itemData;
                makeAttack(item);
                updateItemDescription(item);
                let dcItem = convertToDcFromItem(item);

                it("description", function () {
                    assert.equal(item.system.description, "Sight, Hearing and Mental Groups, Normal Smell, Danger Sense and Combat Sense Flash 5 1/2d6");
                });
                it("realCost", function () {
                    assert.equal(item.system.realCost, 49);
                });
                it("activePoints", function () {
                    assert.equal(item.system.activePoints, 49);
                });
                it("end", function () {
                    assert.equal(item.system.end, "5");
                });
                it("dice", function () {
                    assert.equal(item.system.dice, "5");
                });
                it("extraDice", function () {
                    assert.equal(item.system.extraDice, "half");
                });
                it("DC", function () {
                    assert.equal(dcItem.dc, 5.5);
                });
                it("killing", function () {
                    assert.equal(item.system.killing, false);
                });
            });






        },
        { displayName: "HERO: Upload" }
    );




}