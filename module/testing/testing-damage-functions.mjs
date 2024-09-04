import { HeroSystem6eActor } from "../actor/actor.mjs";
import { HeroSystem6eItem } from "../item/item.mjs";
import { getDiceFormulaFromItemDC, convertToDcFromItem } from "../utility/damage.mjs";

export function registerDamageFunctionTests(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.damageFunctions",
        (context) => {
            const { assert, before, describe, it } = context;

            const actor = new HeroSystem6eActor({
                name: "Test Actor",
                type: "pc",
            });

            describe("getDiceFormulaFromItemDC", function () {
                describe("invalid inputs", function () {
                    const item = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            killing: true,
                        },
                        parent: actor,
                    });

                    it('""', function () {
                        assert.equal(getDiceFormulaFromItemDC(item, 0), "");
                    });
                });

                describe("killing attacks", function () {
                    const killingItem = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            killing: true,
                        },
                        parent: actor,
                    });

                    it("1", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 1), "1");
                    });

                    it("2", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 2), "½d6");
                    });

                    it("3", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 3), "1d6");
                    });

                    it("4", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 4), "1d6+1");
                    });

                    it("5", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 5), "1½d6");
                    });

                    it("6", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 6), "2d6");
                    });

                    it("7", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 7), "2d6+1");
                    });
                });

                describe("killing attacks with 1d6-1 rather than 1/2d6", function () {
                    const killingItem = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        system: {
                            killing: true,
                            extraDice: "one-pip",
                        },
                        parent: actor,
                    });

                    it("1", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 1), "1");
                    });

                    it("2", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 2), "1d6-1");
                    });

                    it("3", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 3), "1d6");
                    });

                    it("4", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 4), "1d6+1");
                    });

                    it("5", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 5), "2d6-1");
                    });

                    it("6", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 6), "2d6");
                    });

                    it("7", function () {
                        assert.equal(getDiceFormulaFromItemDC(killingItem, 7), "2d6+1");
                    });
                });

                describe("Non killing attacks", function () {
                    const nonKillingItem = new HeroSystem6eItem({
                        name: "Test",
                        type: "attack",
                        parent: actor,
                    });

                    it("0", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 0), "");
                    });

                    it("1", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 1), "1d6");
                    });

                    it("1.2", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 1.2), "1d6+1");
                    });

                    it("1.5", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 1.5), "1½d6");
                    });

                    it("13.2", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 13.2), "13d6+1");
                    });

                    it("20", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 20), "20d6");
                    });

                    it("1234567890.2", function () {
                        assert.equal(getDiceFormulaFromItemDC(nonKillingItem, 1234567890.2), "1234567890d6+1");
                    });
                });
            });

            describe("convertToDcFromItem 6e - Killing Strike", function () {
                const contents = `
                    <MANEUVER XMLID="MANEUVER" ID="1723406694834" BASECOST="4.0" LEVELS="0" ALIAS="Killing Strike" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Killing Strike" OCV="-2" DCV="+0" DC="2" PHASE="1/2" EFFECT="[KILLINGDC]" ADDSTR="Yes" ACTIVECOST="10" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="[WEAPONKILLINGDC]">
                        <NOTES />
                    </MANEUVER>
                `;
                let item;
                before(async () => {
                    const actor = new HeroSystem6eActor(
                        {
                            name: "Quench Actor",
                            type: "pc",
                        },
                        { temporary: true },
                    );
                    await actor._postUpload();

                    item = await new HeroSystem6eItem(HeroSystem6eItem.itemDataFromXml(contents, actor), {
                        temporary: true,
                        parent: actor,
                    });
                    await item._postUpload();
                    actor.items.set(item.system.XMLID, item);
                });

                it("6e Killing Strike dc", function () {
                    // +2DC Killing Strike; +2DC from STR
                    assert.equal(convertToDcFromItem(item).dc, 4);
                });

                it("6e Killing Strike damage", function () {
                    assert.equal(item.system.damage, "1d6+1K");
                });

                it("6e Killing Strike description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -2 OCV, +0 DCV, HKA 1d6+1");
                });
            });

            describe("convertToDcFromItem 5e - Killing Strike", function () {
                const contents = `
                    <MANEUVER XMLID="MANEUVER" ID="1724519971623" BASECOST="4.0" LEVELS="0" ALIAS="Killing Strike" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Killing Strike" OCV="-2" DCV="+0" DC="4" PHASE="1/2" EFFECT="[KILLINGDC]" ADDSTR="Yes" ACTIVECOST="10" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="[WEAPONKILLINGDC]">
                        <NOTES />
                    </MANEUVER>
                `;
                let item;
                before(async () => {
                    const actor = new HeroSystem6eActor(
                        {
                            name: "Quench Actor",
                            type: "pc",
                        },
                        { temporary: true },
                    );
                    actor.system.is5e = true;
                    await actor._postUpload();

                    item = await new HeroSystem6eItem(HeroSystem6eItem.itemDataFromXml(contents, actor), {
                        temporary: true,
                        parent: actor,
                    });
                    await item._postUpload();
                    actor.items.set(item.system.XMLID, item);
                });

                it("5e Killing Strike dc", function () {
                    // +2DC Killing Strike; +2DC from STR
                    assert.equal(convertToDcFromItem(item).dc, 4);
                });

                it("5e Killing Strike damage", function () {
                    assert.equal(item.system.damage, "1d6+1K");
                });

                it("5e Killing Strike description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -2 OCV, +0 DCV, HKA 1d6+1");
                });
            });

            describe("convertToDcFromItem 6e - Martial Strike", function () {
                const contents = `
                    <MANEUVER XMLID="MANEUVER" ID="1724545320876" BASECOST="4.0" LEVELS="0" ALIAS="Martial Strike" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Martial Strike" OCV="+0" DCV="+2" DC="2" PHASE="1/2" EFFECT="[NORMALDC] Strike" ADDSTR="Yes" ACTIVECOST="20" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Weapon [WEAPONDC] Strike">
                        <NOTES />
                    </MANEUVER>
                `;
                let item;
                before(async () => {
                    const actor = new HeroSystem6eActor(
                        {
                            name: "Quench Actor",
                            type: "pc",
                        },
                        { temporary: true },
                    );
                    await actor._postUpload();

                    item = await new HeroSystem6eItem(HeroSystem6eItem.itemDataFromXml(contents, actor), {
                        temporary: true,
                        parent: actor,
                    });
                    await item._postUpload();
                    actor.items.set(item.system.XMLID, item);
                });

                it("6e Martial Strike dc", function () {
                    // +2DC Martial Strike; +2DC from STR
                    assert.equal(convertToDcFromItem(item).dc, 4);
                });

                it("6e Martial Strike damage", function () {
                    assert.equal(item.system.damage, "4d6");
                });

                it("6e Martial Strike description", function () {
                    assert.equal(item.system.description, "1/2 Phase, +0 OCV, +2 DCV, 4d6 Strike");
                });
            });

            describe("NND 6e - Choke Hold", function () {
                const contents = `
                    <MANEUVER XMLID="MANEUVER" ID="1724607722912" BASECOST="4.0" LEVELS="0" ALIAS="Choke Hold" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CATEGORY="Hand To Hand" DISPLAY="Choke Hold" OCV="-2" DCV="+0" DC="4" PHASE="1/2" EFFECT="Grab One Limb; [NNDDC]" ADDSTR="No" ACTIVECOST="20" DAMAGETYPE="0" MAXSTR="0" STRMULT="1" USEWEAPON="No" WEAPONEFFECT="Grab One Limb; [NNDDC]">
                        <NOTES />
                    </MANEUVER>
                `;
                let item;
                before(async () => {
                    const actor = new HeroSystem6eActor(
                        {
                            name: "Quench Actor",
                            type: "pc",
                        },
                        { temporary: true },
                    );
                    await actor._postUpload();

                    item = await new HeroSystem6eItem(HeroSystem6eItem.itemDataFromXml(contents, actor), {
                        temporary: true,
                        parent: actor,
                    });
                    await item._postUpload();
                    actor.items.set(item.system.XMLID, item);
                });

                it("NND Choke Hold dc", function () {
                    // NND (the DC should be halved; suspect because of AVAD/NND implied limitation (e.g. Choke, Nerve Strike)) (note: no str added)
                    assert.equal(convertToDcFromItem(item).dc, 2);
                });

                it("NND Choke Hold damage", function () {
                    assert.equal(item.system.damage, "2d6");
                });

                it("NND Choke Hold description", function () {
                    assert.equal(item.system.description, "1/2 Phase, -2 OCV, +0 DCV, Grab One Limb; 2d6 NND");
                });
            });
        },
        { displayName: "HERO: Damage Functions" },
    );
}
