import { createQuenchActor } from "./quench-helper.mjs";

export function registerCslTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.item.csl",
        (context) => {
            const { before, describe, expect, it } = context;

            describe.only("Combat Skill Levels (CSL & SL)", function () {
                // The default timeout tends to be insufficient with multiple actors being created at the same time.
                this.timeout(20000);

                describe("5e", async function () {
                    const contents = `
                        <?xml version="1.0" encoding="UTF-16"?>
                        <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                          <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                          <CHARACTER_INFO CHARACTER_NAME="TEST 5e CSLs" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530693138" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLESINGLE" OPTIONID="SINGLESINGLE" OPTION_ALIAS="with any single attack with one specific weapon" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                                <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530697066" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530703345" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLESTRIKE" OPTIONID="SINGLESTRIKE" OPTION_ALIAS="with any single Strike" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530709609" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="STRIKE" OPTIONID="STRIKE" OPTION_ALIAS="with any Strike" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530718850" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TIGHT" OPTIONID="TIGHT" OPTION_ALIAS="with any three maneuvers or a tight group of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530726521" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MARTIAL" OPTIONID="MARTIAL" OPTION_ALIAS="with Martial Maneuvers" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530733513" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MAGIC" OPTIONID="MAGIC" OPTION_ALIAS="with Magic" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530739690" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BROAD" OPTIONID="BROAD" OPTION_ALIAS="with a broadly-defined category of attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530745617" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHDCV" OPTIONID="HTHDCV" OPTION_ALIAS="DCV with HTH or Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530753770" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="DECV" OPTIONID="DECV" OPTION_ALIAS="DECV versus all Mental Powers and attacks" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530761961" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTH" OPTIONID="HTH" OPTION_ALIAS="with HTH Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530769146" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="RANGED" OPTIONID="RANGED" OPTION_ALIAS="with Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530776817" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MENTAL" OPTIONID="MENTAL" OPTION_ALIAS="with Mental Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530785177" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="DCV" OPTIONID="DCV" OPTION_ALIAS="with DCV" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530791249" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWOOCV" OPTIONID="TWOOCV" OPTION_ALIAS="OCV with any two categories of combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530802081" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="TWODCV" OPTIONID="TWODCV" OPTION_ALIAS="DCV with any two categories of combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530808010" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHRANGED" OPTIONID="HTHRANGED" OPTION_ALIAS="with HTH and Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530817810" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HTHMENTAL" OPTIONID="HTHMENTAL" OPTION_ALIAS="with HTH and Mental Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530826562" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="MENTALRANGED" OPTIONID="MENTALRANGED" OPTION_ALIAS="with Mental and Ranged Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="COMBAT_LEVELS" ID="1766530832753" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ALL" OPTIONID="ALL" OPTION_ALIAS="with All Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="SKILL_LEVELS" ID="1766530843073" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="21" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="OVERALL" OPTIONID="OVERALL" OPTION_ALIAS="Overall" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
                            <SKILL XMLID="SKILL_LEVELS" ID="1766596963832" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="22" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="NONCOMBAT" OPTIONID="NONCOMBAT" OPTION_ALIAS="with all non-combat Skills" INCLUDE_NOTES_IN_PRINTOUT="Yes" PARENTID="1766531567248" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                            <NOTES />
                            </SKILL>
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
                        actor = await createQuenchActor({ quench: this, contents, is5e: true, actorType: "pc" });
                    });

                    after(async function () {
                        await deleteQuenchActor({ quench: this, actor });
                    });

                    describe("CSL cslChoices function", function () {
                        it("should return correct choices for SINGLESINGLE CSL", function () {
                            const singleSingleCsl = actor.items.find(
                                (item) =>
                                    item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "SINGLESINGLE",
                            );
                            expect(!!singleSingleCsl).to.be.true;

                            // SINGLESINGLE should only have OCV, no DCV or DC
                            const choices = singleSingleCsl.cslChoices;
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.not.have.property("dcv");
                            expect(choices).to.not.have.property("dc");
                        });

                        it("should return correct choices for SINGLE CSL", function () {
                            const singleCsl = actor.items.find(
                                (item) => item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "SINGLE",
                            );
                            expect(!!singleCsl).to.be.true;

                            // SINGLE should only have OCV, no DCV or DC
                            const choices = singleCsl.cslChoices;
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.not.have.property("dcv");
                            expect(choices).to.not.have.property("dc");
                        });

                        it("should return correct choices for SINGLESTRIKE CSL", function () {
                            const singleCsl = actor.items.find(
                                (item) =>
                                    item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "SINGLESTRIKE",
                            );
                            expect(!!singleCsl).to.be.true;

                            // SINGLE should only have OCV, no DCV or DC
                            const choices = singleCsl.cslChoices;
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.not.have.property("dcv");
                            expect(choices).to.not.have.property("dc");
                        });

                        it("should return correct choices for DCV CSL", function () {
                            const dcvCsl = actor.items.find(
                                (item) => item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "DCV",
                            );
                            expect(!!dcvCsl).to.be.true;

                            // DCV CSL should have OCV, DCV, and DC
                            const choices = dcvCsl.cslChoices;
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.have.property("dcv");
                            expect(choices).to.have.property("dc");
                        });

                        it("should return correct choices for ALL CSL", function () {
                            const allCsl = actor.items.find(
                                (item) => item.system.XMLID === "COMBAT_LEVELS" && item.system.OPTIONID === "ALL",
                            );
                            expect(!!allCsl).to.be.true;

                            // ALL CSL should have OCV, DCV, and DC
                            const choices = allCsl.cslChoices;
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.have.property("dcv");
                            expect(choices).to.have.property("dc");
                        });

                        it("should return correct choices for OVERALL Skill Levels", function () {
                            const overallSl = actor.items.find(
                                (item) => item.system.XMLID === "SKILL_LEVELS" && item.system.OPTIONID === "OVERALL",
                            );
                            expect(!!overallSl).to.be.true;

                            const choices = overallSl.cslChoices;
                            // OVERALL Skill Levels should have all combat values
                            expect(choices).to.have.property("ocv");
                            expect(choices).to.have.property("omcv");
                            expect(choices).to.have.property("dcv");
                            expect(choices).to.have.property("dmcv");
                            expect(choices).to.have.property("dc");
                        });

                        it("should return correct choices for NONCOMBAT Skill Levels", function () {
                            const NonCombatSl = actor.items.find(
                                (item) => item.system.XMLID === "SKILL_LEVELS" && item.system.OPTIONID === "NONCOMBAT",
                            );
                            expect(!!NonCombatSl).to.be.true;

                            // Only OVERALL Skill Levels should have all combat values
                            const choices = NonCombatSl.cslChoices;
                            expect(choices).to.not.have.property("ocv");
                            expect(choices).to.not.have.property("omcv");
                            expect(choices).to.not.have.property("dcv");
                            expect(choices).to.not.have.property("dmcv");
                            expect(choices).to.not.have.property("dc");
                        });
                    });

                    describe("CSL Properties", function () {
                        it("should identify CSL items correctly", function () {
                            const cslSkills = actor.items.filter((item) => item.system.XMLID === "COMBAT_LEVELS");
                            cslSkills.forEach((csl) => {
                                expect(csl.isCsl).to.be.true;
                            });
                        });

                        it("should identify Skill Level items correctly", function () {
                            const skillLevels = actor.items.filter((item) => item.system.XMLID === "SKILL_LEVELS");
                            skillLevels.forEach((sl) => {
                                expect(sl.isCsl).to.be.true;
                            });
                        });

                        it("should have correct LEVELS property", function () {
                            const cslSkills = actor.items.filter((item) => item.system.XMLID === "COMBAT_LEVELS");
                            cslSkills.forEach((csl) => {
                                expect(csl.system.LEVELS).to.equal(1);
                            });
                        });
                    });
                });
            });
        },
        { displayName: "HERO: Combat Skill Levels" },
    );
}
