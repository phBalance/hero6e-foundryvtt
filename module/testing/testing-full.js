import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import { HEROSYS } from "../herosystem6e.js";
import { XmlToItemData, SkillRollUpdateValue, makeAttack, updateItemDescription } from "../utility/upload_hdc.js";
import { convertToDcFromItem } from "../utility/damage.js";

export function registerFullTests(quench) {
    quench.registerBatch(
        "quench.utils.full",
        (context) => {
            const { describe, it, assert } = context

            describe("Characteristics 5e simple", function () {


                const contents = `
                    <?xml version="1.0" encoding="UTF-16"?>
                    <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                    <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                    <CHARACTER_INFO CHARACTER_NAME="5e superhero simple" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                        <STR XMLID="STR" ID="1683328673465" BASECOST="0.0" LEVELS="1" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </STR>
                        <DEX XMLID="DEX" ID="1683328012642" BASECOST="0.0" LEVELS="2" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </DEX>
                        <CON XMLID="CON" ID="1683331008620" BASECOST="0.0" LEVELS="3" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </CON>
                        <BODY XMLID="BODY" ID="1683328674200" BASECOST="0.0" LEVELS="4" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </BODY>
                        <INT XMLID="INT" ID="1683331009492" BASECOST="0.0" LEVELS="5" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </INT>
                        <EGO XMLID="EGO" ID="1683331009412" BASECOST="0.0" LEVELS="6" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </EGO>
                        <PRE XMLID="PRE" ID="1683331008889" BASECOST="0.0" LEVELS="7" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </PRE>
                        <COM XMLID="COM" ID="1683331009574" BASECOST="0.0" LEVELS="8" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </COM>
                        <PD XMLID="PD" ID="1683331009505" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </PD>
                        <ED XMLID="ED" ID="1683331009320" BASECOST="0.0" LEVELS="0" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </ED>
                        <SPD XMLID="SPD" ID="1683328013371" BASECOST="0.0" LEVELS="2" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </SPD>
                        <REC XMLID="REC" ID="1683331009019" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </REC>
                        <END XMLID="END" ID="1683331008978" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </END>
                        <STUN XMLID="STUN" ID="1683331009203" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </STUN>
                        <RUNNING XMLID="RUNNING" ID="1683328673592" BASECOST="0.0" LEVELS="21" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </RUNNING>
                        <SWIMMING XMLID="SWIMMING" ID="1683328673922" BASECOST="0.0" LEVELS="26" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </SWIMMING>
                        <LEAPING XMLID="LEAPING" ID="1683328674010" BASECOST="0.0" LEVELS="27" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                        <NOTES />
                        </LEAPING>
                    </CHARACTERISTICS>
                    <SKILLS />
                    <PERKS />
                    <TALENTS />
                    <MARTIALARTS />
                    <POWERS />
                    <DISADVANTAGES />
                    <EQUIPMENT />
                    </CHARACTER>
                `;
                let actor = new HeroSystem6eActor({
                    name: 'Quench Actor',
                    type: 'pc',
                }, { temporary: true });

                

                it("name", async function () {
                    console.log("name")
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.name, "5e superhero simple");
                });

                it("str.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.max, 11);
                });
                it("str.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.realCost, 1);
                });

                it("dex.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.max, 12);
                });
                it("dex.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.realCost, 6);
                });

                it("con.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.max, 13);
                });
                it("con.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.realCost, 6);
                });

                it("body.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.max, 14);
                });
                it("body.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.realCost, 8);
                });

                it("int.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.max, 15);
                });
                it("int.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.realCost, 5);
                });

                it("ego.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.max, 16);
                });
                it("ego.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.realCost, 12);
                });

                it("pre.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.max, 17);
                });
                it("pre.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.realCost, 7);
                });

                it("com.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.max, 18);
                });
                it("com.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.realCost, 4);
                });

                it("pd.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.max, 2);
                });
                it("pd.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.realCost, 0);
                });

                it("ed.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.max, 3);
                });
                it("ed.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.realCost, 0);
                });

                it("spd.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.max, 4);
                });
                it("spd.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.realCost, 18);
                });

                it("rec.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.max, 5);
                });
                it("rec.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.realCost, 0);
                });

                it("end.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.max, 26);
                });
                it("end.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.realCost, 0);
                });

                it("stun.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.max, 27);
                });
                it("stun.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.realCost, 0);
                });

                it("ocv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.max, 4);
                });
                it("ocv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.realCost, 0);
                });

                it("dcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.max, 4);
                });
                it("dcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.realCost, 0);
                });

                it("omcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.max, 5);
                });
                it("omcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.realCost, 0);
                });

                it("dmcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.max, 5);
                });
                it("dmcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.realCost, 0);
                });

                it("running.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.max, 27);
                });
                it("running.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.realCost, 42);
                });

                it("swimming.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.max, 28);
                });
                it("swimming.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.realCost, 26);
                });

                it("leaping.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.max, 29);
                });
                it("leaping.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.realCost, 27);
                });

                it("realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.realCost, 162);
                });

                it("activePoints", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.activePoints, 162);
                });

            });

            describe("Characteristics 5e buyback", function () {


                const contents = `
                <?xml version="1.0" encoding="UTF-16"?>
                <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                  <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="0" RULES="Default" />
                  <CHARACTER_INFO CHARACTER_NAME="5e superhero" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.46224760379584" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                    <STR XMLID="STR" ID="1683328673465" BASECOST="0.0" LEVELS="-5" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </STR>
                    <DEX XMLID="DEX" ID="1683328012642" BASECOST="0.0" LEVELS="-5" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </DEX>
                    <CON XMLID="CON" ID="1683331008620" BASECOST="0.0" LEVELS="-5" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </CON>
                    <BODY XMLID="BODY" ID="1683328674200" BASECOST="0.0" LEVELS="-5" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </BODY>
                    <INT XMLID="INT" ID="1683331009492" BASECOST="0.0" LEVELS="-5" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </INT>
                    <EGO XMLID="EGO" ID="1683331009412" BASECOST="0.0" LEVELS="-5" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </EGO>
                    <PRE XMLID="PRE" ID="1683331008889" BASECOST="0.0" LEVELS="-5" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </PRE>
                    <COM XMLID="COM" ID="1683331009574" BASECOST="0.0" LEVELS="-5" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </COM>
                    <PD XMLID="PD" ID="1683331009505" BASECOST="0.0" LEVELS="0" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </PD>
                    <ED XMLID="ED" ID="1683331009320" BASECOST="0.0" LEVELS="-1" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </ED>
                    <SPD XMLID="SPD" ID="1683328013371" BASECOST="0.0" LEVELS="0" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </SPD>
                    <REC XMLID="REC" ID="1683331009019" BASECOST="0.0" LEVELS="0" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </REC>
                    <END XMLID="END" ID="1683331008978" BASECOST="0.0" LEVELS="0" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </END>
                    <STUN XMLID="STUN" ID="1683331009203" BASECOST="0.0" LEVELS="0" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </STUN>
                    <RUNNING XMLID="RUNNING" ID="1683328673592" BASECOST="0.0" LEVELS="0" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </RUNNING>
                    <SWIMMING XMLID="SWIMMING" ID="1683328673922" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </SWIMMING>
                    <LEAPING XMLID="LEAPING" ID="1683328674010" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                      <NOTES />
                    </LEAPING>
                  </CHARACTERISTICS>
                  <SKILLS />
                  <PERKS />
                  <TALENTS />
                  <MARTIALARTS />
                  <POWERS />
                  <DISADVANTAGES />
                  <EQUIPMENT />
                </CHARACTER>
                `;
                let actor = new HeroSystem6eActor({
                    name: 'Quench Actor',
                    type: 'pc',
                }, { temporary: true });
                //await actor.uploadFromXml(contents)

                it("name", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.name, "5e superhero");
                });

                it("str.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.max, 5);
                });
                it("str.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.realCost, -5);
                });

                it("dex.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.max, 5);
                });
                it("dex.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.realCost, -15);
                });

                it("con.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.max, 5);
                });
                it("con.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.realCost, -10);
                });

                it("body.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.max, 5);
                });
                it("body.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.realCost, -10);
                });

                it("int.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.max, 5);
                });
                it("int.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.realCost, -5);
                });

                it("ego.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.max, 5);
                });
                it("ego.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.realCost, -10);
                });

                it("pre.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.max, 5);
                });
                it("pre.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.realCost, -5);
                });

                it("com.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.max, 5);
                });
                it("com.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.realCost, -2);
                });

                it("pd.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.max, 1);
                });
                it("pd.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.realCost, 0);
                });

                it("ed.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.max, 0);
                });
                it("ed.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.realCost, -1);
                });

                it("spd.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.max, 1);
                });
                it("spd.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.realCost, 0);
                });

                it("rec.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.max, 2);
                });
                it("rec.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.realCost, 0);
                });

                it("end.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.max, 10);
                });
                it("end.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.realCost, 0);
                });

                it("stun.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.max, 11);
                });
                it("stun.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.realCost, 0);
                });

                it("ocv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.max, 2);
                });
                it("ocv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.realCost, 0);
                });

                it("dcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.max, 2);
                });
                it("dcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.realCost, 0);
                });

                it("omcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.max, 2);
                });
                it("omcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.realCost, 0);
                });

                it("dmcv.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.max, 2);
                });
                it("dmcv.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.realCost, 0);
                });

                it("running.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.max, 6);
                });
                it("running.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.realCost, 0);
                });

                it("swimming.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.max, 2);
                });
                it("swimming.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.realCost, 0);
                });

                it("leaping.max", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.max, 1);
                });
                it("leaping.realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.realCost, 0);
                });

                it("realCost", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.realCost, -63);
                });

                it("activePoints", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.activePoints, -63);
                });

            });


            describe("Enforcer", function () {


                const contents = `
                <?xml version="1.0" encoding="UTF-16"?>
                <CHARACTER version="6.0" TEMPLATE="builtIn.Superheroic.hdt">
                <BASIC_CONFIGURATION BASE_POINTS="200" DISAD_POINTS="150" EXPERIENCE="382" RULES="Default" />
                <CHARACTER_INFO CHARACTER_NAME="Enforcer" ALTERNATE_IDENTITIES="Dima Evtushenko" PLAYER_NAME="GM" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="525ah" GENRE="Fantasy" GM="Raymond">
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
                    <STR XMLID="STR" ID="1125625057687" BASECOST="0.0" LEVELS="45" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </STR>
                    <DEX XMLID="DEX" ID="1125625057688" BASECOST="0.0" LEVELS="10" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </DEX>
                    <CON XMLID="CON" ID="1125625057689" BASECOST="0.0" LEVELS="25" ALIAS="CON" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </CON>
                    <BODY XMLID="BODY" ID="1125625057690" BASECOST="0.0" LEVELS="15" ALIAS="BODY" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </BODY>
                    <INT XMLID="INT" ID="1125625057691" BASECOST="0.0" LEVELS="5" ALIAS="INT" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </INT>
                    <EGO XMLID="EGO" ID="1125625057692" BASECOST="0.0" LEVELS="4" ALIAS="EGO" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </EGO>
                    <PRE XMLID="PRE" ID="1125625057693" BASECOST="0.0" LEVELS="12" ALIAS="PRE" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </PRE>
                    <COM XMLID="COM" ID="1125625057694" BASECOST="0.0" LEVELS="0" ALIAS="COM" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </COM>
                    <PD XMLID="PD" ID="1125625057695" BASECOST="0.0" LEVELS="14" ALIAS="PD" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </PD>
                    <ED XMLID="ED" ID="1125625057696" BASECOST="0.0" LEVELS="13" ALIAS="ED" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </ED>
                    <SPD XMLID="SPD" ID="1125625057697" BASECOST="0.0" LEVELS="2" ALIAS="SPD" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </SPD>
                    <REC XMLID="REC" ID="1125625057698" BASECOST="0.0" LEVELS="3" ALIAS="REC" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </REC>
                    <END XMLID="END" ID="1125625057699" BASECOST="0.0" LEVELS="15" ALIAS="END" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </END>
                    <STUN XMLID="STUN" ID="1125625057700" BASECOST="0.0" LEVELS="54" ALIAS="STUN" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </STUN>
                    <RUNNING XMLID="RUNNING" ID="1125625057701" BASECOST="0.0" LEVELS="2" ALIAS="Running" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </RUNNING>
                    <SWIMMING XMLID="SWIMMING" ID="1125625057702" BASECOST="0.0" LEVELS="0" ALIAS="Swimming" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </SWIMMING>
                    <LEAPING XMLID="LEAPING" ID="1125625057703" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </LEAPING>
                </CHARACTERISTICS>
                <SKILLS>
                    <SKILL XMLID="COMBAT_LEVELS" ID="1125625270718" BASECOST="0.0" LEVELS="5" ALIAS="Combat Skill Levels" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="HTH" OPTIONID="HTH" OPTION_ALIAS="with HTH Combat" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="BREAKFALL" ID="1125625280078" BASECOST="3.0" LEVELS="0" ALIAS="Breakfall" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="CLIMBING" ID="1125625282609" BASECOST="3.0" LEVELS="0" ALIAS="Climbing" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="COMPUTER_PROGRAMMING" ID="1125625285031" BASECOST="3.0" LEVELS="2" ALIAS="Computer Programming" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="CONCEALMENT" ID="1125625291109" BASECOST="3.0" LEVELS="0" ALIAS="Concealment" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="INTERROGATION" ID="1125625316609" BASECOST="3.0" LEVELS="0" ALIAS="Interrogation" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="KNOWLEDGE_SKILL" ID="1125625319687" BASECOST="3.0" LEVELS="0" ALIAS="KS" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Chess" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No" TYPE="General">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="KNOWLEDGE_SKILL" ID="1125625329453" BASECOST="3.0" LEVELS="0" ALIAS="KS" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="The Military/Mercenary/Terrorist World" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No" TYPE="General">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="KNOWLEDGE_SKILL" ID="1125625346671" BASECOST="3.0" LEVELS="0" ALIAS="KS" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="The KGB" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No" TYPE="General">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="LANGUAGES" ID="1125625359359" BASECOST="4.0" LEVELS="0" ALIAS="Language" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="IDIOMATIC" OPTIONID="IDIOMATIC" OPTION_ALIAS="native" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Russian" FAMILIARITY="No" PROFICIENCY="No" NATIVE_TONGUE="Yes">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="LANGUAGES" ID="1125625374750" BASECOST="2.0" LEVELS="0" ALIAS="Language" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="FLUENT" OPTIONID="FLUENT" OPTION_ALIAS="fluent conversation" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="English" FAMILIARITY="No" PROFICIENCY="No" NATIVE_TONGUE="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="MECHANICS" ID="1125625385796" BASECOST="3.0" LEVELS="0" ALIAS="Mechanics" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="PROFESSIONAL_SKILL" ID="1125625389078" BASECOST="3.0" LEVELS="0" ALIAS="PS" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Thug" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="STEALTH" ID="1125625401625" BASECOST="3.0" LEVELS="0" ALIAS="Stealth" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="SURVIVAL" ID="1125625404828" BASECOST="0.0" LEVELS="0" ALIAS="Survival" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">
                    <NOTES />
                    <ADDER XMLID="ARCTIC" ID="1125625439949" BASECOST="2.0" LEVELS="0" ALIAS="Arctic/Subarctic" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="MOUNTAIN" ID="1125625442200" BASECOST="2.0" LEVELS="0" ALIAS="Mountain" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="URBAN" ID="1125625444936" BASECOST="2.0" LEVELS="0" ALIAS="Urban" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </SKILL>
                    <SKILL XMLID="TACTICS" ID="1125625419156" BASECOST="1.0" LEVELS="0" ALIAS="Tactics" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="Yes" PROFICIENCY="No" LEVELSONLY="No" EVERYMAN="No">
                    <NOTES />
                    </SKILL>
                    <SKILL XMLID="TRANSPORT_FAMILIARITY" ID="1125625427531" BASECOST="0.0" LEVELS="0" ALIAS="TF" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                    <NOTES />
                    <ADDER XMLID="COMMONMOTORIZED" ID="1125625466341" BASECOST="2.0" LEVELS="0" ALIAS="Common Motorized Ground Vehicles" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="AIR" ID="1125625474282" BASECOST="0.0" LEVELS="0" ALIAS="Air Vehicles" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="NO">
                        <NOTES />
                        <ADDER XMLID="HELICOPTERS" ID="1125625472529" BASECOST="1.0" LEVELS="0" ALIAS="Helicopters" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                        </ADDER>
                        <ADDER XMLID="SMALLPLANES" ID="1125625474281" BASECOST="1.0" LEVELS="0" ALIAS="Small Planes" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                        </ADDER>
                    </ADDER>
                    <ADDER XMLID="UNCOMMONMOTORIZEDGROUNDVEHICLES" ID="1125625479349" BASECOST="0.0" LEVELS="0" ALIAS="Uncommon Motorized Ground Vehicles" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="NO">
                        <NOTES />
                        <ADDER XMLID="TRACKEDMILITARY" ID="1125625476533" BASECOST="1.0" LEVELS="0" ALIAS="Tracked Military Vehicles" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                        </ADDER>
                        <ADDER XMLID="WHEELEDMILITARY" ID="1125625479348" BASECOST="1.0" LEVELS="0" ALIAS="Wheeled Military Vehicles" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                        </ADDER>
                    </ADDER>
                    </SKILL>
                    <SKILL XMLID="WEAPON_FAMILIARITY" ID="1125625450265" BASECOST="0.0" LEVELS="0" ALIAS="WF" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
                    <NOTES />
                    <ADDER XMLID="SMALLARMS" ID="1125625491552" BASECOST="2.0" LEVELS="0" ALIAS="Small Arms" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </SKILL>
                </SKILLS>
                <PERKS>
                    <PERK XMLID="CONTACT" ID="1125625196265" BASECOST="0.0" LEVELS="2" ALIAS="Contact" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="old KGB Colonel">
                    <NOTES />
                    <ADDER XMLID="ACCESSTOINSTITUTIONS" ID="1125625241948" BASECOST="1.0" LEVELS="0" ALIAS="Contact has access to major institutions" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="GOODRELATIONSHIP" ID="1125625243918" BASECOST="1.0" LEVELS="0" ALIAS="Good relationship with Contact" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </PERK>
                    <PERK XMLID="FOLLOWER" ID="1125625215265" BASECOST="0.0" LEVELS="0" ALIAS="Followers: 16 agents built on 25 Base Points plus 25 points from Disadvantages" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" NUMBER="16" BASEPOINTS="25" DISADPOINTS="25">
                    <NOTES />
                    </PERK>
                    <PERK XMLID="MONEY" ID="1125625263859" BASECOST="5.0" LEVELS="0" ALIAS="Money" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="WELL_OFF" OPTIONID="WELL_OFF" OPTION_ALIAS="Well Off" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                    <NOTES />
                    </PERK>
                </PERKS>
                <TALENTS />
                <MARTIALARTS>
                    <EXTRADC XMLID="EXTRADC" ID="1695412964884" BASECOST="0.0" LEVELS="2" ALIAS="+2 HTH Damage Class(es)" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                    <NOTES />
                    </EXTRADC>
                    <MANEUVER XMLID="MANEUVER" ID="1695412983750" BASECOST="5.0" LEVELS="0" ALIAS="Defensive Block" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Defensive Block" OCV="+1" DCV="+3" DC="0" PHASE="1/2" EFFECT="Block, Abort" ADDSTR="No" ACTIVECOST="25" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Block, Abort">
                    <NOTES />
                    </MANEUVER>
                    <MANEUVER XMLID="MANEUVER" ID="1695412989539" BASECOST="5.0" LEVELS="0" ALIAS="Defensive Strike" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Defensive Strike" OCV="+1" DCV="+3" DC="0" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="20" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                    <NOTES />
                    </MANEUVER>
                    <MANEUVER XMLID="MANEUVER" ID="1695412995677" BASECOST="5.0" LEVELS="0" ALIAS="Flying Dodge" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Flying Dodge" OCV="--" DCV="+4" DC="0" PHASE="1/2" EFFECT="Dodge All Attacks, Abort; FMove" ADDSTR="No" ACTIVECOST="50" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No">
                    <NOTES />
                    </MANEUVER>
                    <MANEUVER XMLID="MANEUVER" ID="1695413002849" BASECOST="5.0" LEVELS="0" ALIAS="Joint Break" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Joint Break" OCV="-1" DCV="-2" DC="4" PHASE="1/2" EFFECT="Grab One Limb; [KILLINGDC], Disable" ADDSTR="Yes" ACTIVECOST="0" DAMAGETYPE="0" MAXSTR="30" STRMULT="1" USEWEAPON="No">
                    <NOTES />
                    </MANEUVER>
                    <MANEUVER XMLID="MANEUVER" ID="1695413008772" BASECOST="5.0" LEVELS="0" ALIAS="Offensive Strike" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Offensive Strike" OCV="-2" DCV="+1" DC="4" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="15" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                    <NOTES />
                    </MANEUVER>
                    <MANEUVER XMLID="MANEUVER" ID="1695413043628" BASECOST="5.0" LEVELS="0" ALIAS="Takeaway" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Takeaway" OCV="+0" DCV="+0" DC="2" PHASE="1/2" EFFECT="Grab Weapon, [STRDC] to take weapon away" ADDSTR="Yes" ACTIVECOST="5" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Grab Weapon, [STRDC] to take weapon away">
                    <NOTES />
                    </MANEUVER>
                </MARTIALARTS>
                <POWERS>
                    <POWER XMLID="ARMOR" ID="1125625114765" BASECOST="0.0" LEVELS="42" ALIAS="Armor" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Natural Toughness" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="21" EDLEVELS="21">
                    <NOTES />
                    </POWER>
                    <POWER XMLID="DAMAGEREDUCTION" ID="1695412788508" BASECOST="60.0" LEVELS="0" ALIAS="Damage Reduction" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="LVL75RESISTANT" OPTIONID="LVL75RESISTANT" OPTION_ALIAS="Damage Reduction, Resistant, 75%" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Natural Tuffness" INPUT="Energy" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </POWER>
                    <POWER XMLID="DAMAGEREDUCTION" ID="1695412809652" BASECOST="60.0" LEVELS="0" ALIAS="Damage Reduction" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="LVL75RESISTANT" OPTIONID="LVL75RESISTANT" OPTION_ALIAS="Damage Reduction, Resistant, 75%" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Natural Tuffness" INPUT="Physical" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    </POWER>
                    <POWER XMLID="HEALING" ID="1125625126750" BASECOST="0.0" LEVELS="1" ALIAS="Healing" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Fast Healing" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    <MODIFIER XMLID="REDUCEDEND" ID="1125625168197" BASECOST="0.5" LEVELS="0" ALIAS="Reduced Endurance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="ZERO" OPTIONID="ZERO" OPTION_ALIAS="0 END" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                        <NOTES />
                    </MODIFIER>
                    <MODIFIER XMLID="PERSISTENT" ID="1125625176030" BASECOST="0.5" LEVELS="0" ALIAS="Persistent" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                        <NOTES />
                    </MODIFIER>
                    <MODIFIER XMLID="REGENEXTRATIME" ID="1125625181954" BASECOST="-1.25" LEVELS="0" ALIAS="Extra Time" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="TURN" OPTIONID="TURN" OPTION_ALIAS="1 Turn (Post-Segment 12)" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                        <NOTES />
                    </MODIFIER>
                    <MODIFIER XMLID="SELFONLY" ID="1125625190104" BASECOST="-0.5" LEVELS="0" ALIAS="Self Only" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
                        <NOTES />
                    </MODIFIER>
                    </POWER>
                    <RUNNING XMLID="RUNNING" ID="1125625165984" BASECOST="0.0" LEVELS="5" ALIAS="Running" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Head Of Steam" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes" ADD_MODIFIERS_TO_BASE="No">
                    <NOTES />
                    </RUNNING>
                    <POWER XMLID="LIFESUPPORT" ID="1125625177656" BASECOST="0.0" LEVELS="0" ALIAS="LS" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="Enhanced Physiology" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
                    <NOTES />
                    <ADDER XMLID="HIGHPRESSURE" ID="1125625217704" BASECOST="1.0" LEVELS="0" ALIAS="Safe in High Pressure" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="INTENSECOLD" ID="1125625219986" BASECOST="2.0" LEVELS="0" ALIAS="Safe in Intense Cold" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="INTENSEHEAT" ID="1125625221706" BASECOST="2.0" LEVELS="0" ALIAS="Safe in Intense Heat" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="LOWPRESSUREVACUUM" ID="1125625223113" BASECOST="2.0" LEVELS="0" ALIAS="Safe in Low Pressure/Vacuum" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </POWER>
                </POWERS>
                <DISADVANTAGES>
                    <DISAD XMLID="HUNTED" ID="1125625462875" BASECOST="0.0" LEVELS="0" ALIAS="Hunted" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="KGB">
                    <NOTES />
                    <ADDER XMLID="APPEARANCE" ID="1125625498401" BASECOST="0.0" LEVELS="0" ALIAS="Appearance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="EIGHT" OPTIONID="EIGHT" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="CAPABILITIES" ID="1125625498407" BASECOST="10.0" LEVELS="0" ALIAS="Capabilities" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="AS" OPTIONID="AS" OPTION_ALIAS="(As Pow" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="MOTIVATION" ID="1125625498414" BASECOST="0.0" LEVELS="0" ALIAS="Motivation" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="CAPTURE" OPTIONID="CAPTURE" OPTION_ALIAS="Capture" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="NCI" ID="1125625505144" BASECOST="5.0" LEVELS="0" ALIAS="NCI" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="No" INCLUDEINBASE="No" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </DISAD>
                    <DISAD XMLID="HUNTED" ID="1125625479890" BASECOST="0.0" LEVELS="0" ALIAS="Hunted" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Stalnoy Volk">
                    <NOTES />
                    <ADDER XMLID="APPEARANCE" ID="1125625515707" BASECOST="0.0" LEVELS="0" ALIAS="Appearance" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="EIGHT" OPTIONID="EIGHT" OPTION_ALIAS="8-" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="CAPABILITIES" ID="1125625515713" BASECOST="15.0" LEVELS="0" ALIAS="Capabilities" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="MORE" OPTIONID="MORE" OPTION_ALIAS="(Mo Pow" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="MOTIVATION" ID="1125625515720" BASECOST="0.0" LEVELS="0" ALIAS="Motivation" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="CAPTURE" OPTIONID="CAPTURE" OPTION_ALIAS="Capture" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </DISAD>
                    <DISAD XMLID="PSYCHOLOGICALLIMITATION" ID="1125625499328" BASECOST="0.0" LEVELS="0" ALIAS="Psychological Limitation" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Greedy">
                    <NOTES />
                    <ADDER XMLID="SITUATION" ID="1125625535408" BASECOST="15.0" LEVELS="0" ALIAS="Situation Is" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="VERYCOMMON" OPTIONID="VERYCOMMON" OPTION_ALIAS="(Very Common" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="INTENSITY" ID="1125625535414" BASECOST="5.0" LEVELS="0" ALIAS="Intensity Is" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="STRONG" OPTIONID="STRONG" OPTION_ALIAS="Strong" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </DISAD>
                    <DISAD XMLID="PSYCHOLOGICALLIMITATION" ID="1125625511718" BASECOST="0.0" LEVELS="0" ALIAS="Psychological Limitation" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Sadistic">
                    <NOTES />
                    <ADDER XMLID="SITUATION" ID="1125625547964" BASECOST="10.0" LEVELS="0" ALIAS="Situation Is" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="COMMON" OPTIONID="COMMON" OPTION_ALIAS="(Common" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    <ADDER XMLID="INTENSITY" ID="1125625547970" BASECOST="5.0" LEVELS="0" ALIAS="Intensity Is" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" OPTION="STRONG" OPTIONID="STRONG" OPTION_ALIAS="Strong" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="Yes" GROUP="No" SELECTED="YES">
                        <NOTES />
                    </ADDER>
                    </DISAD>
                    <DISAD XMLID="UNLUCK" ID="1125625524500" BASECOST="0.0" LEVELS="2" ALIAS="Unluck: 2d6" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="No" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="">
                    <NOTES />
                    </DISAD>
                </DISADVANTAGES>
                <EQUIPMENT />
                </CHARACTER>


                `;
                
                //await actor.uploadFromXml(contents)

                it("name", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.name, "Enforcer");
                });

                it("str.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.max, 55);
                });
                it("str.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.str.realCost, 45);
                });

                it("dex.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.max, 20);
                });
                it("dex.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dex.realCost, 30);
                });

                it("con.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.max, 35);
                });
                it("con.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.con.realCost, 50);
                });

                it("body.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.max, 25);
                });
                it("body.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.body.realCost, 30);
                });

                it("int.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.max, 15);
                });
                it("int.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.int.realCost, 5);
                });

                it("ego.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.max, 14);
                });
                it("ego.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ego.realCost, 8);
                });

                it("pre.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.max, 22);
                });
                it("pre.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pre.realCost, 12);
                });

                it("com.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.max, 10);
                });
                it("com.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.com.realCost, 0);
                });

                it("pd.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.max, 25);
                });
                it("pd.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.pd.realCost, 14);
                });

                it("ed.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.max, 20);
                });
                it("ed.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ed.realCost, 13);
                });

                it("spd.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.max, 5);
                });
                it("spd.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.spd.realCost, 20);
                });

                it("rec.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.max, 21);
                });
                it("rec.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.rec.realCost, 6);
                });

                it("end.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.max, 85);
                });
                it("end.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.end.realCost, 8);
                });

                it("stun.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.max, 125);
                });
                it("stun.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.stun.realCost, 54);
                });

                it("ocv.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.max, 7);
                });
                it("ocv.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.ocv.realCost, 0);
                });

                it("dcv.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.max, 7);
                });
                it("dcv.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dcv.realCost, 0);
                });

                it("omcv.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.max, 5);
                });
                it("omcv.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.omcv.realCost, 0);
                });

                it("dmcv.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.max, 5);
                });
                it("dmcv.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.dmcv.realCost, 0);
                });

                it("running.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.max, 8);
                });
                it("running.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.running.realCost, 4);
                });

                it("swimming.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.max, 2);
                });
                it("swimming.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.swimming.realCost, 0);
                });

                it("leaping.max", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.max, 11);
                });
                it("leaping.realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.characteristics.leaping.realCost, 0);
                });

                it("realCost", async function () {
                    const actor = new HeroSystem6eActor({
                        name: 'Quench Actor',
                        type: 'pc',
                    }, { temporary: true });
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.system.realCost, 675);
                });

            });



        },
        { displayName: "HERO: Full Character Tests" }
    );
}