import { HEROSYS } from "../herosystem6e.js";
import { XmlToItemData } from "../utility/upload_hdc.js";
import { HeroSystem6eActor } from "../actor/actor.js";
import { HeroSystem6eItem } from "../item/item.js";
import { determineDefense } from "../utility/defense.js"

export function registerDefenseTests(quench) {
    quench.registerBatch(
        "quench.utils.defense",
        (context) => {
            const { describe, it, assert } = context



            describe("Resistant Protection", async function () {
                let actor = await HeroSystem6eActor.create({
                    name: 'Test Actor',
                    type: 'pc',
                }, { temporary: true })
                const contents = `
                    <POWER XMLID="FORCEFIELD" ID="1686527339658" BASECOST="0.0" LEVELS="10" ALIAS="Resistant Protection" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="1" EDLEVELS="2" MDLEVELS="3" POWDLEVELS="4">
                    <NOTES />
                    </POWER>
                `;
                // let item = await actor.createEmbeddedDocuments("Item", [{
                //     name: 'Test Item',
                //     type: 'power',
                // }], { parent: actor, temporary: true })
                let item = await HeroSystem6eItem.create({
                    name: 'Test Item',
                    type: 'power',
                }, { parent: actor, temporary: true })
                let item2 = await actor.createEmbeddedDocuments("Item", [
                    {
                        name: 'Foo',
                        type: 'power',
                    }
                ], {temporary: true })

                const parser = new DOMParser()
                const xmlDoc = parser.parseFromString(contents, 'text/xml')
                const itemDefense = XmlToItemData(xmlDoc.children[0], "power")
                itemDefense.system.subType = 'defense'
                itemDefense.system.active = true

                // Actor
                let actor2 = {
                    system: {
                        characteristics: {
                            pd: {
                                value: 0
                            },
                            ed: {
                                value: 0
                            }
                        }
                    },
                    items: [itemDefense]

                }

                it("rPD 1", function () {
                    // Defense PD
                    let attack = {
                        system: {
                            class: "physical"
                        }
                    }
                    let [defenseValue, resistantValue, impenetrableValue, damageReductionValue, damageNegationValue, knockbackResistance, defenseTags] = determineDefense(actor, attack)
                    assert.equal(resistantValue, 1);
                });

                it("rED 2", function () {
                    // Defense ED
                    let attack = {
                        system: {
                            class: "energy"
                        }
                    }
                    let [defenseValue, resistantValue, impenetrableValue, damageReductionValue, damageNegationValue, knockbackResistance, defenseTags] = determineDefense(actor, attack)
                    assert.equal(resistantValue, 2);
                });

                it("rMD 3", function () {
                    // Defense MD
                    let attack = {
                        system: {
                            class: "mental"
                        }
                    }
                    let [defenseValue, resistantValue, impenetrableValue, damageReductionValue, damageNegationValue, knockbackResistance, defenseTags] = determineDefense(actor, attack)
                    assert.equal(resistantValue, 3);
                });

                it("Power Defense 4", function () {
                    // Defense POW
                    let attack = {
                        system: {
                            class: "drain"
                        }
                    }
                    let [defenseValue, resistantValue, impenetrableValue, damageReductionValue, damageNegationValue, knockbackResistance, defenseTags] = determineDefense(actor, attack)
                    assert.equal(resistantValue, 4);
                });


            });
        },
        { displayName: "HERO: Defense" }
    );
}