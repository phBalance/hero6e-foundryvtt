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

            describe("Characteristics 5e", function () {


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
                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const item = XmlToItemData(xmlDoc.children[0], "power")

                it("realCost", function () {
                    assert.equal(item.system.realCost, "20");
                });

                it("activePoints", function () {
                    assert.equal(item.system.activePoints, "35");
                });
            });

        },
        { displayName: "HERO: Full Character Tests" }
    );




}