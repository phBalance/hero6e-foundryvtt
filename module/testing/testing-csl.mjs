import { createQuenchActor, deleteQuenchActor } from "./quench-helper.mjs";

export function registerCslTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.item.csl",
        (context) => {
            const { after, before, describe, expect, it } = context;

            describe("Combat Skill Levels (CSL & SL)", function () {
                this.timeout(20000);

                describe("5e", async function () {
                    const contents = `
                            <?xml version="1.0" encoding="UTF-16"?>
                            <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                                <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                                <CHARACTER_INFO CHARACTER_NAME="5e TEST CSLs" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                                    <STR XMLID="STR" ID="1766530675632" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </STR>
                                    <DEX XMLID="DEX" ID="1766530675402" BASECOST="0.0" LEVELS="0" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </DEX>
                                    <CON XMLID="CON" ID="1766530675312" BASECOST="0.0" LEVELS="0" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </CON>
                                    <BODY XMLID="BODY" ID="1766530675632" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </BODY>
                                    <INT XMLID="INT" ID="1766530675225" BASECOST="0.0" LEVELS="0" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </INT>
                                    <EGO XMLID="EGO" ID="1766530676081" BASECOST="0.0" LEVELS="0" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </EGO>
                                    <PRE XMLID="PRE" ID="1766530675874" BASECOST="0.0" LEVELS="0" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </PRE>
                                    <COM XMLID="COM" ID="1766530675755" BASECOST="0.0" LEVELS="0" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </COM>
                                    <PD XMLID="PD" ID="1766530675297" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </PD>
                                    <ED XMLID="ED" ID="1766530675389" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </ED>
                                    <SPD XMLID="SPD" ID="1766530675628" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </SPD>
                                    <REC XMLID="REC" ID="1766530675552" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </REC>
                                    <END XMLID="END" ID="1766530676091" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </END>
                                    <STUN XMLID="STUN" ID="1766530675416" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </STUN>
                                    <RUNNING XMLID="RUNNING" ID="1766530675560" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </RUNNING>
                                    <SWIMMING XMLID="SWIMMING" ID="1766530675755" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </SWIMMING>
                                    <LEAPING XMLID="LEAPING" ID="1766530675894" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </LEAPING>
                                </CHARACTERISTICS>
                                <SKILLS>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1766531567248" BASECOST="0.0" LEVELS="0" ALIAS="CSLs" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530693138" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLESINGLE" OPTIONID="SINGLESINGLE" OPTION_ALIAS="with any single attack with one specific weapon" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Not Implemented Correctly" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635783050" BASECOST="0.0" LEVELS="0" ALIAS="Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530697066" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Single Attack Non Mental CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635575010" BASECOST="0.0" LEVELS="0" ALIAS="Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767635557299" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Single Attack Mental CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635719393" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Ego Attack" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530703345" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLESTRIKE" OPTIONID="SINGLESTRIKE" OPTION_ALIAS="with any single Strike" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Single Strike CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636190890" BASECOST="0.0" LEVELS="0" ALIAS="Basic Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530709609" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="STRIKE" OPTIONID="STRIKE" OPTION_ALIAS="with any Strike" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Any Strike CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                        <NOTES />
                                        <ADDER XMLID="GENERIC_OBJECT" ID="1767758766416" BASECOST="0.0" LEVELS="0" ALIAS="Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                            <NOTES />
                                        </ADDER>
                                        <ADDER XMLID="GENERIC_OBJECT" ID="1767758771944" BASECOST="0.0" LEVELS="0" ALIAS="Basic Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                            <NOTES />
                                        </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530718850" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with any three maneuvers or a tight group of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Multipower Tight Group of Attacks CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636341066" BASECOST="0.0" LEVELS="0" ALIAS="Drain Multipower" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767636338726" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with any three maneuvers or a tight group of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH Martial Arts Style List CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636389117" BASECOST="0.0" LEVELS="0" ALIAS="Hand-to-Hand Martial Maneuver Style" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530726521" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MARTIAL" OPTIONID="MARTIAL" OPTION_ALIAS="with Martial Maneuvers" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Martial Maneuvers CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES>Don't need to specify, but make sure it works when we do.</NOTES>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767655463020" BASECOST="0.0" LEVELS="0" ALIAS="Basic Shot" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530733513" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MAGIC" OPTIONID="MAGIC" OPTION_ALIAS="with Magic" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Magic Subset CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES>Users will have to specify what constitutes their subset of magic spell individually or using a multipower or list.</NOTES>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636690880" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Drain BODY" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636690881" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Drain STUN" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767636690882" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Ego Attack" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530739690" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BROAD" OPTIONID="BROAD" OPTION_ALIAS="with a broadly-defined category of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Multipower Broad CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767655690903" BASECOST="0.0" LEVELS="0" ALIAS="Mental Multipower" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530745617" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHDCV" OPTIONID="HTHDCV" OPTION_ALIAS="DCV with Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Ranged DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767760617589" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHDCV" OPTIONID="HTHDCV" OPTION_ALIAS="DCV with HTH Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530753770" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="DECV" OPTIONID="DECV" OPTION_ALIAS="DECV versus all Mental Powers and attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="DECV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530761961" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTH" OPTIONID="HTH" OPTION_ALIAS="with HTH Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530769146" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="with Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Ranged CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530776817" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MENTAL" OPTIONID="MENTAL" OPTION_ALIAS="with Mental Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Mental CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530785177" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="DCV" OPTIONID="DCV" OPTION_ALIAS="with DCV" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530791249" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOOCV" OPTIONID="TWOOCV" OPTION_ALIAS="OCV with HTH and Ranged" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Ranged OCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767655860133" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOOCV" OPTIONID="TWOOCV" OPTION_ALIAS="OCV with HTH and Mental" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Mental OCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767655863549" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOOCV" OPTIONID="TWOOCV" OPTION_ALIAS="OCV with Mental and Ranged" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Mental and Ranged OCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530802081" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWODCV" OPTIONID="TWODCV" OPTION_ALIAS="DCV with HTH and Ranged combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Ranged DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767655897333" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="21" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWODCV" OPTIONID="TWODCV" OPTION_ALIAS="DCV with HTH and Mental combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Mental DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767655898388" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="22" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWODCV" OPTIONID="TWODCV" OPTION_ALIAS="DCV with Ranged and Mental combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Ranged and Mental DCV CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530808010" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="23" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHRANGED" OPTIONID="HTHRANGED" OPTION_ALIAS="with HTH and Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Ranged CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530817810" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="24" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHMENTAL" OPTIONID="HTHMENTAL" OPTION_ALIAS="with HTH and Mental Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="HTH and Mental CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530826562" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="25" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MENTALRANGED" OPTIONID="MENTALRANGED" OPTION_ALIAS="with Mental and Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="Mental and Ranged CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1766530832753" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="26" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ALL" OPTIONID="ALL" OPTION_ALIAS="with All Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="All CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767656203782" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="27" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767656205625" BASECOST="0.0" LEVELS="0" ALIAS="SLs" POSITION="28" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="SKILL_LEVELS" ID="1766530843073" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="29" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="OVERALL" OPTIONID="OVERALL" OPTION_ALIAS="Overall" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767656205625" NAME="Overall SL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="SKILL_LEVELS" ID="1766596963832" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="30" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="NONCOMBAT" OPTIONID="NONCOMBAT" OPTION_ALIAS="with all non-combat Skills" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767656205625" NAME="Non Overall SL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767719435899" BASECOST="0.0" LEVELS="0" ALIAS="Intentionally Invalid CSLs" POSITION="32" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767719020911" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="33" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOOCV" OPTIONID="TWOOCV" OPTION_ALIAS="OCV with any two categories of combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767719435899" NAME="Didn't mention OCV with Mental, HTH, or Ranged" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767719058575" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="34" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWODCV" OPTIONID="TWODCV" OPTION_ALIAS="DCV with any two categories of combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767719435899" NAME="Didn't mention DCV with Mental, HTH, or Ranged" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                </SKILLS>
                                <PERKS />
                                <TALENTS />
                                <MARTIALARTS>
                                    <WEAPON_ELEMENT XMLID="WEAPON_ELEMENT" ID="1767636150232" BASECOST="0.0" LEVELS="0" ALIAS="Weapon Element for HTH and Ranged Styles" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    <ADDER XMLID="SMALLARMS" ID="1767636589538" BASECOST="0.0" LEVELS="0" ALIAS="Small Arms" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="NO">
                                        <NOTES />
                                        <ADDER XMLID="LMGS" ID="1767636589537" BASECOST="1.0" LEVELS="0" ALIAS="Assault Rifles/LMGs" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                        </ADDER>
                                    </ADDER>
                                    </WEAPON_ELEMENT>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767636555925" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767043211058" BASECOST="0.0" LEVELS="0" ALIAS="Hand-to-Hand Martial Maneuver Style" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042032601" BASECOST="3.0" LEVELS="0" ALIAS="Basic Strike" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043211058" NAME="" CATEGORY="Hand To Hand" DISPLAY="Basic Strike" OCV="+1" DCV="+0" DC="2" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="15" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042038858" BASECOST="4.0" LEVELS="0" ALIAS="Martial Strike" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043211058" NAME="" CATEGORY="Hand To Hand" DISPLAY="Martial Strike" OCV="+0" DCV="+2" DC="2" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="20" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042045252" BASECOST="5.0" LEVELS="0" ALIAS="Flying Dodge" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043211058" NAME="" CATEGORY="Hand To Hand" DISPLAY="Flying Dodge" OCV="--" DCV="+4" DC="0" PHASE="1/2" EFFECT="Dodge All Attacks, Abort; FMove" ADDSTR="No" ACTIVECOST="50" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No">
                                    <NOTES />
                                    </MANEUVER>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767043252990" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767043254187" BASECOST="0.0" LEVELS="0" ALIAS="Ranged Martial Maneuvers Style" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042069352" BASECOST="4.0" LEVELS="0" ALIAS="Basic Shot" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043254187" NAME="" CATEGORY="Ranged" DISPLAY="Basic Shot" OCV="+0" DCV="+0" DC="2" PHASE="1/2" EFFECT="Strike, [WEAPONDC]" ADDSTR="No" ACTIVECOST="16" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="2">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042072496" BASECOST="3.0" LEVELS="0" ALIAS="Defensive Shot" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043254187" NAME="" CATEGORY="Ranged" DISPLAY="Defensive Shot" OCV="-1" DCV="+2" DC="0" PHASE="1/2" EFFECT="Strike [WEAPONDC]" ADDSTR="No" ACTIVECOST="5" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="0">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767042077760" BASECOST="5.0" LEVELS="0" ALIAS="Offensive Ranged Disarm" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767043254187" NAME="" CATEGORY="Ranged" DISPLAY="Offensive Ranged Disarm" OCV="+1" DCV="-1" DC="2" PHASE="1/2" EFFECT="Disarm, [WEAPONDC] to Disarm" ADDSTR="No" ACTIVECOST="11" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="2">
                                    <NOTES />
                                    </MANEUVER>
                                </MARTIALARTS>
                                <POWERS>
                                    <MULTIPOWER XMLID="GENERIC_OBJECT" ID="1767635642968" BASECOST="15.0" LEVELS="0" ALIAS="Multipower" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Mental Multipower" QUANTITY="1">
                                        <NOTES />
                                    </MULTIPOWER>
                                    <POWER XMLID="EGOATTACK" ID="1766605962713" BASECOST="0.0" LEVELS="1" ALIAS="Ego Attack" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767635642968" ULTRA_SLOT="Yes" NAME="Single Target Ego Attack" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                        <NOTES />
                                    </POWER>
                                    <POWER XMLID="EGOATTACK" ID="1767658621697" BASECOST="0.0" LEVELS="0" ALIAS="Ego Attack" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767635642968" ULTRA_SLOT="Yes" NAME="AoE Ego Attack" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                        <NOTES />
                                        <ADDER XMLID="PLUSONEHALFDIE" ID="1767658640710" BASECOST="5.0" LEVELS="0" ALIAS="+1/2 d6" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="No" GROUP="No" SELECTED="YES">
                                            <NOTES />
                                        </ADDER>
                                        <MODIFIER XMLID="AOE" ID="1767658640736" BASECOST="0.5" LEVELS="0" ALIAS="Area Of Effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HEX" OPTIONID="HEX" OPTION_ALIAS="One Hex" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                            <NOTES />
                                        </MODIFIER>
                                    </POWER>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767635677110" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                        <NOTES />
                                    </LIST>
                                    <MULTIPOWER XMLID="GENERIC_OBJECT" ID="1767635680604" BASECOST="20.0" LEVELS="0" ALIAS="Multipower" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Drain Multipower" QUANTITY="1">
                                        <NOTES />
                                    </MULTIPOWER>
                                    <POWER XMLID="DRAIN" ID="1767635208815" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767635680604" ULTRA_SLOT="Yes" NAME="Single Target Drain BODY" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                        <NOTES />
                                        <MODIFIER XMLID="RANGED" ID="1767725464775" BASECOST="0.5" LEVELS="0" ALIAS="Ranged" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="Ranged" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                            <NOTES />
                                        </MODIFIER>
                                    </POWER>
                                    <POWER XMLID="DRAIN" ID="1767635393915" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767635680604" ULTRA_SLOT="Yes" NAME="Single Target Drain STUN" INPUT="STUN" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                        <NOTES />
                                        <MODIFIER XMLID="RANGED" ID="1767725476849" BASECOST="0.5" LEVELS="0" ALIAS="Ranged" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="Ranged" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                            <NOTES />
                                        </MODIFIER>
                                    </POWER>
                                    <POWER XMLID="DRAIN" ID="1767658676224" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767635680604" ULTRA_SLOT="Yes" NAME="AoE Drain STUN" INPUT="STUN" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                        <NOTES />
                                        <MODIFIER XMLID="AOE" ID="1767658695502" BASECOST="0.5" LEVELS="0" ALIAS="Area Of Effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HEX" OPTIONID="HEX" OPTION_ALIAS="One Hex" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                            <NOTES />
                                        </MODIFIER>
                                        <MODIFIER XMLID="RANGED" ID="1767725476849" BASECOST="0.5" LEVELS="0" ALIAS="Ranged" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="Ranged" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                            <NOTES />
                                        </MODIFIER>
                                    </POWER>
                                </POWERS>
                                <DISADVANTAGES />
                                <EQUIPMENT />
                            </CHARACTER>
                        `;
                    let actor;

                    let singleTargetMentalBlast;
                    let aoeMentalBlast;
                    let singleTargetDrainStun;
                    let singleTargetDrainBody;
                    let aoeDrainStun;
                    let strike;
                    let basicStrike;
                    let martialStrike;
                    let flyingDodge;
                    let basicShot;
                    let defensiveShot;
                    let offensiveRangedDisarm;

                    let notImplementedCorrectlyCsl;
                    let singleNonMentalCsl;
                    let singleMentalCsl;
                    let singleStrikeCsl;
                    let anyStrikeCsl;
                    let multipowerTightGroupOfAttacksCsl;
                    let listHthMartialArtsStyleCsl;
                    let martialManeuversCsl;
                    let magicSubsetCsl;
                    let multipowerBroadGroupOfAttacksCsl;

                    let hthDcvCsl;
                    let rangedDcvCsl;
                    let hthCsl;
                    let rangedCsl;
                    let mentalCsl;
                    let hthAndRangedDcvCsl;
                    let hthAndRangedOcvCsl;
                    let hthAndMentalDcvCsl;
                    let hthAndMentalOcvCsl;
                    let rangedAndMentalDcvCsl;
                    let rangedAndMentalOcvCsl;
                    let dcvCsl;
                    let decvCsl;
                    let allCsl;

                    let overallSl;
                    let nonOverallSl;

                    let invalidTwoDcvCsl;
                    let invalidTwoOcvCsl;

                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: true, actorType: "pc" });

                        singleTargetMentalBlast = actor.items.find((item) => item.name === "Single Target Ego Attack");
                        aoeMentalBlast = actor.items.find((item) => item.name === "AoE Ego Attack");
                        singleTargetDrainStun = actor.items.find((item) => item.name === "Single Target Drain STUN");
                        singleTargetDrainBody = actor.items.find((item) => item.name === "Single Target Drain BODY");
                        aoeDrainStun = actor.items.find((item) => item.name === "AoE Drain STUN");
                        strike = actor.items.find((item) => item.system.XMLID === "STRIKE");
                        basicStrike = actor.items.find((item) => item.name === "Basic Strike");
                        martialStrike = actor.items.find((item) => item.name === "Martial Strike");
                        flyingDodge = actor.items.find((item) => item.name === "Flying Dodge");
                        basicShot = actor.items.find((item) => item.name === "Basic Shot");
                        defensiveShot = actor.items.find((item) => item.name === "Defensive Shot");
                        offensiveRangedDisarm = actor.items.find((item) => item.name === "Offensive Ranged Disarm");

                        notImplementedCorrectlyCsl = actor.items.find(
                            (item) => item.name === "Not Implemented Correctly",
                        );
                        singleNonMentalCsl = actor.items.find((item) => item.name === "Single Attack Non Mental CSL");
                        singleMentalCsl = actor.items.find((item) => item.name === "Single Attack Mental CSL");
                        singleStrikeCsl = actor.items.find((item) => item.name === "Single Strike CSL");
                        anyStrikeCsl = actor.items.find((item) => item.name === "Any Strike CSL");
                        multipowerTightGroupOfAttacksCsl = actor.items.find(
                            (item) => item.name === "Multipower Tight Group of Attacks CSL",
                        );
                        listHthMartialArtsStyleCsl = actor.items.find(
                            (item) => item.name === "HTH Martial Arts Style List CSL",
                        );
                        martialManeuversCsl = actor.items.find((item) => item.name === "Martial Maneuvers CSL");
                        magicSubsetCsl = actor.items.find((item) => item.name === "Magic Subset CSL");
                        multipowerBroadGroupOfAttacksCsl = actor.items.find(
                            (item) => item.name === "Multipower Broad CSL",
                        );

                        hthCsl = actor.items.find((item) => item.name === "HTH CSL");
                        rangedCsl = actor.items.find((item) => item.name === "Ranged CSL");
                        mentalCsl = actor.items.find((item) => item.name === "Mental CSL");

                        hthDcvCsl = actor.items.find((item) => item.name === "HTH DCV CSL");
                        rangedDcvCsl = actor.items.find((item) => item.name === "Ranged DCV CSL");

                        dcvCsl = actor.items.find((item) => item.name === "DCV CSL");
                        decvCsl = actor.items.find((item) => item.name === "DECV CSL");

                        hthAndRangedDcvCsl = actor.items.find((item) => item.name === "HTH and Ranged DCV CSL");
                        hthAndRangedOcvCsl = actor.items.find((item) => item.name === "HTH and Ranged OCV CSL");
                        hthAndMentalDcvCsl = actor.items.find((item) => item.name === "HTH and Mental DCV CSL");
                        hthAndMentalOcvCsl = actor.items.find((item) => item.name === "HTH and Mental OCV CSL");
                        rangedAndMentalDcvCsl = actor.items.find((item) => item.name === "Ranged and Mental DCV CSL");
                        rangedAndMentalOcvCsl = actor.items.find((item) => item.name === "Mental and Ranged OCV CSL");

                        allCsl = actor.items.find((item) => item.name === "All CSL");

                        overallSl = actor.items.find((item) => item.name === "Overall SL");
                        nonOverallSl = actor.items.find((item) => item.name === "Non Overall SL");

                        invalidTwoDcvCsl = actor.items.find(
                            (item) => item.name === "Didn't mention DCV with Mental, HTH, or Ranged",
                        );
                        invalidTwoOcvCsl = actor.items.find(
                            (item) => item.name === "Didn't mention OCV with Mental, HTH, or Ranged",
                        );
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("Applicability To Attack - cslAppliesTo", function () {
                        describe("cslAppliesTo correctness", function () {
                            it("should return false when not called on a CSL/MCSL/SL", function () {
                                expect(strike.cslAppliesTo(strike)).to.be.false;
                            });
                        });

                        describe("CSLs", function () {
                            // PH: FIXME: The 1 point CSL should only apply to a particular maneuver with a particular weapon
                            it.skip("should not apply CSL to mental power - notImplementedCorrectlyCsl", function () {
                                expect(notImplementedCorrectlyCsl.cslAppliesTo(strike)).to.be.false;
                            });

                            it("should not apply CSL because it's not listed - singleNonMentalCsl", function () {
                                expect(singleNonMentalCsl.cslAppliesTo(basicStrike)).to.be.false;
                            });

                            it("should apply CSL because it is listed - singleNonMentalCsl", function () {
                                expect(singleNonMentalCsl.cslAppliesTo(strike)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - singleMentalCsl", function () {
                                expect(singleMentalCsl.cslAppliesTo(aoeDrainStun)).to.be.false;
                                expect(singleMentalCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed - singleMentalCsl", function () {
                                expect(singleMentalCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - singleStrikeCsl", function () {
                                expect(singleStrikeCsl.cslAppliesTo(strike)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed - singleStrikeCsl", function () {
                                expect(singleStrikeCsl.cslAppliesTo(basicStrike)).to.be.true;
                            });

                            it("should apply CSL to power because it's listed - anyStrikeCsl", function () {
                                expect(anyStrikeCsl.cslAppliesTo(strike)).to.be.true;
                                expect(anyStrikeCsl.cslAppliesTo(basicStrike)).to.be.true;
                            });

                            it("should not apply CSL to power that is not listed - anyStrikeCsl", function () {
                                expect(anyStrikeCsl.cslAppliesTo(flyingDodge)).to.be.false;
                                expect(anyStrikeCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                                expect(anyStrikeCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                            });

                            it("should not apply CSL to power because it's not listed - multipowerTightGroupOfAttacksCsl", function () {
                                expect(multipowerTightGroupOfAttacksCsl.cslAppliesTo(singleTargetMentalBlast)).to.be
                                    .false;
                            });

                            it("should apply CSL to non mental power that is listed - multipowerTightGroupOfAttacksCsl", function () {
                                expect(multipowerTightGroupOfAttacksCsl.cslAppliesTo(singleTargetDrainStun)).to.be.true;
                                expect(multipowerTightGroupOfAttacksCsl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                                expect(multipowerTightGroupOfAttacksCsl.cslAppliesTo(aoeDrainStun)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - listHthMartialArtsStyleCsl", function () {
                                expect(listHthMartialArtsStyleCsl.cslAppliesTo(basicShot)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed - listHthMartialArtsStyleCsl", function () {
                                expect(listHthMartialArtsStyleCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(listHthMartialArtsStyleCsl.cslAppliesTo(martialStrike)).to.be.true;
                                expect(listHthMartialArtsStyleCsl.cslAppliesTo(flyingDodge)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - martialManeuversCsl", function () {
                                expect(martialManeuversCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed - martialManeuversCsl", function () {
                                expect(martialManeuversCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(martialManeuversCsl.cslAppliesTo(martialStrike)).to.be.true;
                                expect(martialManeuversCsl.cslAppliesTo(flyingDodge)).to.be.true;
                                expect(martialManeuversCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(martialManeuversCsl.cslAppliesTo(defensiveShot)).to.be.true;
                                expect(martialManeuversCsl.cslAppliesTo(offensiveRangedDisarm)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - magicSubsetCsl", function () {
                                expect(magicSubsetCsl.cslAppliesTo(basicShot)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed - magicSubsetCsl", function () {
                                expect(magicSubsetCsl.cslAppliesTo(singleTargetDrainStun)).to.be.true;
                                expect(magicSubsetCsl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                                expect(magicSubsetCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to power because it's not listed - multipowerBroadGroupOfAttacksCsl", function () {
                                expect(multipowerBroadGroupOfAttacksCsl.cslAppliesTo(singleTargetDrainStun)).to.be
                                    .false;
                            });

                            it("should apply CSL to non mental power that is listed - multipowerBroadGroupOfAttacksCsl", function () {
                                expect(multipowerBroadGroupOfAttacksCsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                                expect(multipowerBroadGroupOfAttacksCsl.cslAppliesTo(singleTargetMentalBlast)).to.be
                                    .true;
                            });

                            it("should apply DCV with HTH combat - hthDcvCsl", function () {
                                expect(hthDcvCsl.cslAppliesTo(strike)).to.be.true;
                                expect(hthDcvCsl.cslAppliesTo(basicStrike)).to.be.true;
                            });

                            it("should not apply DCV with HTH combat - hthDcvCsl", function () {
                                expect(hthDcvCsl.cslAppliesTo(flyingDodge)).to.be.false;
                                expect(hthDcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                                expect(hthDcvCsl.cslAppliesTo(basicShot)).to.be.false;
                                expect(hthDcvCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                            });

                            it("should apply DCV with Ranged combat - rangedDcvCsl", function () {
                                expect(rangedDcvCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(rangedDcvCsl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                            });

                            it("should not apply DCV with Ranged combat - rangedDcvCsl", function () {
                                expect(rangedDcvCsl.cslAppliesTo(strike)).to.be.false;
                                expect(rangedDcvCsl.cslAppliesTo(basicStrike)).to.be.false;
                                expect(rangedDcvCsl.cslAppliesTo(flyingDodge)).to.be.false;
                                expect(rangedDcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                            });

                            it("should apply CSL for HTH combat - hthCsl", function () {
                                expect(hthCsl.cslAppliesTo(strike)).to.be.true;
                                expect(hthCsl.cslAppliesTo(basicStrike)).to.be.true;
                            });

                            it("should not apply CSL for HTH combat - hthCsl", function () {
                                expect(hthCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(hthCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                                expect(hthCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                                expect(hthCsl.cslAppliesTo(singleTargetDrainStun)).to.be.false;
                                expect(hthCsl.cslAppliesTo(aoeDrainStun)).to.be.false;
                                expect(hthCsl.cslAppliesTo(flyingDodge)).to.be.false;
                            });

                            it("should apply CSL for Ranged combat - rangedCsl", function () {
                                expect(rangedCsl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                                expect(rangedCsl.cslAppliesTo(singleTargetDrainStun)).to.be.true;
                                expect(rangedCsl.cslAppliesTo(aoeDrainStun)).to.be.true;
                            });

                            it("should not apply CSL for Ranged combat - rangedCsl", function () {
                                expect(rangedCsl.cslAppliesTo(strike)).to.be.false;
                                expect(rangedCsl.cslAppliesTo(basicStrike)).to.be.false;
                                expect(rangedCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(rangedCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                                expect(hthCsl.cslAppliesTo(flyingDodge)).to.be.false;
                            });

                            it("should apply CSL for Mental combat - mentalCsl", function () {
                                expect(mentalCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(mentalCsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL for Mental combat - mentalCsl", function () {
                                expect(mentalCsl.cslAppliesTo(strike)).to.be.false;
                                expect(mentalCsl.cslAppliesTo(basicStrike)).to.be.false;
                                expect(mentalCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                                expect(mentalCsl.cslAppliesTo(singleTargetDrainStun)).to.be.false;
                                expect(mentalCsl.cslAppliesTo(aoeDrainStun)).to.be.false;
                                expect(hthCsl.cslAppliesTo(flyingDodge)).to.be.false;
                            });

                            it("should have raised the actor's DCV by 1 - dcvCsl", function () {
                                expect(actor.system.characteristics.dcv.value).to.equal(4);
                            });

                            describe("DCV CSL should be an affect effect that can be turned off", function () {
                                before(async function () {
                                    await dcvCsl.turnOff();
                                });

                                after(async function () {
                                    await dcvCsl.turnOn();
                                });

                                it("should reduce the actor's DCV by 1 when disabled", function () {
                                    // PH: FIXME: This test is flakey. See #3467 for instance.
                                    expect(actor.system.characteristics.dcv.value).to.equal(3);
                                });
                            });

                            it("should have raised the actor's DMCV by 1 - dcvCsl", function () {
                                expect(actor.system.characteristics.dmcv.value).to.equal(4);
                            });

                            describe("DECV CSL should be an affect effect that can be turned off", function () {
                                before(async function () {
                                    await decvCsl.turnOff();
                                });

                                after(async function () {
                                    await decvCsl.turnOn();
                                });

                                it("should reduce the actor's DECV by 1 when disabled", function () {
                                    // PH: FIXME: This test is flakey. See #3467 for instance.
                                    expect(actor.system.characteristics.dmcv.value).to.equal(3);
                                });
                            });

                            it("should apply CSL to DCV HTH and Ranged combat - hthAndRangedDcvCsl", function () {
                                expect(hthAndRangedDcvCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(hthAndRangedDcvCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(hthAndRangedDcvCsl.cslAppliesTo(aoeDrainStun)).to.be.true;
                            });

                            it("should not apply CSL to DCV HTH and Ranged combat - hthAndRangedDcvCsl", function () {
                                expect(hthAndRangedDcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(hthAndRangedDcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                            });

                            it("should apply CSL to DCV HTH and Mental combat - hthAndMentalDcvCsl", function () {
                                expect(hthAndMentalDcvCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(hthAndMentalDcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                                expect(hthAndMentalDcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to DCV HTH and Mental combat - hthAndMentalDcvCsl", function () {
                                expect(hthAndMentalDcvCsl.cslAppliesTo(basicShot)).to.be.false;
                                expect(hthAndMentalDcvCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                            });

                            it("should apply CSL to DCV Ranged and Mental combat - rangedAndMentalDcvCsl", function () {
                                expect(rangedAndMentalDcvCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(rangedAndMentalDcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to DCV Ranged and Mental combat - rangedAndMentalDcvCsl", function () {
                                expect(rangedAndMentalDcvCsl.cslAppliesTo(strike)).to.be.false;
                                expect(rangedAndMentalDcvCsl.cslAppliesTo(basicStrike)).to.be.false;
                            });

                            it("should apply CSL to OCV HTH and Ranged combat - hthAndRangedOcvCsl", function () {
                                expect(hthAndRangedOcvCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(hthAndRangedOcvCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(hthAndRangedOcvCsl.cslAppliesTo(aoeDrainStun)).to.be.true;
                            });

                            it("should not apply CSL to OCV HTH and Ranged combat - hthAndRangedOcvCsl", function () {
                                expect(hthAndRangedOcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(hthAndRangedOcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                            });

                            it("should apply CSL to OCV HTH and Mental combat - hthAndMentalOcvCsl", function () {
                                expect(hthAndMentalOcvCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(hthAndMentalOcvCsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                                expect(hthAndMentalOcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to OCV HTH and Mental combat - hthAndMentalOcvCsl", function () {
                                expect(hthAndMentalOcvCsl.cslAppliesTo(basicShot)).to.be.false;
                                expect(hthAndMentalOcvCsl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                            });

                            it("should apply CSL to OCV Ranged and Mental combat - rangedAndMentalOcvCsl", function () {
                                expect(rangedAndMentalOcvCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(rangedAndMentalOcvCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply CSL to OCV Ranged and Mental combat - rangedAndMentalOcvCsl", function () {
                                expect(rangedAndMentalOcvCsl.cslAppliesTo(strike)).to.be.false;
                                expect(rangedAndMentalOcvCsl.cslAppliesTo(basicStrike)).to.be.false;
                            });

                            it("should apply CSL to all combat types - allCsl", function () {
                                expect(allCsl.cslAppliesTo(strike)).to.be.true;
                                expect(allCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(allCsl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                                expect(allCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(allCsl.cslAppliesTo(basicShot)).to.be.true;
                            });
                        });

                        describe("SLs", function () {
                            it("should apply overall SLs to mental and non mental attacks", function () {
                                expect(overallSl.cslAppliesTo(singleTargetDrainStun)).to.be.true;
                                expect(overallSl.cslAppliesTo(singleTargetDrainBody)).to.be.true;
                                expect(overallSl.cslAppliesTo(aoeDrainStun)).to.be.true;
                                expect(overallSl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(overallSl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                                expect(overallSl.cslAppliesTo(strike)).to.be.true;
                                expect(overallSl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(overallSl.cslAppliesTo(martialStrike)).to.be.true;
                                expect(overallSl.cslAppliesTo(flyingDodge)).to.be.true;
                                expect(overallSl.cslAppliesTo(basicShot)).to.be.true;
                                expect(overallSl.cslAppliesTo(defensiveShot)).to.be.true;
                                expect(overallSl.cslAppliesTo(offensiveRangedDisarm)).to.be.true;
                            });

                            it("should not apply non overall SLs to mental or non mental attacks", function () {
                                expect(nonOverallSl.cslAppliesTo(singleTargetDrainStun)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(singleTargetDrainBody)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(aoeDrainStun)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(strike)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(basicStrike)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(martialStrike)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(flyingDodge)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(basicShot)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(defensiveShot)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(offensiveRangedDisarm)).to.be.false;
                            });
                        });

                        describe("Invalid TWODCV/TWOOCV CSLs", function () {
                            it("should recognize correctly specified TWODCV", function () {
                                expect(hthAndRangedDcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(hthAndRangedDcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);

                                expect(hthAndMentalDcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(hthAndMentalDcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);

                                expect(rangedAndMentalDcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(rangedAndMentalDcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);
                            });

                            it("should recognize incorrectly specified TWODCV", function () {
                                expect(invalidTwoDcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(invalidTwoDcvCsl.csl5eCslDcvOcvTypes).to.have.length(0);
                            });

                            it("should recognize correctly specified TWOOCV", function () {
                                expect(hthAndRangedOcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(hthAndRangedOcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);

                                expect(hthAndMentalOcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(hthAndMentalOcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);

                                expect(rangedAndMentalOcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(rangedAndMentalOcvCsl.csl5eCslDcvOcvTypes).to.have.length(2);
                            });

                            it("should recognize incorrectly specified TWOOCV", function () {
                                expect(invalidTwoOcvCsl.csl5eCslDcvOcvTypes).to.be.an("array");
                                expect(invalidTwoOcvCsl.csl5eCslDcvOcvTypes).to.have.length(0);
                            });
                        });
                    });

                    describe("cslChoices function", async function () {
                        describe("CSLs (Physical and Mental)", function () {
                            it("should return correct choices for SINGLESINGLE CSL", function () {
                                // SINGLESINGLE should only have OCV, no DCV or DC
                                const choices = notImplementedCorrectlyCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(2);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for SINGLE CSL", function () {
                                // SINGLE should only have OCV, no DCV or DC
                                const choices = singleNonMentalCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(2);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for SINGLESTRIKE CSL", function () {
                                // SINGLESTRIKE should only have OCV, no DCV or DC
                                const choices = singleStrikeCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(2);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for STRIKE CSL", function () {
                                // STRIKE CSL should have OCV, DCV, and DC
                                const choices = anyStrikeCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for TIGHT CSL", function () {
                                // TIGHT should have OCV, DCV, and DC
                                const choices = multipowerTightGroupOfAttacksCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for MARTIAL CSL", function () {
                                // MARTIAL should have OCV, DCV, and DC
                                const choices = martialManeuversCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for MAGIC CSL", function () {
                                // MAGIC should have OCV, DCV, and DC
                                const choices = magicSubsetCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for BROAD CSL", function () {
                                // BROAD should have OCV, DCV, and DC
                                const choices = multipowerBroadGroupOfAttacksCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for HTHDCV CSL - HTH option", function () {
                                // HTHDCV should not ever have OCV, DCV, and DC displayed
                                const choices = hthDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for HTHDCV CSL - Ranged option", function () {
                                // HTHDCV should not ever have OCV, DCV, and DC displayed
                                const choices = rangedDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for DECV CSL", function () {
                                // DECV should not ever have OMCV, DMCV, and DC displayed as it's an Active Effect
                                const choices = rangedDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("omcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for HTH CSL", function () {
                                // HTH should have OCV, DCV, and DC
                                const choices = hthCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for RANGED CSL", function () {
                                // RANGED should have OCV, DCV, and DC
                                const choices = rangedCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for MENTAL CSL", function () {
                                // MENTAL should have OMCV, DMCV, and DC
                                const choices = mentalCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for DCV CSL", function () {
                                // DCV should not ever have OCV, DCV, and DC displayed as it's an Active Effect
                                const choices = dcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("omcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for TWOOCV CSL - HTH and Ranged", function () {
                                // TWOOCV should have OCV, DCV, and DC
                                const choices = hthAndRangedOcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for TWOOCV CSL - HTH and Mental", function () {
                                // TWOOCV should have OCV, DCV, and DC
                                const choices = hthAndMentalOcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for TWOOCV CSL - Ranged and Mental", function () {
                                // TWOOCV should have OCV, DCV, and DC
                                const choices = rangedAndMentalOcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for TWODCV CSL - HTH and Ranged", function () {
                                // TWOOCV should have OCV, DCV, and DC
                                const choices = hthAndRangedDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for TWODCV CSL - HTH and Mental", function () {
                                // TWOOCV should not ever have OCV, OMCV, DCV, DMCV, and DC displayed
                                const choices = hthAndMentalDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for TWODCV CSL - Ranged and Mental", function () {
                                // TWOOCV should not ever have OCV, OMCV, DCV, DMCV, and DC displayed
                                const choices = rangedAndMentalDcvCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for ALL CSL", function () {
                                const allCsl = actor.items.find(
                                    (item) => item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "ALL",
                                );
                                expect(!!allCsl).to.be.true;

                                // ALL CSL should have OCV, DCV, and DC
                                const choices = allCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });
                        });

                        describe("SLs", function () {
                            it("should return correct choices for OVERALL Skill Levels", function () {
                                const overallSl = actor.items.find(
                                    (item) =>
                                        item.system.XMLID === "SKILL_LEVELS" && item.system.OPTIONID === "OVERALL",
                                );
                                expect(!!overallSl).to.be.true;

                                const choices = overallSl.cslChoices;
                                // OVERALL Skill Levels should have all combat values
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for NONCOMBAT Skill Levels", function () {
                                const NonCombatSl = actor.items.find(
                                    (item) =>
                                        item.system.XMLID === "SKILL_LEVELS" && item.system.OPTIONID === "NONCOMBAT",
                                );
                                expect(!!NonCombatSl).to.be.true;

                                // Only OVERALL Skill Levels should have all combat values
                                const choices = NonCombatSl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                                expect(choices).to.not.have.property("ocv");
                                expect(choices).to.not.have.property("omcv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });
                        });
                    });
                });

                describe("6e", function () {
                    const contents = `
                            <?xml version="1.0" encoding="UTF-16"?>
                            <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic6E.hdt">
                                <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                                <CHARACTER_INFO CHARACTER_NAME="6e TEST CSLs" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                                    <STR XMLID="STR" ID="1767463533199" BASECOST="0.0" LEVELS="0" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </STR>
                                    <DEX XMLID="DEX" ID="1767463533097" BASECOST="0.0" LEVELS="0" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </DEX>
                                    <CON XMLID="CON" ID="1767463533181" BASECOST="0.0" LEVELS="0" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </CON>
                                    <INT XMLID="INT" ID="1767463532937" BASECOST="0.0" LEVELS="0" ALIAS="INT" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </INT>
                                    <EGO XMLID="EGO" ID="1767463532611" BASECOST="0.0" LEVELS="0" ALIAS="EGO" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </EGO>
                                    <PRE XMLID="PRE" ID="1767463533175" BASECOST="0.0" LEVELS="0" ALIAS="PRE" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </PRE>
                                    <OCV XMLID="OCV" ID="1767463532652" BASECOST="0.0" LEVELS="0" ALIAS="OCV" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </OCV>
                                    <DCV XMLID="DCV" ID="1767463532560" BASECOST="0.0" LEVELS="0" ALIAS="DCV" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </DCV>
                                    <OMCV XMLID="OMCV" ID="1767463533179" BASECOST="0.0" LEVELS="0" ALIAS="OMCV" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </OMCV>
                                    <DMCV XMLID="DMCV" ID="1767463532302" BASECOST="0.0" LEVELS="0" ALIAS="DMCV" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </DMCV>
                                    <SPD XMLID="SPD" ID="1767463532836" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </SPD>
                                    <PD XMLID="PD" ID="1767463532674" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </PD>
                                    <ED XMLID="ED" ID="1767463532692" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </ED>
                                    <REC XMLID="REC" ID="1767463533202" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </REC>
                                    <END XMLID="END" ID="1767463532306" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </END>
                                    <BODY XMLID="BODY" ID="1767463532337" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </BODY>
                                    <STUN XMLID="STUN" ID="1767463533211" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </STUN>
                                    <RUNNING XMLID="RUNNING" ID="1767463532285" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </RUNNING>
                                    <SWIMMING XMLID="SWIMMING" ID="1767463532613" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </SWIMMING>
                                    <LEAPING XMLID="LEAPING" ID="1767463532836" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </LEAPING>
                                </CHARACTERISTICS>
                                <SKILLS>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767463790139" BASECOST="0.0" LEVELS="0" ALIAS="CSLs" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463545149" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="Single Attack CSL Should Not Work" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635075062" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Mental Blast" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767634905165" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="Strike Single Target CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635109349" BASECOST="0.0" LEVELS="0" ALIAS="Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463561551" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with a small group of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="Small Group CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635129598" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Drain" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635129599" BASECOST="0.0" LEVELS="0" ALIAS="AoE Drain" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463567919" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BROAD" OPTIONID="BROAD" OPTION_ALIAS="with a large group of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="Large Group CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635211335" BASECOST="0.0" LEVELS="0" ALIAS="Drain Multipower" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463573879" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTH" OPTIONID="HTH" OPTION_ALIAS="with HTH Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="HTH CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES>Don't need to list items here, but we should support if they are.</NOTES>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767639139170" BASECOST="0.0" LEVELS="0" ALIAS="Counterstrike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463581247" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="with Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="Ranged CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES>Don't need to list items here, but we should support if they are.</NOTES>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767639363436" BASECOST="0.0" LEVELS="0" ALIAS="AoE Drain" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="COMBAT_LEVELS" ID="1767463586823" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ALL" OPTIONID="ALL" OPTION_ALIAS="with All Attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463790139" NAME="All Attacks CSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767463847286" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767463850479" BASECOST="0.0" LEVELS="0" ALIAS="Mental CSLs" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1767463605768" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with a single Mental Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463850479" NAME="Single Mental Attack MCSL Should Not Work" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767635089654" BASECOST="0.0" LEVELS="0" ALIAS="Strike" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1767634914611" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with a single Mental Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463850479" NAME="Single Mental Attack MCSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767637668376" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Mental Blast" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1767463612438" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with a group of Mental Powers" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463850479" NAME="Group MCSL (Individual)" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767637685051" BASECOST="0.0" LEVELS="0" ALIAS="Single Target Mental Blast" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767637685052" BASECOST="0.0" LEVELS="0" ALIAS="AoE Mental Blast" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1767635246424" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with a group of Mental Powers" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463850479" NAME="Group MCSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    <ADDER XMLID="GENERIC_OBJECT" ID="1767637704307" BASECOST="0.0" LEVELS="0" ALIAS="Mental Blast Multipower" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    </SKILL>
                                    <SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1767559465007" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BROAD" OPTIONID="BROAD" OPTION_ALIAS="with all Mental Powers" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767463850479" NAME="All Mental MCSL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638005127" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638008074" BASECOST="0.0" LEVELS="0" ALIAS="Skill Levels" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <SKILL XMLID="SKILL_LEVELS" ID="1767637596815" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="OVERALL" OPTIONID="OVERALL" OPTION_ALIAS="Overall" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638008074" NAME="Overall SL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                    <SKILL XMLID="SKILL_LEVELS" ID="1767643508639" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ALLMOVEMENT" OPTIONID="ALLMOVEMENT" OPTION_ALIAS="with all modes of Movement" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638008074" NAME="Non Overall SL" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                    <NOTES />
                                    </SKILL>
                                </SKILLS>
                                <PERKS />
                                <TALENTS />
                                <MARTIALARTS>
                                    <WEAPON_ELEMENT XMLID="WEAPON_ELEMENT" ID="1767638503239" BASECOST="0.0" LEVELS="0" ALIAS="Weapon Element" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    <ADDER XMLID="BAREHAND" ID="1767638930683" BASECOST="1.0" LEVELS="0" ALIAS="Empty Hand" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                    </ADDER>
                                    <ADDER XMLID="BEAMWEAPONS" ID="1767638937367" BASECOST="0.0" LEVELS="0" ALIAS="Beam Weapons" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="NO">
                                        <NOTES />
                                        <ADDER XMLID="LASERPISTOL" ID="1767638937366" BASECOST="1.0" LEVELS="0" ALIAS="Laser Pistols" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                                        <NOTES />
                                        </ADDER>
                                    </ADDER>
                                    </WEAPON_ELEMENT>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638941355" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638942841" BASECOST="0.0" LEVELS="0" ALIAS="HTH Martial Maneuvers Style" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638539775" BASECOST="3.0" LEVELS="0" ALIAS="Basic Strike" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638942841" NAME="" CATEGORY="Hand To Hand" DISPLAY="Basic Strike" OCV="+1" DCV="+0" DC="2" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="15" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638535663" BASECOST="4.0" LEVELS="0" ALIAS="Counterstrike" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638942841" NAME="" CATEGORY="Hand To Hand" DISPLAY="Counterstrike" OCV="+2" DCV="+2" DC="2" PHASE="1/2" EFFECT="[NORMALDC] Strike, Must Follow Block" ADDSTR="Yes" ACTIVECOST="20" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike, Must Follow Block">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638555465" BASECOST="4.0" LEVELS="0" ALIAS="Martial Dodge" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638942841" NAME="" CATEGORY="Hand To Hand" DISPLAY="Martial Dodge" OCV="--" DCV="+5" DC="0" PHASE="1/2" EFFECT="Dodge, Affects All Attacks, Abort" ADDSTR="No" ACTIVECOST="35" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638544175" BASECOST="4.0" LEVELS="0" ALIAS="Martial Escape" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638942841" NAME="" CATEGORY="Hand To Hand" DISPLAY="Martial Escape" OCV="+0" DCV="+0" DC="3" PHASE="1/2" EFFECT="[STRDC] vs. Grabs" ADDSTR="Yes" ACTIVECOST="10" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No">
                                    <NOTES />
                                    </MANEUVER>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638985552" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767638986987" BASECOST="0.0" LEVELS="0" ALIAS="Ranged Martial Maneuvers Style" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638575496" BASECOST="4.0" LEVELS="0" ALIAS="Basic Shot" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638986987" NAME="" CATEGORY="Ranged" DISPLAY="Basic Shot" OCV="+0" DCV="+0" DC="2" PHASE="1/2" EFFECT="Strike, [WEAPONDC]" ADDSTR="No" ACTIVECOST="16" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="2">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638577999" BASECOST="3.0" LEVELS="0" ALIAS="Defensive Shot" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638986987" NAME="" CATEGORY="Ranged" DISPLAY="Defensive Shot" OCV="-1" DCV="+2" DC="0" PHASE="1/2" EFFECT="Strike [WEAPONDC]" ADDSTR="No" ACTIVECOST="5" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="0">
                                    <NOTES />
                                    </MANEUVER>
                                    <MANEUVER XMLID="MANEUVER" ID="1767638580207" BASECOST="4.0" LEVELS="0" ALIAS="Offensive Shot" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767638986987" NAME="" CATEGORY="Ranged" DISPLAY="Offensive Shot" OCV="-1" DCV="-1" DC="4" PHASE="1/2" EFFECT="Strike, [WEAPONDC]" ADDSTR="No" ACTIVECOST="10" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" RANGE="0">
                                    <NOTES />
                                    </MANEUVER>
                                </MARTIALARTS>
                                <POWERS>
                                    <MULTIPOWER XMLID="GENERIC_OBJECT" ID="1767634788699" BASECOST="45.0" LEVELS="0" ALIAS="Multipower" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Mental Blast Multipower" QUANTITY="1">
                                    <NOTES />
                                    </MULTIPOWER>
                                    <POWER XMLID="EGOATTACK" ID="1767463636449" BASECOST="0.0" LEVELS="3" ALIAS="Mental Blast" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767634788699" ULTRA_SLOT="Yes" NAME="Single Target Mental Blast" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </POWER>
                                    <POWER XMLID="EGOATTACK" ID="1767467639377" BASECOST="0.0" LEVELS="3" ALIAS="Mental Blast" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767634788699" ULTRA_SLOT="Yes" NAME="AoE Mental Blast" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    <MODIFIER XMLID="AOE" ID="1767467654573" BASECOST="0.0" LEVELS="6" ALIAS="Area Of Effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RADIUS" OPTIONID="RADIUS" OPTION_ALIAS="Radius" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                        <NOTES />
                                    </MODIFIER>
                                    </POWER>
                                    <LIST XMLID="GENERIC_OBJECT" ID="1767634745352" BASECOST="0.0" LEVELS="0" ALIAS=" " POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                                    <NOTES />
                                    </LIST>
                                    <MULTIPOWER XMLID="GENERIC_OBJECT" ID="1767634748775" BASECOST="15.0" LEVELS="0" ALIAS="Multipower" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Drain Multipower" QUANTITY="1">
                                    <NOTES />
                                    </MULTIPOWER>
                                    <POWER XMLID="DRAIN" ID="1767463650100" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767634748775" ULTRA_SLOT="Yes" NAME="Single Target Drain" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    </POWER>
                                    <POWER XMLID="DRAIN" ID="1767467641081" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1767634748775" ULTRA_SLOT="Yes" NAME="AoE Drain" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                                    <NOTES />
                                    <MODIFIER XMLID="AOE" ID="1767467671382" BASECOST="0.0" LEVELS="6" ALIAS="Area Of Effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RADIUS" OPTIONID="RADIUS" OPTION_ALIAS="Radius" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                                        <NOTES />
                                    </MODIFIER>
                                    </POWER>
                                </POWERS>
                                <DISADVANTAGES />
                                <EQUIPMENT />
                            </CHARACTER>
                        `;
                    let actor;

                    let singleTargetMentalBlast;
                    let aoeMentalBlast;
                    let singleTargetDrain;
                    let aoeDrain;
                    let strike;
                    let basicStrike;
                    let counterstrike;
                    let basicShot;

                    let singleAttackCslShouldNotWork;
                    let singleStrikeTargetCsl;
                    let smallGroupCsl;
                    let largeGroupCsl;
                    let hthCsl;
                    let rangedCsl;
                    let allAttacksCsl;

                    let singleMentalAttackShouldNotWork;
                    let singleMentalAttackMcsl;
                    let groupIndividualMentalMcsl;
                    let groupMentalMcsl;
                    let allMentalMcsl;

                    let overallSl;
                    let nonOverallSl;

                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: true, actorType: "pc" });

                        singleTargetMentalBlast = actor.items.find(
                            (item) => item.name === "Single Target Mental Blast",
                        );
                        aoeMentalBlast = actor.items.find((item) => item.name === "AoE Mental Blast");
                        singleTargetDrain = actor.items.find((item) => item.name === "Single Target Drain");
                        aoeDrain = actor.items.find((item) => item.name === "AoE Drain");
                        strike = actor.items.find((item) => item.system.XMLID === "STRIKE");
                        basicStrike = actor.items.find((item) => item.name === "Basic Strike");
                        counterstrike = actor.items.find((item) => item.name === "Counterstrike");
                        basicShot = actor.items.find((item) => item.name === "Basic Shot");

                        singleAttackCslShouldNotWork = actor.items.find(
                            (item) => item.name === "Single Attack CSL Should Not Work",
                        );
                        singleStrikeTargetCsl = actor.items.find((item) => item.name === "Strike Single Target CSL");
                        smallGroupCsl = actor.items.find((item) => item.name === "Small Group CSL");
                        largeGroupCsl = actor.items.find((item) => item.name === "Large Group CSL");
                        hthCsl = actor.items.find((item) => item.name === "HTH CSL");
                        rangedCsl = actor.items.find((item) => item.name === "Ranged CSL");
                        allAttacksCsl = actor.items.find((item) => item.name === "All Attacks CSL");

                        singleMentalAttackShouldNotWork = actor.items.find(
                            (item) => item.name === "Single Mental Attack MCSL Should Not Work",
                        );
                        singleMentalAttackMcsl = actor.items.find((item) => item.name === "Single Mental Attack MCSL");
                        groupIndividualMentalMcsl = actor.items.find((item) => item.name === "Group MCSL (Individual)");
                        groupMentalMcsl = actor.items.find((item) => item.name === "Group MCSL");
                        allMentalMcsl = actor.items.find((item) => item.name === "All Mental MCSL");

                        overallSl = actor.items.find((item) => item.name === "Overall SL");
                        nonOverallSl = actor.items.find((item) => item.name === "Non Overall SL");
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("Applicability To Attack - cslAppliesTo", function () {
                        describe("cslAppliesTo correctness", function () {
                            it("should return false when not called on a CSL/MCSL/SL", function () {
                                expect(strike.cslAppliesTo(strike)).to.be.false;
                            });
                        });

                        describe("CSLs", function () {
                            it("should not apply CSL to mental power", function () {
                                expect(singleAttackCslShouldNotWork.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                            });

                            it("should not apply CSL to non mental power because it's not listed", function () {
                                expect(singleAttackCslShouldNotWork.cslAppliesTo(singleTargetDrain)).to.be.false;
                            });

                            it("should apply CSL to non mental power that is listed", function () {
                                expect(singleStrikeTargetCsl.cslAppliesTo(strike)).to.be.true;
                            });

                            it("should apply CSL to non mental powers that are listed", function () {
                                expect(smallGroupCsl.cslAppliesTo(singleTargetDrain)).to.be.true;
                                expect(smallGroupCsl.cslAppliesTo(aoeDrain)).to.be.true;
                            });

                            it("should apply CSL to non mental powers that are not listed", function () {
                                expect(smallGroupCsl.cslAppliesTo(strike)).to.be.false;
                            });

                            it("should apply CSL to non mental powers that are in the multipower", function () {
                                expect(largeGroupCsl.cslAppliesTo(singleTargetDrain)).to.be.true;
                                expect(largeGroupCsl.cslAppliesTo(aoeDrain)).to.be.true;
                            });

                            it("should apply CSL to HTH that are not listed", function () {
                                expect(hthCsl.cslAppliesTo(strike)).to.be.true;
                                expect(hthCsl.cslAppliesTo(basicStrike)).to.be.true;
                            });

                            it("should apply CSL to HTH that are listed", function () {
                                expect(hthCsl.cslAppliesTo(counterstrike)).to.be.true;
                            });

                            it("should not apply CSL to ranged for HTH CSL", function () {
                                expect(hthCsl.cslAppliesTo(singleTargetDrain)).to.be.false;
                            });

                            it("should apply CSL to Ranged that are not listed", function () {
                                expect(rangedCsl.cslAppliesTo(singleTargetDrain)).to.be.true;
                                expect(rangedCsl.cslAppliesTo(basicShot)).to.be.true;
                            });

                            it("should apply CSL to Ranged that are listed", function () {
                                expect(rangedCsl.cslAppliesTo(aoeDrain)).to.be.true;
                            });

                            it("should not apply CSL to HTH for ranged CSL", function () {
                                expect(rangedCsl.cslAppliesTo(strike)).to.be.false;
                                expect(rangedCsl.cslAppliesTo(counterstrike)).to.be.false;
                            });

                            it("should apply CSL to all non mental attacks", function () {
                                expect(allAttacksCsl.cslAppliesTo(strike)).to.be.true;
                                expect(allAttacksCsl.cslAppliesTo(basicStrike)).to.be.true;
                                expect(allAttacksCsl.cslAppliesTo(basicShot)).to.be.true;
                                expect(allAttacksCsl.cslAppliesTo(aoeDrain)).to.be.true;
                            });

                            it("should not apply CSL to all mental attacks", function () {
                                expect(allAttacksCsl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                            });
                        });

                        describe("MCSLs", function () {
                            it("should not apply MCSL to mental power", function () {
                                expect(singleMentalAttackShouldNotWork.cslAppliesTo(strike)).to.be.false;
                            });

                            it("should not apply MCSL to non mental power because it's not listed", function () {
                                expect(singleMentalAttackShouldNotWork.cslAppliesTo(singleTargetMentalBlast)).to.be
                                    .false;
                            });

                            it("should apply MCSL to mental power", function () {
                                expect(singleMentalAttackMcsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                            });

                            it("should not apply MCSL to mental power that is not listed", function () {
                                expect(singleMentalAttackMcsl.cslAppliesTo(aoeMentalBlast)).to.be.false;
                            });

                            it("should apply group MCSL to several mental powers that are listed", function () {
                                expect(groupIndividualMentalMcsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(groupIndividualMentalMcsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                            });

                            it("should apply group MCSL to several mental powers in a framework", function () {
                                expect(groupMentalMcsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(groupMentalMcsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                            });

                            it("should apply MCSL to any mental power", function () {
                                expect(allMentalMcsl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(allMentalMcsl.cslAppliesTo(aoeMentalBlast)).to.be.true;
                            });

                            it("should not apply MCSL to any non mental power", function () {
                                expect(allMentalMcsl.cslAppliesTo(singleTargetDrain)).to.be.false;
                                expect(allMentalMcsl.cslAppliesTo(strike)).to.be.false;
                            });
                        });

                        describe("SLs", function () {
                            it("should apply overall SLs to mental and non mental attacks", function () {
                                expect(overallSl.cslAppliesTo(singleTargetDrain)).to.be.true;
                                expect(overallSl.cslAppliesTo(singleTargetMentalBlast)).to.be.true;
                                expect(overallSl.cslAppliesTo(strike)).to.be.true;
                                expect(overallSl.cslAppliesTo(counterstrike)).to.be.true;
                                expect(overallSl.cslAppliesTo(basicShot)).to.be.true;
                            });

                            it("should not apply non overall SLs to mental or non mental attacks", function () {
                                expect(nonOverallSl.cslAppliesTo(singleTargetDrain)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(singleTargetMentalBlast)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(strike)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(counterstrike)).to.be.false;
                                expect(nonOverallSl.cslAppliesTo(basicShot)).to.be.false;
                            });
                        });
                    });

                    describe("Applicability to Attack - cslChoices", function () {
                        describe("Physical CSL", function () {
                            it("should return correct choices for Physical SINGLE CSL", function () {
                                // Physical SINGLE should only have OCV, no DCV or DC
                                const choices = singleStrikeTargetCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(1);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.not.have.property("dcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for Physical TIGHT CSL", function () {
                                // Physical TIGHT should have OCV, DCV, and DC
                                const choices = smallGroupCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for Physical BROAD CSL", function () {
                                // Physical BROAD should have OCV, DCV, and DC
                                const choices = largeGroupCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for Physical HTH CSL", function () {
                                // Physical HTH should have OCV, DCV, and DC
                                const choices = hthCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for Physical RANGED CSL", function () {
                                // Physical RANGED should have OCV, DCV, and DC
                                const choices = rangedCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for Physical ALL CSL", function () {
                                // Physical ALL should have OCV, DCV, and DC
                                const choices = allAttacksCsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dc");
                            });
                        });

                        describe("Mental CSL", function () {
                            it("should return correct choices for Mental SINGLE CSL", function () {
                                // Mental SINGLE should only have OMCV, no DMCV or DC
                                const choices = singleMentalAttackMcsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(1);
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.not.have.property("dmcv");
                                expect(choices).to.not.have.property("dc");
                            });

                            it("should return correct choices for Mental TIGHT CSL", function () {
                                // Mental TIGHT should have OMCV, DMCV, and DC
                                const choices = groupMentalMcsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return correct choices for Mental BROAD CSL", function () {
                                // Mental BROAD should have OMCV, DMCV, and DC
                                const choices = allMentalMcsl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(3);
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });
                        });

                        describe("Skill Levels", function () {
                            it("should return correct choices for OVERALL Skill Levels", function () {
                                // OVERALL Skill Levels should have all combat values
                                const choices = overallSl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(5);
                                expect(choices).to.have.property("ocv");
                                expect(choices).to.have.property("omcv");
                                expect(choices).to.have.property("dcv");
                                expect(choices).to.have.property("dmcv");
                                expect(choices).to.have.property("dc");
                            });

                            it("should return empty choices for non-OVERALL Skill Levels", function () {
                                // Non-OVERALL Skill Levels should return empty object
                                const choices = nonOverallSl.cslChoices;
                                expect(Object.keys(choices)).to.have.length(0);
                            });
                        });
                    });
                });
            });
        },
        { displayName: "HERO: Combat Skill Levels" },
    );
}
