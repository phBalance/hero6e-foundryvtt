import { createQuenchActor } from "./quench-helper.mjs";

import { getCharacteristicInfoArrayForActor } from "../utility/util.mjs";

export function registerVehicleTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.actor.vehicle",
        (context) => {
            const { before, describe, expect, it } = context;

            describe.only("Vehicle Characteristics", function () {
                // The default timeout tends to be insufficient with multiple actors being created at the same time.
                this.timeout(20000);

                describe("6e ARC-170 Starfighter", async function () {
                    const contents = `
                        <?xml version="1.0" encoding="UTF-16"?>
                        <CHARACTER version="6.0" TEMPLATE="builtIn.Vehicle6E.hdt">
                          <BASIC_CONFIGURATION BASE_POINTS="150" DISAD_POINTS="0" EXPERIENCE="0" RULES="Default" />
                          <CHARACTER_INFO CHARACTER_NAME="TEST ARC-170 Starfighter" ALTERNATE_IDENTITIES="" PLAYER_NAME="" HEIGHT="78.74015748031496" WEIGHT="220.4622476037958" HAIR_COLOR="Brown" EYE_COLOR="Brown" CAMPAIGN_NAME="" GENRE="" GM="">
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
                            <SIZE XMLID="SIZE" ID="1764554705399" BASECOST="0.0" LEVELS="8" ALIAS="Size" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </SIZE>
                            <STR XMLID="STR" ID="1764554705302" BASECOST="0.0" LEVELS="-50" ALIAS="STR" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </STR>
                            <DEX XMLID="DEX" ID="1764554705479" BASECOST="0.0" LEVELS="-10" ALIAS="DEX" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </DEX>
                            <BODY XMLID="BODY" ID="1764554705292" BASECOST="0.0" LEVELS="0" ALIAS="BODY" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </BODY>
                            <SPD XMLID="SPD" ID="1764554705648" BASECOST="0.0" LEVELS="3" ALIAS="SPD" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </SPD>
                            <OCV XMLID="OCV" ID="1764554705538" BASECOST="0.0" LEVELS="2" ALIAS="OCV" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </OCV>
                            <DCV XMLID="DCV" ID="1764554705156" BASECOST="0.0" LEVELS="4" ALIAS="DCV" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </DCV>
                            <PD XMLID="PD" ID="1764554705702" BASECOST="0.0" LEVELS="2" ALIAS="PD" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </PD>
                            <ED XMLID="ED" ID="1764554705151" BASECOST="0.0" LEVELS="2" ALIAS="ED" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </ED>
                            <RUNNING XMLID="RUNNING" ID="1764554705215" BASECOST="0.0" LEVELS="-12" ALIAS="Ground Movement" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </RUNNING>
                            <SWIMMING XMLID="SWIMMING" ID="1764554705069" BASECOST="0.0" LEVELS="-4" ALIAS="Swimming" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </SWIMMING>
                            <LEAPING XMLID="LEAPING" ID="1764554705539" BASECOST="0.0" LEVELS="0" ALIAS="Leaping" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </LEAPING>
                          </CHARACTERISTICS>
                          <SKILLS />
                          <PERKS />
                          <TALENTS />
                          <MARTIALARTS />
                          <POWERS>
                            <POWER XMLID="FLIGHT" ID="1764555963102" BASECOST="0.0" LEVELS="106" ALIAS="Flight" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="IGP-440a Ion Turbine Engines" QUANTITY="1" AFFECTS_PRIMARY="Yes" AFFECTS_TOTAL="Yes">
                              <NOTES />
                            </POWER>
                          </POWERS>
                          <DISADVANTAGES />
                          <EQUIPMENT />
                        </CHARACTER>
                    `;

                    let actor;
                    before(async function () {
                        actor = await createQuenchActor({ quench: this, contents, is5e: false, actorType: "vehicle" });
                    });

                    it("should have the SIZE characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "SIZE")).to.be.true;
                    });

                    it("should have the correct SIZE characteristic value", function () {
                        expect(actor.system.characteristics.size.value).to.equal(8);
                    });

                    it("should have the correct SIZE cost", function () {
                        expect(actor.system.characteristics.size.realCost).to.equal(40);
                    });

                    it("should have the STR characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "STR")).to.be.true;
                    });

                    it("should have the correct STR characteristic value", function () {
                        expect(actor.system.characteristics.str.value).to.equal(0);
                    });

                    it("should have the correct STR cost", function () {
                        expect(actor.system.characteristics.str.realCost).to.equal(-50);
                    });

                    it("should have the DEX characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "DEX")).to.be.true;
                    });

                    it("should have the correct DEX characteristic value", function () {
                        expect(actor.system.characteristics.dex.value).to.equal(0);
                    });

                    it("should have the correct DEX cost", function () {
                        expect(actor.system.characteristics.dex.realCost).to.equal(-20);
                    });

                    it("should have the BODY characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "BODY")).to.be.true;
                    });

                    it("should have the correct BODY characteristic value", function () {
                        expect(actor.system.characteristics.body.value).to.equal(18);
                    });

                    it("should have the correct BODY cost", function () {
                        expect(actor.system.characteristics.body.realCost).to.equal(0);
                    });

                    it("should have the SPD characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "SPD")).to.be.true;
                    });

                    it("should have the correct SPD characteristic value", function () {
                        expect(actor.system.characteristics.spd.value).to.equal(5);
                    });

                    it("should have the correct SPD cost", function () {
                        expect(actor.system.characteristics.spd.realCost).to.equal(30);
                    });

                    it("should have the OCV characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "OCV")).to.be.true;
                    });

                    it("should have the correct OCV characteristic value", function () {
                        expect(actor.system.characteristics.ocv.value).to.equal(5);
                    });

                    it("should have the correct OCV cost", function () {
                        expect(actor.system.characteristics.ocv.realCost).to.equal(10);
                    });

                    it("should have the DCV characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "DCV")).to.be.true;
                    });

                    it("should have the correct DCV characteristic value", function () {
                        expect(actor.system.characteristics.dcv.value).to.equal(7);
                    });

                    it("should have the correct DCV cost", function () {
                        expect(actor.system.characteristics.dcv.realCost).to.equal(20);
                    });

                    it("should have the PD characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "PD")).to.be.true;
                    });

                    it("should have the correct PD characteristic value", function () {
                        expect(actor.system.characteristics.pd.value).to.equal(4);
                    });

                    it("should have the correct PD cost", function () {
                        expect(actor.system.characteristics.pd.realCost).to.equal(3);
                    });

                    it("should have the ED characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "ED")).to.be.true;
                    });

                    it("should have the correct ED characteristic value", function () {
                        expect(actor.system.characteristics.ed.value).to.equal(4);
                    });

                    it("should have the correct ED cost", function () {
                        expect(actor.system.characteristics.size.realCost).to.equal(3);
                    });

                    it("should NOT have the STUN characteristic", function () {
                        expect(!!getCharacteristicInfoArrayForActor(actor).find((o) => o.key === "STUN")).to.be.false;
                    });

                    it("should have Flight power", function () {
                        const hasFlightPower = !!actor.items.find((item) => item.system.XMLID === "FLIGHT");
                        expect(hasFlightPower).to.be.true;
                    });
                });
            });
        },
        { displayName: "HERO: Vehicle" },
    );
}
