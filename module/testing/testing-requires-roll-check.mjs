import { createQuenchActor, deleteQuenchActor, setQuenchTimeout } from "./quench-helper.mjs";
import {
    Roll3On3Dice,
    Roll6On3Dice,
    Roll7On3Dice,
    Roll8On3Dice,
    Roll9On3Dice,
    Roll10On3Dice,
    Roll12On3Dice,
    Roll13On3Dice,
} from "./dice-testing-helper.mjs";

import { isActivatedForThisUse_TestingOnly } from "../item/item-requires-roll.mjs";

import { getAndSetGameSetting } from "../settings/settings-helpers.mjs";

import { HeroRoll } from "../utility/dice.mjs";

export function registerRequiresRollCheckTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.item.requiresCheck",
        (context) => {
            const { after, before, describe, expect, it } = context;

            describe("ACTIVATIONROLL and REQUIRESASKILLROLL", function () {
                // The default timeout tends to be insufficient with multiple actors being created at the same time.
                setQuenchTimeout(this);

                // PH: FIXME: Need to get a proper 5e HDC with the ACTIVATIONROLL fixed. Also need to update MigrateData appropriately.
                describe("Old HDC 5e character with sectional defenses #3876", function () {
                    const contents = `
                        <?xml version="1.0" encoding="UTF-16"?>
                        <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                        <BASIC_CONFIGURATION BASE_POINTS="0" DISAD_POINTS="0" EXPERIENCE="0" RULES="Default" />
                        <CHARACTER_INFO CHARACTER_NAME="Armor for Kazei 5" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                            <STR XMLID="STR" ID="1236647926251" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STR>
                            <DEX XMLID="DEX" ID="1236647925404" BASECOST="0.0" LEVELS="0" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </DEX>
                            <CON XMLID="CON" ID="1236647925283" BASECOST="0.0" LEVELS="0" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </CON>
                            <BODY XMLID="BODY" ID="1236647925914" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </BODY>
                            <INT XMLID="INT" ID="1236647925505" BASECOST="0.0" LEVELS="0" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </INT>
                            <EGO XMLID="EGO" ID="1236647925687" BASECOST="0.0" LEVELS="0" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </EGO>
                            <PRE XMLID="PRE" ID="1236647926083" BASECOST="0.0" LEVELS="0" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PRE>
                            <COM XMLID="COM" ID="1236647925348" BASECOST="0.0" LEVELS="0" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </COM>
                            <PD XMLID="PD" ID="1236647925430" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PD>
                            <ED XMLID="ED" ID="1236647925341" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </ED>
                            <SPD XMLID="SPD" ID="1236647926135" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SPD>
                            <REC XMLID="REC" ID="1236647925598" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </REC>
                            <END XMLID="END" ID="1236647925309" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </END>
                            <STUN XMLID="STUN" ID="1236647925524" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STUN>
                            <RUNNING XMLID="RUNNING" ID="1236647925462" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </RUNNING>
                            <SWIMMING XMLID="SWIMMING" ID="1236647925294" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SWIMMING>
                            <LEAPING XMLID="LEAPING" ID="1236647925643" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </LEAPING>
                        </CHARACTERISTICS>
                        <SKILLS />
                        <PERKS />
                        <TALENTS />
                        <MARTIALARTS />
                        <POWERS />
                        <DISADVANTAGES />
                        <EQUIPMENT>
                            <POWER XMLID="FORCEFIELD" ID="1773253025088" BASECOST="0.0" LEVELS="18" ALIAS="Resistant Protection" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" PRICE="0.0" WEIGHT="0.0" CARRIED="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Level I Security Armor" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="9" EDLEVELS="9" MDLEVELS="0" POWDLEVELS="0">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1773253025046" BASECOST="-0.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations 6-18" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                                <MODIFIER XMLID="FOCUS" ID="1773253025073" BASECOST="-0.5" LEVELS="0" ALIAS="Focus" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="OIF" OPTIONID="OIF" OPTION_ALIAS="OIF" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                                <MODIFIER XMLID="REALARMOR" ID="1773253025075" BASECOST="-0.25" LEVELS="0" ALIAS="Real Armor" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                        </EQUIPMENT>
                        </CHARACTER>
                    `;

                    let actor;
                    let sectionalSecurityArmor;
                    let sectionalActivationRollModifier;

                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: true });

                        sectionalSecurityArmor = actor.items.find((item) => item.name === "Level I Security Armor");
                        sectionalActivationRollModifier = sectionalSecurityArmor.system.MODIFIER.find(
                            (mod) => mod.XMLID === "ACTIVATIONROLL",
                        );
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("sectional security armor - old item migration", async function () {
                        it("should have a created OPTION property", function () {
                            expect(sectionalActivationRollModifier.OPTION).to.equal("14");
                        });

                        it("should have a created OPTIONID property", function () {
                            expect(sectionalActivationRollModifier.OPTIONID).to.equal("14");
                        });
                    });
                });

                describe("5e - activation roll", function () {
                    const contents = `
                        <?xml version="1.0" encoding="UTF-16"?>
                        <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                        <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                        <CHARACTER_INFO CHARACTER_NAME="Test 5e Activation Roll" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                            <STR XMLID="STR" ID="1774142627887" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STR>
                            <DEX XMLID="DEX" ID="1774142627915" BASECOST="0.0" LEVELS="0" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </DEX>
                            <CON XMLID="CON" ID="1774142627900" BASECOST="0.0" LEVELS="0" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </CON>
                            <BODY XMLID="BODY" ID="1774142628378" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </BODY>
                            <INT XMLID="INT" ID="1774142628524" BASECOST="0.0" LEVELS="0" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </INT>
                            <EGO XMLID="EGO" ID="1774142628258" BASECOST="0.0" LEVELS="0" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </EGO>
                            <PRE XMLID="PRE" ID="1774142628046" BASECOST="0.0" LEVELS="0" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PRE>
                            <COM XMLID="COM" ID="1774142628559" BASECOST="0.0" LEVELS="0" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </COM>
                            <PD XMLID="PD" ID="1774142628390" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PD>
                            <ED XMLID="ED" ID="1774142628238" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </ED>
                            <SPD XMLID="SPD" ID="1774142628459" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SPD>
                            <REC XMLID="REC" ID="1774142627846" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </REC>
                            <END XMLID="END" ID="1774142628189" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </END>
                            <STUN XMLID="STUN" ID="1774142627957" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STUN>
                            <RUNNING XMLID="RUNNING" ID="1774142628084" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </RUNNING>
                            <SWIMMING XMLID="SWIMMING" ID="1774142627962" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SWIMMING>
                            <LEAPING XMLID="LEAPING" ID="1774142628064" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </LEAPING>
                        </CHARACTERISTICS>
                        <SKILLS>
                            <SKILL XMLID="ACROBATICS" ID="1774142644678" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 8-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144246591" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144750794" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 8- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144800582" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144800569" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146160475" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 8- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146299672" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146302202" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146303922" BASECOST="0.5" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143298339" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 9-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144255902" BASECOST="-1.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="9" OPTIONID="9" OPTION_ALIAS="9-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144777528" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 9- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144833320" BASECOST="-1.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="9" OPTIONID="9" OPTION_ALIAS="9-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144833307" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146165573" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 9- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146286632" BASECOST="-1.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="9" OPTIONID="9" OPTION_ALIAS="9-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146291491" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146292690" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143301295" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 10-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144260607" BASECOST="-1.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="10" OPTIONID="10" OPTION_ALIAS="10-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144781077" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 10- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144854707" BASECOST="-1.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="10" OPTIONID="10" OPTION_ALIAS="10-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144863126" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146171326" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 10- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146274809" BASECOST="-1.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="10" OPTIONID="10" OPTION_ALIAS="10-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146277740" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146279691" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143303272" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 11-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144268402" BASECOST="-1.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="11" OPTIONID="11" OPTION_ALIAS="11-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144783547" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 11- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144874298" BASECOST="-1.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="11" OPTIONID="11" OPTION_ALIAS="11-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144874285" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146176105" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 11- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146263211" BASECOST="-1.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="11" OPTIONID="11" OPTION_ALIAS="11-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146266046" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146267964" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143304943" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 12-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144274027" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="12" OPTIONID="12" OPTION_ALIAS="12-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144786628" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 12- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144890805" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="12" OPTIONID="12" OPTION_ALIAS="12-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144890792" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146181084" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 12- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146251051" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="12" OPTIONID="12" OPTION_ALIAS="12-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146255358" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146256989" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143306539" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 13-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144280054" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="13" OPTIONID="13" OPTION_ALIAS="13-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144788939" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 13- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144908728" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="13" OPTIONID="13" OPTION_ALIAS="13-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144908715" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146184997" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 13- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146238059" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="13" OPTIONID="13" OPTION_ALIAS="13-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146241447" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146243214" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143314132" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 14-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144285000" BASECOST="-0.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144791152" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 14- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144921017" BASECOST="-0.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144921004" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146189432" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 14- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146222357" BASECOST="-0.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="14" OPTIONID="14" OPTION_ALIAS="14-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146225976" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146227583" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774143316149" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="21" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 15-" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144290342" BASECOST="-0.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="15" OPTIONID="15" OPTION_ALIAS="15-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774144793614" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="22" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 15- Jamming" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774144932019" BASECOST="-0.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="15" OPTIONID="15" OPTION_ALIAS="15-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774144932006" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                            <SKILL XMLID="ACROBATICS" ID="1774146194130" BASECOST="3.0" LEVELS="20" ALIAS="Acrobatics" POSITION="23" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Acrobatics Activation 15- Jamming Burnout" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1774146196278" BASECOST="-0.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="15" OPTIONID="15" OPTION_ALIAS="15-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="JAMMED" ID="1774146203457" BASECOST="-0.5" LEVELS="0" ALIAS="Jammed" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BURNOUT" ID="1774146204904" BASECOST="0.25" LEVELS="0" ALIAS="Burnout" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </SKILL>
                        </SKILLS>
                        <PERKS />
                        <TALENTS />
                        <MARTIALARTS />
                        <POWERS>
                            <LIST XMLID="GENERIC_OBJECT" ID="1776049267635" BASECOST="0.0" LEVELS="0" ALIAS="Sectional Defense" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                            <NOTES />
                            </LIST>
                            <POWER XMLID="ARMOR" ID="1776048632952" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Short Vest (location 12-13)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776049506195" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 12-13" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776049476589" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Standard Vest (location 11-13)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776049529729" BASECOST="-1.5" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="9" OPTIONID="9" OPTION_ALIAS="9-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 11-13" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776049526341" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Cap, Long Vest (location 10-13)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776049539352" BASECOST="-1.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="10" OPTIONID="10" OPTION_ALIAS="10-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 10-13" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776049578213" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Helmet, Jacket (location 4-5,9-13)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776049684645" BASECOST="-1.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="11" OPTIONID="11" OPTION_ALIAS="11-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 4-5,9-13" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776049618870" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Full Coverage Helmet, Long Jacket, High Boots (location 3-5,9-14, 16-18)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776049620282" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="12" OPTIONID="12" OPTION_ALIAS="12-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 3-5,9-14, 16-18" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776049702240" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Full Coverage Helmet, Long Jacket, High Boots (locations 3-5,9-14, and 16-18)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776054990928" BASECOST="-0.75" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="12" OPTIONID="12" OPTION_ALIAS="12-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="location 3-5,9-14, and 16-18" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="ARMOR" ID="1776050235631" BASECOST="0.0" LEVELS="2" ALIAS="Armor" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776049267635" NAME="Weird Coverage (locations   3,5 ,9- 10,12, 14 -15, and 17 - 18)" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1">
                            <NOTES />
                            <MODIFIER XMLID="ACTIVATIONROLL" ID="1776055483709" BASECOST="-0.25" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="15" OPTIONID="15" OPTION_ALIAS="15-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations   3,5 ,9- 10,12, 14 -15, and 17 - 18" PRIVATE="No" FORCEALLOW="No">
                                <NOTES />
                            </MODIFIER>
                            </POWER>
                            <LIST XMLID="GENERIC_OBJECT" ID="1776821785016" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                <NOTES />
                            </LIST>
                            <LIST XMLID="GENERIC_OBJECT" ID="1776821806893" BASECOST="0.0" LEVELS="0" ALIAS="Invalid Sectional Defense Declarations" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                <NOTES />
                            </LIST>
                            <POWER XMLID="FORCEFIELD" ID="1776821287228" BASECOST="0.0" LEVELS="4" ALIAS="Force Field" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776821806893" NAME="Sectional Defense with Invalid Declaration Words" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1" MDLEVELS="1" POWDLEVELS="1">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1776821901336" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locationss 8-12, invalid, 18" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="FORCEFIELD" ID="1776822881085" BASECOST="0.0" LEVELS="4" ALIAS="Force Field" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776821806893" NAME="Sectional Defense with Invalid Declaration Words 2" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1" MDLEVELS="1" POWDLEVELS="1">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1776822884488" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations 8-12, invalid, 18" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="FORCEFIELD" ID="1776821418500" BASECOST="0.0" LEVELS="4" ALIAS="Force Field" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776821806893" NAME="Sectional Defense with Invalid Declaration Invalid Hit Locations" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1" MDLEVELS="1" POWDLEVELS="1">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1776821972799" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations 19-34" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="FLASH" ID="1776821547972" BASECOST="0.0" LEVELS="1" ALIAS="Flash" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HEARINGGROUP" OPTIONID="HEARINGGROUP" OPTION_ALIAS="Hearing Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776821806893" NAME="Sectional Declaration For Non Defense" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1776907624818" BASECOST="-1.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="11" OPTIONID="11" OPTION_ALIAS="11-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations 8-12" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="FORCEFIELD" ID="1776907290823" BASECOST="0.0" LEVELS="4" ALIAS="Force Field" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776821806893" NAME="Sectional Defense with Incorrect Probability" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="1" MDLEVELS="1" POWDLEVELS="1">
                            <NOTES />
                                <MODIFIER XMLID="ACTIVATIONROLL" ID="1776907293178" BASECOST="-2.0" LEVELS="0" ALIAS="Activation Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="8" OPTIONID="8" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="locations 8-12, 14-16, 18" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                        </POWERS>                        
                        <DISADVANTAGES />
                        <EQUIPMENT />
                        </CHARACTER>
                        `;
                    let actor;

                    let acrobaticsActivation8Less;
                    let acrobaticsActivation9Less;
                    let acrobaticsActivation10Less;
                    let acrobaticsActivation11Less;
                    let acrobaticsActivation12Less;
                    let acrobaticsActivation13Less;
                    let acrobaticsActivation14Less;
                    let acrobaticsActivation15Less;

                    let acrobaticsActivation8LessJamming;
                    let acrobaticsActivation9LessJamming;
                    let acrobaticsActivation10LessJamming;
                    let acrobaticsActivation11LessJamming;
                    let acrobaticsActivation12LessJamming;
                    let acrobaticsActivation13LessJamming;
                    let acrobaticsActivation14LessJamming;
                    let acrobaticsActivation15LessJamming;

                    let acrobaticsActivation8LessJammingBurnout;
                    let acrobaticsActivation9LessJammingBurnout;
                    let acrobaticsActivation10LessJammingBurnout;
                    let acrobaticsActivation11LessJammingBurnout;
                    let acrobaticsActivation12LessJammingBurnout;
                    let acrobaticsActivation13LessJammingBurnout;
                    let acrobaticsActivation14LessJammingBurnout;
                    let acrobaticsActivation15LessJammingBurnout;

                    let sectionalArmorShortVest;
                    let sectionalArmorStandardVest;
                    let sectionalArmorCapLongVest;
                    let sectionalArmorHelmetJacket;
                    let sectionalArmorFullCoverageHelmetVestHighBoots;
                    let sectionalArmorFullCoverageHelmetVestAndHighBoots;
                    let sectionalArmorWeirdCoverage;

                    let sectionalArmorInvalidDeclarationWords;
                    let sectionalArmorInvalidDeclarationWordsTwo;
                    let sectionalArmorInvalidDeclarationInvalidHitLocations;
                    let sectionalDeclarationInFlash;
                    let sectionalArmorInvalidDeclarationInvalidProbability;

                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: true });

                        acrobaticsActivation8Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 8-",
                        );
                        acrobaticsActivation9Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 9-",
                        );
                        acrobaticsActivation10Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 10-",
                        );
                        acrobaticsActivation11Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 11-",
                        );
                        acrobaticsActivation12Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 12-",
                        );
                        acrobaticsActivation13Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 13-",
                        );
                        acrobaticsActivation14Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 14-",
                        );
                        acrobaticsActivation15Less = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 15-",
                        );

                        acrobaticsActivation8LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 8- Jamming",
                        );
                        acrobaticsActivation9LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 9- Jamming",
                        );
                        acrobaticsActivation10LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 10- Jamming",
                        );
                        acrobaticsActivation11LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 11- Jamming",
                        );
                        acrobaticsActivation12LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 12- Jamming",
                        );
                        acrobaticsActivation13LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 13- Jamming",
                        );
                        acrobaticsActivation14LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 14- Jamming",
                        );
                        acrobaticsActivation15LessJamming = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 15- Jamming",
                        );

                        acrobaticsActivation8LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 8- Jamming Burnout",
                        );
                        acrobaticsActivation9LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 9- Jamming Burnout",
                        );
                        acrobaticsActivation10LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 10- Jamming Burnout",
                        );
                        acrobaticsActivation11LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 11- Jamming Burnout",
                        );
                        acrobaticsActivation12LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 12- Jamming Burnout",
                        );
                        acrobaticsActivation13LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 13- Jamming Burnout",
                        );
                        acrobaticsActivation14LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 14- Jamming Burnout",
                        );
                        acrobaticsActivation15LessJammingBurnout = actor.items.find(
                            (item) => item.name === "Acrobatics Activation 15- Jamming Burnout",
                        );

                        sectionalArmorShortVest = actor.items.find(
                            (item) => item.name === "Short Vest (location 12-13)",
                        );
                        sectionalArmorStandardVest = actor.items.find(
                            (item) => item.name === "Standard Vest (location 11-13)",
                        );
                        sectionalArmorCapLongVest = actor.items.find(
                            (item) => item.name === "Cap, Long Vest (location 10-13)",
                        );
                        sectionalArmorHelmetJacket = actor.items.find(
                            (item) => item.name === "Helmet, Jacket (location 4-5,9-13)",
                        );
                        sectionalArmorFullCoverageHelmetVestHighBoots = actor.items.find(
                            (item) =>
                                item.name ===
                                "Full Coverage Helmet, Long Jacket, High Boots (location 3-5,9-14, 16-18)",
                        );
                        sectionalArmorFullCoverageHelmetVestAndHighBoots = actor.items.find(
                            (item) =>
                                item.name ===
                                "Full Coverage Helmet, Long Jacket, High Boots (locations 3-5,9-14, and 16-18)",
                        );
                        sectionalArmorWeirdCoverage = actor.items.find(
                            (item) => item.name === "Weird Coverage (locations   3,5 ,9- 10,12, 14 -15, and 17 - 18)",
                        );

                        sectionalArmorInvalidDeclarationWords = actor.items.find(
                            (item) => item.name === "Sectional Defense with Invalid Declaration Words",
                        );
                        sectionalArmorInvalidDeclarationWordsTwo = actor.items.find(
                            (item) => item.name === "Sectional Defense with Invalid Declaration Words 2",
                        );
                        sectionalArmorInvalidDeclarationInvalidHitLocations = actor.items.find(
                            (item) => item.name === "Sectional Defense with Invalid Declaration Invalid Hit Locations",
                        );
                        sectionalDeclarationInFlash = actor.items.find(
                            (item) => item.name === "Sectional Declaration For Non Defense",
                        );
                        sectionalArmorInvalidDeclarationInvalidProbability = actor.items.find(
                            (item) => item.name === "Sectional Defense with Incorrect Probability",
                        );
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("cost", function () {
                        describe("acrobatics with activation roll", function () {
                            it("should have correct cost activation 8-", function () {
                                expect(acrobaticsActivation8Less.realCost).to.equal(14);
                            });

                            it("should have correct cost activation 9-", function () {
                                expect(acrobaticsActivation9Less.realCost).to.equal(17);
                            });

                            it("should have correct cost activation 10-", function () {
                                expect(acrobaticsActivation10Less.realCost).to.equal(19);
                            });

                            it("should have correct cost activation 11-", function () {
                                expect(acrobaticsActivation11Less.realCost).to.equal(21);
                            });

                            it("should have correct cost activation 12-", function () {
                                expect(acrobaticsActivation12Less.realCost).to.equal(24);
                            });

                            it("should have correct cost activation 13-", function () {
                                expect(acrobaticsActivation13Less.realCost).to.equal(24);
                            });

                            it("should have correct cost activation 14-", function () {
                                expect(acrobaticsActivation14Less.realCost).to.equal(29);
                            });

                            it("should have correct cost activation 15-", function () {
                                expect(acrobaticsActivation15Less.realCost).to.equal(34);
                            });
                        });

                        describe("acrobatics with activation roll jamming", function () {
                            it("should have correct cost activation 8- Jamming", function () {
                                expect(acrobaticsActivation8LessJamming.realCost).to.equal(12);
                            });

                            it("should have correct cost activation 9- Jamming", function () {
                                expect(acrobaticsActivation9LessJamming.realCost).to.equal(14);
                            });

                            it("should have correct cost activation 10- Jamming", function () {
                                expect(acrobaticsActivation10LessJamming.realCost).to.equal(16);
                            });

                            it("should have correct cost activation 11- Jamming", function () {
                                expect(acrobaticsActivation11LessJamming.realCost).to.equal(17);
                            });

                            it("should have correct cost activation 12- Jamming", function () {
                                expect(acrobaticsActivation12LessJamming.realCost).to.equal(19);
                            });

                            it("should have correct cost activation 13- Jamming", function () {
                                expect(acrobaticsActivation13LessJamming.realCost).to.equal(19);
                            });

                            it("should have correct cost activation 14- Jamming", function () {
                                expect(acrobaticsActivation14LessJamming.realCost).to.equal(21);
                            });

                            it("should have correct cost activation 15- Jamming", function () {
                                expect(acrobaticsActivation15LessJamming.realCost).to.equal(24);
                            });
                        });

                        describe("acrobatics with activation roll jamming burnout", function () {
                            it("should have correct cost activation 8- Jamming Burnout", function () {
                                expect(acrobaticsActivation8LessJammingBurnout.realCost).to.equal(14);
                            });

                            it("should have correct cost activation 9- Jamming Burnout", function () {
                                expect(acrobaticsActivation9LessJammingBurnout.realCost).to.equal(16);
                            });

                            it("should have correct cost activation 10- Jamming Burnout", function () {
                                expect(acrobaticsActivation10LessJammingBurnout.realCost).to.equal(17);
                            });

                            it("should have correct cost activation 11- Jamming Burnout", function () {
                                expect(acrobaticsActivation11LessJammingBurnout.realCost).to.equal(19);
                            });

                            it("should have correct cost activation 12- Jamming Burnout", function () {
                                expect(acrobaticsActivation12LessJammingBurnout.realCost).to.equal(21);
                            });

                            it("should have correct cost activation 13- Jamming Burnout", function () {
                                expect(acrobaticsActivation13LessJammingBurnout.realCost).to.equal(21);
                            });

                            it("should have correct cost activation 14- Jamming Burnout", function () {
                                expect(acrobaticsActivation14LessJammingBurnout.realCost).to.equal(24);
                            });

                            it("should have correct cost activation 15- Jamming Burnout", function () {
                                expect(acrobaticsActivation15LessJammingBurnout.realCost).to.equal(29);
                            });
                        });
                    });

                    describe("basic activation roll", function () {
                        describe("Acrobatics 8- activates correctly", function () {
                            it("should not activate 8- with a roll of a 9", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation8Less, Roll9On3Dice),
                                ).to.equal(false);
                            });

                            it("should activate 8- with a roll of a 8", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation8Less, Roll8On3Dice),
                                ).to.equal(true);
                            });

                            it("should activate 8- with a roll of a 7", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation8Less, Roll7On3Dice),
                                ).to.equal(true);
                            });

                            it("should activate 8- with a roll of a 3", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation8Less, Roll3On3Dice),
                                ).to.equal(true);
                            });
                        });

                        describe("Acrobatics 12- activates correctly", function () {
                            it("should not activate 12- with a roll of a 13", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation12Less, Roll13On3Dice),
                                ).to.equal(false);
                            });

                            it("should activate 12- with a roll of a 12", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(acrobaticsActivation12Less, Roll12On3Dice),
                                ).to.equal(true);
                            });
                        });
                    });

                    describe("sectional activation roll with hit locations active", function () {
                        let defaultHitLocationsEnabled;

                        before(async function () {
                            defaultHitLocationsEnabled = await getAndSetGameSetting("hit locations", true);
                        });

                        after(async function () {
                            await getAndSetGameSetting("DoubleDamageLimit", defaultHitLocationsEnabled);
                        });

                        describe("simple 1 range sectional activation roll (12-13) (equivalent of 8-)", function () {
                            it("should not auto success activate with a hit location 3", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, HeroRoll, {
                                        hitLocationNum: 3,
                                    }),
                                ).to.equal(false);
                            });

                            it("should not activate with a hit location of 11", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, HeroRoll, {
                                        hitLocationNum: 11,
                                    }),
                                ).to.equal(false);
                            });

                            it("should activate with a hit location of 12", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, HeroRoll, {
                                        hitLocationNum: 12,
                                    }),
                                ).to.equal(true);
                            });

                            it("should activate with a hit location of 13", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, HeroRoll, {
                                        hitLocationNum: 13,
                                    }),
                                ).to.equal(true);
                            });

                            it("should not activate with a hit location of 14", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, HeroRoll, {
                                        hitLocationNum: 14,
                                    }),
                                ).to.equal(false);
                            });
                        });

                        describe("simple 1 range sectional activation roll (11-13) (equivalent of 9-)", function () {
                            it("should not activate with a hit location of 10", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, HeroRoll, {
                                        hitLocationNum: 10,
                                    }),
                                ).to.equal(false);
                            });

                            it("should activate with a hit location of 11", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, HeroRoll, {
                                        hitLocationNum: 11,
                                    }),
                                ).to.equal(true);
                            });

                            it("should activate with a hit location of 13", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, HeroRoll, {
                                        hitLocationNum: 13,
                                    }),
                                ).to.equal(true);
                            });

                            it("should not activate with a hit location of 14", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, HeroRoll, {
                                        hitLocationNum: 14,
                                    }),
                                ).to.equal(false);
                            });
                        });

                        describe("simple 1 range sectional activation roll (10-13) (equivalent of 10-)", function () {
                            it("should not activate with a hit location of 9", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorCapLongVest, HeroRoll, {
                                        hitLocationNum: 9,
                                    }),
                                ).to.equal(false);
                            });

                            it("should activate with a hit location of 10", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorCapLongVest, HeroRoll, {
                                        hitLocationNum: 10,
                                    }),
                                ).to.equal(true);
                            });

                            it("should activate with a hit location of 13", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorCapLongVest, HeroRoll, {
                                        hitLocationNum: 13,
                                    }),
                                ).to.equal(true);
                            });

                            it("should not activate with a hit location of 14", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorCapLongVest, HeroRoll, {
                                        hitLocationNum: 14,
                                    }),
                                ).to.equal(false);
                            });
                        });

                        describe("2 range sectional activation roll (4-5, 9-13) (equivalent of 12-)", function () {
                            describe("first range 4-5", function () {
                                it("should not activate with a hit location of 3", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 3,
                                        }),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 4", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 4,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 5", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 5,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 6", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 6,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("second range 9-13", function () {
                                it("should not activate with a hit location of 8", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 8,
                                        }),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 9", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 9,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 13", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 13,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 14", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorHelmetJacket, HeroRoll, {
                                            hitLocationNum: 14,
                                        }),
                                    ).to.equal(false);
                                });
                            });
                        });

                        describe("3 range sectional activation roll (3-5,9-14,16-18) (equivalent of 12-)", function () {
                            describe("first range 3-5", function () {
                                it("should not activate with a hit location of 2", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 2 },
                                        ),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 4", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 4 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 5", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 5 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 6", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 6 },
                                        ),
                                    ).to.equal(false);
                                });
                            });

                            describe("second range 9-14", function () {
                                it("should not activate with a hit location of 8", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 8 },
                                        ),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 9", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 9 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 14", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 14 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 15", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 15 },
                                        ),
                                    ).to.equal(false);
                                });
                            });

                            describe("third range 16-18", function () {
                                it("should activate with a hit location of 16", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 16 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 18", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 18 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 19", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 19 },
                                        ),
                                    ).to.equal(true);
                                });
                            });
                        });

                        describe("3 range sectional activation roll (3-5,9-14, and 16-18) (equivalent of 12-)", function () {
                            describe("first range 3-5", function () {
                                it("should not activate with a hit location of 2", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 2 },
                                        ),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 3", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 3 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 5", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 5 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 6", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 6 },
                                        ),
                                    ).to.equal(false);
                                });
                            });

                            describe("second range 9-14", function () {
                                it("should not activate with a hit location of 8", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 8 },
                                        ),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 9", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 9 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 14", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 14 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 15", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 15 },
                                        ),
                                    ).to.equal(false);
                                });
                            });

                            describe("third range 16-18", function () {
                                it("should activate with a hit location of 16", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 16 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 18", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 18 },
                                        ),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 19", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(
                                            sectionalArmorFullCoverageHelmetVestAndHighBoots,
                                            HeroRoll,
                                            { hitLocationNum: 19 },
                                        ),
                                    ).to.equal(true);
                                });
                            });
                        });

                        describe("multi range sectional activation roll(3,5 ,9- 10,12, 14 -15, and 17 - 18) (equivalent of >= 15-)", function () {
                            describe("first range 3", function () {
                                it("should not activate with a hit location of 2", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 2,
                                        }),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 3", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 3,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 4", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 4,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("second range 5", function () {
                                it("should activate with a hit location of 5", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 5,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 6", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 6,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("third range 9-10", function () {
                                it("should not activate with a hit location of 8", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 8,
                                        }),
                                    ).to.equal(false);
                                });

                                it("should activate with a hit location of 9", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 9,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 10", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 10,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 11", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 11,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("fourth range 12", function () {
                                it("should activate with a hit location of 12", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 12,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 13", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 13,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("fifth range 14 -15", function () {
                                it("should activate with a hit location of 14", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 14,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 15", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 15,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should not activate with a hit location of 16", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 16,
                                        }),
                                    ).to.equal(false);
                                });
                            });

                            describe("sixth range 17 - 18", function () {
                                it("should activate with a hit location of 17", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 17,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 18", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 18,
                                        }),
                                    ).to.equal(true);
                                });

                                it("should activate with a hit location of 19", async function () {
                                    expect(
                                        await isActivatedForThisUse_TestingOnly(sectionalArmorWeirdCoverage, HeroRoll, {
                                            hitLocationNum: 19,
                                        }),
                                    ).to.equal(true);
                                });
                            });
                        });
                    });

                    describe("sectional activation roll with hit locations not active", function () {
                        let defaultHitLocationsEnabled;

                        before(async function () {
                            defaultHitLocationsEnabled = await getAndSetGameSetting("hit locations", false);
                        });

                        after(async function () {
                            await getAndSetGameSetting("DoubleDamageLimit", defaultHitLocationsEnabled);
                        });

                        describe("simple 1 range sectional activation roll (12-13) (equivalent of 8-)", function () {
                            it("should not activate with a hit location of 12 if rolling an 9 for activation", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, Roll9On3Dice, {
                                        hitLocationNum: 12,
                                    }),
                                ).to.equal(false);
                            });

                            it("should activate with a hit location of 12 if rolling a 6 for activation", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorShortVest, Roll6On3Dice, {
                                        hitLocationNum: 12,
                                    }),
                                ).to.equal(true);
                            });
                        });

                        describe("simple 1 range sectional activation roll (11-13) (equivalent of 9-)", function () {
                            it("should not activate with a hit location of 11 if rolling an 10 for activation", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, Roll10On3Dice, {
                                        hitLocationNum: 11,
                                    }),
                                ).to.equal(false);
                            });

                            it("should activate with a hit location of 12 if rolling a 6 for activation", async function () {
                                expect(
                                    await isActivatedForThisUse_TestingOnly(sectionalArmorStandardVest, Roll9On3Dice, {
                                        hitLocationNum: 11,
                                    }),
                                ).to.equal(true);
                            });
                        });
                    });

                    describe("Activation rolls with sectional defenses have hero validations", function () {
                        it("should recognize a valid section defense declaration", function () {
                            expect(sectionalArmorShortVest.heroValidation).to.have.deep.members([]);
                        });

                        // We can't distinguish between an invalid sectional defense location and a regular comment
                        it("should recognize an invalid section defense declaration (words - locationss)", function () {
                            expect(sectionalArmorInvalidDeclarationWords.heroValidation).to.have.deep.members([]);
                        });

                        it("should recognize an invalid section defense declaration (words - invalid)", function () {
                            const heroValidation = sectionalArmorInvalidDeclarationWordsTwo.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should recognize an invalid section defense declaration (invalid hit locations)", function () {
                            const heroValidation = sectionalArmorInvalidDeclarationInvalidHitLocations.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should recognize an invalid section defense declaration (for non defense power)", function () {
                            const heroValidation = sectionalDeclarationInFlash.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should recognize an valid section defense declaration with incorrect probability calculation", function () {
                            const heroValidation = sectionalArmorInvalidDeclarationInvalidProbability.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.WARNING);
                        });
                    });

                    describe.skip("Activation Roll - Jammed and Burnout", function () {
                        it("Handles burnout on failed activation roll", function () {
                            // Expected: Power is lost or disabled per Burnout rules
                        });

                        it("Handles jammed on failed activation roll", function () {
                            // Expected: Power is jammed and cannot be used until cleared
                        });

                        it("Succeeds when roll is equal to or less than activation number", function () {
                            // Expected: Standard Success/Failure Scenarios
                        });
                    });
                });

                describe("5e - requires a skill roll", function () {
                    const contents = `
                        <?xml version="1.0" encoding="UTF-16"?>
                        <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                        <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                        <CHARACTER_INFO CHARACTER_NAME="Test 5e Activation Roll" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                            <STR XMLID="STR" ID="1774142627887" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STR>
                            <DEX XMLID="DEX" ID="1774142627915" BASECOST="0.0" LEVELS="0" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </DEX>
                            <CON XMLID="CON" ID="1774142627900" BASECOST="0.0" LEVELS="0" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </CON>
                            <BODY XMLID="BODY" ID="1774142628378" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </BODY>
                            <INT XMLID="INT" ID="1774142628524" BASECOST="0.0" LEVELS="0" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </INT>
                            <EGO XMLID="EGO" ID="1774142628258" BASECOST="0.0" LEVELS="0" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </EGO>
                            <PRE XMLID="PRE" ID="1774142628046" BASECOST="0.0" LEVELS="0" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PRE>
                            <COM XMLID="COM" ID="1774142628559" BASECOST="0.0" LEVELS="0" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </COM>
                            <PD XMLID="PD" ID="1774142628390" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </PD>
                            <ED XMLID="ED" ID="1774142628238" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </ED>
                            <SPD XMLID="SPD" ID="1774142628459" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SPD>
                            <REC XMLID="REC" ID="1774142627846" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </REC>
                            <END XMLID="END" ID="1774142628189" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </END>
                            <STUN XMLID="STUN" ID="1774142627957" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </STUN>
                            <RUNNING XMLID="RUNNING" ID="1774142628084" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </RUNNING>
                            <SWIMMING XMLID="SWIMMING" ID="1774142627962" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </SWIMMING>
                            <LEAPING XMLID="LEAPING" ID="1774142628064" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            </LEAPING>
                        </CHARACTERISTICS>
                        <SKILLS>
                            <LIST XMLID="GENERIC_OBJECT" ID="1776635236344" BASECOST="0.0" LEVELS="0" ALIAS="Required For Requires A Skill Roll" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                            <NOTES />
                            </LIST>
                            <SKILL XMLID="ACROBATICS" ID="1776635035005" BASECOST="3.0" LEVELS="0" ALIAS="Acrobatics" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776635236344" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="BREAKFALL" ID="1776635038926" BASECOST="3.0" LEVELS="3" ALIAS="Breakfall" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776635236344" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                            <NOTES />
                            </SKILL>
                        </SKILLS>
                        <PERKS />
                        <TALENTS />
                        <MARTIALARTS />
                        <POWERS>
                            <LIST XMLID="GENERIC_OBJECT" ID="1776305288516" BASECOST="0.0" LEVELS="0" ALIAS="Requires A Skill Roll" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                            <NOTES />
                            </LIST>
                            <POWER XMLID="AID" ID="1776304663512" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall with no penalty based on AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305317602" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall">
                                <NOTES />
                                <ADDER XMLID="NOAPPENALTY" ID="1776305429510" BASECOST="0.5" LEVELS="0" ALIAS="No Active Point penalty to Skill Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                <NOTES />
                                </ADDER>
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305444625" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall with -1 per 20 AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                            <NOTES />
                            <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305479199" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall">
                                <NOTES />
                                <ADDER XMLID="MINUS1PER20" ID="1776305479186" BASECOST="0.25" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 20 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                <NOTES />
                                </ADDER>
                            </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305448133" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall with -1 per 10 AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305487551" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall">
                                    <NOTES />
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305450850" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall with -1 per 5 AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305511371" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall">
                                    <NOTES />
                                    <ADDER XMLID="MINUS1PER5" ID="1776305531280" BASECOST="-0.5" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 5 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305670855" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall with -1 per 5 AP with skill vs skill contest" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305673413" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall">
                                    <NOTES />
                                    <ADDER XMLID="MINUS1PER5" ID="1776305689600" BASECOST="-0.5" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 5 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="SKILLVSSKILL" ID="1776305693377" BASECOST="-0.25" LEVELS="0" ALIAS="RSR Skill is subject to Skill vs. Skill contests" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305556832" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall or Acrobatics with -1 per 10 AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776305655605" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A Breakfall or Acrobatics Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" ROLLALIAS="Breakfall or Acrobatics">
                                    <NOTES />
                                    <ADDER XMLID="VARIABLERSR" ID="1776305655592" BASECOST="0.25" LEVELS="0" ALIAS="Variable RSR" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776633750643" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Breakfall and Acrobatics with -1 per 20 AP" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776633754026" BASECOST="-0.75" LEVELS="0" ALIAS="Requires A Breakfall Roll And An Acrobatics Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOROLLS" OPTIONID="TWOROLLS" OPTION_ALIAS="Two RSRs on same Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="0" TYPE2="0" ROLLALIAS="Breakfall" ROLLALIAS2="Acrobatics">
                                    <NOTES />
                                    <ADDER XMLID="MINUS1PER20" ID="1776633809340" BASECOST="0.25" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 20 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776305729982" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires 1 Luck" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776633665888" BASECOST="-1.0" LEVELS="0" ALIAS="Requires A Luck Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ONELUCK" OPTIONID="ONELUCK" OPTION_ALIAS="One level of Luck required" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="NOAPPENALTY" ID="1776633679812" BASECOST="0.5" LEVELS="0" ALIAS="No Active Point penalty to Skill Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776634671679" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires 2 Luck" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776634675562" BASECOST="-1.5" LEVELS="0" ALIAS="Requires Two Levels of Luck" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOLUCK" OPTIONID="TWOLUCK" OPTION_ALIAS="Two levels of Luck required" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="NOAPPENALTY" ID="1776634675549" BASECOST="0.5" LEVELS="0" ALIAS="No Active Point penalty to Skill Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776634667853" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires 3 Luck" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776634686773" BASECOST="-2.0" LEVELS="0" ALIAS="Requires Three Levels of Luck" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="THREELUCK" OPTIONID="THREELUCK" OPTION_ALIAS="Three levels of Luck required" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                    <NOTES />
                                    <ADDER XMLID="NOAPPENALTY" ID="1776634686760" BASECOST="0.5" LEVELS="0" ALIAS="No Active Point penalty to Skill Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776733414418" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires KS: sandwiches and KS: potato chips with no penalty based on AP" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776734381825" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A KS: sandwiches Roll And A KS: potato chips Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOROLLS" OPTIONID="TWOROLLS" OPTION_ALIAS="Two RSRs on same Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="1" TYPE2="1" ROLLALIAS="KS: sandwiches" ROLLALIAS2="KS: potato chips">
                                    <NOTES />
                                    <ADDER XMLID="NOAPPENALTY" ID="1776734383328" BASECOST="0.5" LEVELS="0" ALIAS="No Active Point penalty to Skill Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776734031307" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires KS: sandwiches and KS: potato chips with -1 per 5 AP" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776734034466" BASECOST="-0.5" LEVELS="0" ALIAS="Requires A KS: sandwiches Roll And A KS: potato chips Roll" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOROLLS" OPTIONID="TWOROLLS" OPTION_ALIAS="Two RSRs on same Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="1" TYPE2="1" ROLLALIAS="KS: sandwiches" ROLLALIAS2="KS: potato chips">
                                    <NOTES />
                                    <ADDER XMLID="MINUS1PER5" ID="1776734054481" BASECOST="-0.5" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 5 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                            <POWER XMLID="AID" ID="1776735639686" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1776305288516" NAME="Requires Perception with -1 per 5 AP" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                <MODIFIER XMLID="REQUIRESASKILLROLL" ID="1776735643094" BASECOST="-1.0" LEVELS="0" ALIAS="Requires A PER Roll " POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASICRSR" OPTIONID="BASICRSR" OPTION_ALIAS="Basic RSR" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No" TYPE="3" ROLLALIAS="PER">
                                    <NOTES />
                                    <ADDER XMLID="MINUS1PER5" ID="1776735679382" BASECOST="-0.5" LEVELS="0" ALIAS="Active Point penalty to Skill Roll is -1 per 5 Active Points" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                    <NOTES />
                                    </ADDER>
                                </MODIFIER>
                            </POWER>
                        </POWERS>
                        <DISADVANTAGES />
                        <EQUIPMENT />
                        </CHARACTER>
                    `;
                    let actor;

                    let aidRequiresBreakfallWithNoApPenalty;
                    let aidRequiresBreakfallWith1Per20ApPenalty;
                    let aidRequiresBreakfallWith1Per10ApPenalty;
                    let aidRequiresBreakfallWith1Per5ApPenalty;
                    let aidRequiresBreakfallWith1Per5ApPenaltySkillVsSkillContest;
                    let aidRequiresBreakfallOrAcrobaticsWith1Per10ApPenalty;
                    let aidRequiresBreakfallAndAcrobaticsWith1Per20ApPenalty;
                    let aidRequires1Luck;
                    let aidRequires2Luck;
                    let aidRequires3Luck;
                    let aidRequiresKsSandwichesAndKsPotatoChipsWithNoApPenalty;
                    let aidRequiresKsSandwichesAndKsPotatoChipsWith1Per5ApPenalty;
                    let aidRequiresPerceptionWith1Per5ApPenalty;

                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: true });

                        aidRequiresBreakfallWithNoApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall with no penalty based on AP",
                        );
                        aidRequiresBreakfallWith1Per20ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall with -1 per 20 AP",
                        );
                        aidRequiresBreakfallWith1Per10ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall with -1 per 10 AP",
                        );
                        aidRequiresBreakfallWith1Per5ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall with -1 per 5 AP",
                        );
                        aidRequiresBreakfallWith1Per5ApPenaltySkillVsSkillContest = actor.items.find(
                            (item) => item.name === "Requires Breakfall with -1 per 5 AP with skill vs skill contest",
                        );
                        aidRequiresBreakfallOrAcrobaticsWith1Per10ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall or Acrobatics with -1 per 10 AP",
                        );
                        aidRequiresBreakfallAndAcrobaticsWith1Per20ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Breakfall and Acrobatics with -1 per 20 AP",
                        );
                        aidRequires1Luck = actor.items.find((item) => item.name === "Requires 1 Luck");
                        aidRequires2Luck = actor.items.find((item) => item.name === "Requires 2 Luck");
                        aidRequires3Luck = actor.items.find((item) => item.name === "Requires 3 Luck");
                        aidRequiresKsSandwichesAndKsPotatoChipsWithNoApPenalty = actor.items.find(
                            (item) =>
                                item.name ===
                                "Requires KS: sandwiches and KS: potato chips with no penalty based on AP",
                        );
                        aidRequiresKsSandwichesAndKsPotatoChipsWith1Per5ApPenalty = actor.items.find(
                            (item) => item.name === "Requires KS: sandwiches and KS: potato chips with -1 per 5 AP",
                        );
                        aidRequiresPerceptionWith1Per5ApPenalty = actor.items.find(
                            (item) => item.name === "Requires Perception with -1 per 5 AP",
                        );
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("RSR costs in all the various flavours", function () {
                        it("should have the correct cost for a 3/2 skill with no penalty based on AP", function () {
                            expect(aidRequiresBreakfallWithNoApPenalty.realCost).to.equal(10);
                        });

                        it("should have the correct cost for a 3/2 skill with -1 per 20 AP", function () {
                            expect(aidRequiresBreakfallWith1Per20ApPenalty.realCost).to.equal(8);
                        });

                        it("should have the correct cost for a 3/2 skill with -1 per 10 AP", function () {
                            expect(aidRequiresBreakfallWith1Per10ApPenalty.realCost).to.equal(7);
                        });

                        it("should have the correct cost for a 3/2 skill with -1 per 5 AP", function () {
                            expect(aidRequiresBreakfallWith1Per5ApPenalty.realCost).to.equal(5);
                        });

                        it("should have the correct cost for a 3/2 skill with -1 per 5 AP used in a skill vs skill context", function () {
                            expect(aidRequiresBreakfallWith1Per5ApPenaltySkillVsSkillContest.realCost).to.equal(4);
                        });

                        it("should have the correct cost for the choice between 2 x 3/2 skill with -1 per 10 AP", function () {
                            expect(aidRequiresBreakfallOrAcrobaticsWith1Per10ApPenalty.realCost).to.equal(8);
                        });

                        it("should have the correct cost for 2 x 3/2 skill with -1 per 20 AP", function () {
                            expect(aidRequiresBreakfallAndAcrobaticsWith1Per20ApPenalty.realCost).to.equal(7);
                        });

                        it("should have the correct cost for a 1 luck roll with no penalty based on AP", function () {
                            expect(aidRequires1Luck.realCost).to.equal(7);
                        });

                        it("should have the correct cost for a 2 luck roll with no penalty based on AP", function () {
                            expect(aidRequires2Luck.realCost).to.equal(5);
                        });

                        it("should have the correct cost for a 3 luck roll with no penalty based on AP", function () {
                            expect(aidRequires3Luck.realCost).to.equal(4);
                        });

                        it("should have the correct cost for 2 x background skills with no penalty based on AP", function () {
                            expect(aidRequiresKsSandwichesAndKsPotatoChipsWithNoApPenalty.realCost).to.equal(10);
                        });

                        it("should have the correct cost for 2 x background skills with -1 per 5 AP", function () {
                            expect(aidRequiresKsSandwichesAndKsPotatoChipsWith1Per5ApPenalty.realCost).to.equal(5);
                        });

                        it("should have the correct cost for perception with -1 per 5 AP", function () {
                            expect(aidRequiresPerceptionWith1Per5ApPenalty.realCost).to.equal(4);
                        });
                    });

                    describe.skip("RSRs have hero validations", function () {
                        it("should have no heroValidation concerns as the character do have listed inante skill (success)", function () {
                            const heroValidation = aidRequiresPerceptionWith1Per5ApPenalty.heroValidation;
                            expect(heroValidation).to.have.deep.members([]);
                        });

                        it("should have no heroValidation concerns as the character do have listed background skills (success)", function () {
                            const heroValidation =
                                aidRequiresKsSandwichesAndKsPotatoChipsWith1Per5ApPenalty.heroValidation;
                            expect(heroValidation).to.have.deep.members([]);
                        });

                        it("should have a heroValidation error as the character does not have listed luck power (error)", function () {
                            const heroValidation = aidRequires2Luck.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should have a heroValidation error as the character does not have listed background skill (error)", function () {
                            const heroValidation = xxx.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should have a heroValidation error as the character does not have listed skill (error)", function () {
                            const heroValidation = xxx.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should have a heroValidation error as the character does not have one of the listed variable skills (error)", function () {
                            const heroValidation = xxx.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should have a heroValidation error as the character does not have one of the 2 listed skills (error)", function () {
                            const heroValidation = xxx.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        it("should have a heroValidation error as the character does not have either of the 2 listed skills (error)", function () {
                            const heroValidation = xxx.heroValidation;
                            expect(heroValidation.length).to.equal(1);
                            expect(heroValidation[0]).to.have.property("severity");
                            expect(heroValidation[0].severity).to.equal(CONFIG.HERO.VALIDATION_SEVERITY.ERROR);
                        });

                        // TODO: the character does not have listed characteristic (vehicle for instance?) (error)
                        // TODO: the character does not have listed perception (vehicle for instance?) (error)
                        // TODO: the character does not have the listed movement type (error)
                        // TODO: the character does not have luck for a luck skill (error)
                        // TODO: the character does have luck for a luck skill (success)
                        // TODO: the character with luck skill roll has no penalty per AP (warning as GM will have to arbitrate)
                    });

                    describe.skip("works with skill that actor has", function () {
                        describe("RSR with skill and no penalty based on active points", function () {});

                        describe("RSR with skill and various penalty levels based on active points", function () {});
                    });

                    describe.skip("RSR with skill that doesn't exist", function () {});

                    describe.skip("RSR with CSL", function () {});

                    describe.skip("RSR with 2 skill rolls", function () {});

                    describe.skip("RSR with skill vs skill contest", function () {});

                    describe.skip("RSR with luck rolls", function () {});
                });

                describe("isActivatedForThisUse", function () {
                    describe("6e", function () {
                        const contents = `
                            <?xml version="1.0" encoding="UTF-16"?>
                            <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                            <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                            <CHARACTER_INFO CHARACTER_NAME="Test RaR Actor" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                                <STR XMLID="STR" ID="1683328673465" BASECOST="0.0" LEVELS="10" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </STR>
                                <DEX XMLID="DEX" ID="1683328012642" BASECOST="0.0" LEVELS="12" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </DEX>
                                <CON XMLID="CON" ID="1683331008620" BASECOST="0.0" LEVELS="13" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </CON>
                                <BODY XMLID="BODY" ID="1683328674200" BASECOST="0.0" LEVELS="14" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </BODY>
                                <INT XMLID="INT" ID="1683328673466" BASECOST="0.0" LEVELS="15" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </INT>
                                <EGO XMLID="EGO" ID="1683328673467" BASECOST="0.0" LEVELS="16" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </EGO>
                                <PRE XMLID="PRE" ID="1683328673468" BASECOST="0.0" LEVELS="17" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </PRE>
                                <COM XMLID="COM" ID="1683328673469" BASECOST="0.0" LEVELS="18" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </COM>
                                <PD XMLID="PD" ID="1683328673470" BASECOST="0.0" LEVELS="5" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </PD>
                                <ED XMLID="ED" ID="1683328673471" BASECOST="0.0" LEVELS="5" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </ED>
                                <SPD XMLID="SPD" ID="1683328673472" BASECOST="0.0" LEVELS="3" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </SPD>
                                <REC XMLID="REC" ID="1683328673473" BASECOST="0.0" LEVELS="6" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </REC>
                                <END XMLID="END" ID="1683328673474" BASECOST="0.0" LEVELS="20" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </END>
                                <STUN XMLID="STUN" ID="1683328673475" BASECOST="0.0" LEVELS="25" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </STUN>
                            </CHARACTERISTICS>
                            <SKILLS>
                                <SKILL XMLID="ACROBATICS" ID="1683328673476" BASECOST="3.0" LEVELS="0" ALIAS="Acrobatics" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </SKILL>
                                <SKILL XMLID="STEALTH" ID="1683328673477" BASECOST="3.0" LEVELS="0" ALIAS="Stealth" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </SKILL>
                                <KNOWLEDGE_SKILL XMLID="KNOWLEDGE_SKILL" ID="1683328673478" BASECOST="2.0" LEVELS="0" ALIAS="KS: Magic" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                <NOTES />
                                </KNOWLEDGE_SKILL>
                            </SKILLS>
                            <PERKS />
                            <TALENTS />
                            <MARTIALARTS />
                            <POWERS />
                            <DISADVANTAGES />
                            <EQUIPMENT />
                            </CHARACTER>
                        `;
                        let actor;

                        before(async function () {
                            actor = await createQuenchActor({ quench, contents, is5e: false });
                        });

                        after(async function () {
                            await deleteQuenchActor(actor);
                        });
                    });
                });
            });
        },
        {
            displayName: "HERO: Requires Roll Check",
        },
    );
}
