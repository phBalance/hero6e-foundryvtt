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
                //await actor.uploadFromXml(contents)

                it("name", async function () {
                    await actor.uploadFromXml(contents)
                    assert.equal(actor.name, "5e superhero");
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

        },
        { displayName: "HERO: Full Character Tests" }
    );




}