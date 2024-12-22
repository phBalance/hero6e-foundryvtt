import { HeroSystem6eItem } from "../item/item.mjs";
import { determineCostPerActivePoint } from "../utility/adjustment.mjs";

export class HeroSystem6eEndToEndTest {
    sceneName = "EndToEndTest";
    //scene;
    actor5Name = "_EndToEndTest5";
    actor6Name = "_EndToEndTest6";
    // actor5;
    // actor6;
    // orderedListElement;

    delay = (ms) => new Promise((res) => setTimeout(res, ms || 100));

    async start() {
        await new Dialog({
            title: `End To End Testing`,
            content: `<div style="height:400px; overflow-y:scroll"><ol class="end-to-end-testing">
                <li>Init</li>
            </ol></div>`,
            buttons: {
                ok: {
                    label: "OK",
                },
            },
        }).render(true);

        for (let i = 0; i < 50; i++) {
            if ((this.orderedListElement = $(".dialog .end-to-end-testing")).length > 0) break;
            await this.delay();
        }
        this.orderedListElement.closest(".dialog").addClass("end-to-end-testing");
        //$(".dialog.end-to-end-testing").css("left", 5);

        await this.performTests();
    }

    async performTests() {
        await this.createTestScene();
        await this.createTestActors();
        if (!(await this.testAid(this.token6, "STR"))) return;
        if (!(await this.testAid(this.token6, "PD"))) return;
        if (!(await this.testAid(this.token6, "END"))) return;
        if (!(await this.testAid(this.token6, "DEX"))) return;
        if (!(await this.testAid(this.token5, "DEX"))) return;
    }

    log(text, css) {
        console.log(text);
        this.orderedListElement.append(`<li style="${css}">${text}</li>`);
    }

    async createTestScene() {
        this.scene = game.scenes.find((s) => s.name === this.sceneName);
        if (this.scene) {
            this.log(`Deleting Scene '${this.sceneName}'`);
            this.scene.delete();
        }
        this.scene = await Scene.create({
            name: "EndToEndTest",
            width: 1000,
            height: 500,
        });
        this.log(`Created scene: ${this.sceneName}`);

        await this.scene.view();

        // Remove all tokens
        // for (const token of this.scene.tokens) {
        //     await token.delete();
        // }
    }

    async createTestActors() {
        // Scene Center
        const x = Math.floor(this.scene.dimensions.width / 200) * 100;
        const y = Math.floor(this.scene.dimensions.height / 200) * 100;

        // 5e
        for (const actor of game.actors.filter((a) => a.name === this.actor5Name)) {
            this.log(`Deleting ${actor.name}`);
            await actor.delete();
        }
        this.log(`Creating ${this.actor5Name}`);
        this.actor5 = await Actor.create({
            name: this.actor5Name,
            type: "npc",
        });
        await this.actor5.update({ "system.is5e": true });
        await TokenDocument.create(
            {
                name: this.actor5.name.replace("_", ""),
                actorId: this.actor5.id,
                x: x - 100,
                y,
                displayName: foundry.CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            },
            { parent: this.scene },
        );
        this.token5 = this.actor5.getActiveTokens()[0];

        // 6e
        for (const actor of game.actors.filter((a) => a.name === this.actor6Name)) {
            this.log(`Deleting ${actor.name}`);
            await actor.delete();
        }
        this.log(`Creating ${this.actor6Name}`);
        this.actor6 = await Actor.create({
            name: this.actor6Name,
            type: "pc",
            system: {
                is5e: false,
            },
        });
        await TokenDocument.create(
            {
                name: this.actor6.name.replace("_", ""),
                actorId: this.actor6.id,
                x: x + 100,
                y,
                displayName: foundry.CONST.TOKEN_DISPLAY_MODES.ALWAYS,
            },
            { parent: this.scene },
        );
        this.token6 = this.actor6.getActiveTokens()[0];
    }

    async testAid(token, XMLID) {
        // Create AID
        const xml = `
            <POWER XMLID="AID" ID="1734814179562" BASECOST="0.0" LEVELS="2" ALIAS="Aid" POSITION="1" 
            MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" 
            INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="${XMLID}" USESTANDARDEFFECT="No" QUANTITY="1" 
            AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            </POWER>
        `;
        const itemData = HeroSystem6eItem.itemDataFromXml(xml, token.actor);
        const aidItem = await HeroSystem6eItem.create(itemData, { parent: token.actor });
        await aidItem._postUpload();
        this.log(`Added <b>${aidItem.name}</b> to <b>${aidItem.actor.name}</b>`);

        // Target ourselves
        await game.user.updateTokenTargets([token.id]);
        // await game.user.broadcastActivity({
        //     targets: [this.token6.id],
        // });

        // Roll
        await aidItem.roll();

        // Wait for application to render then Click "Roll to Hit"
        let button;
        for (let i = 0; i < 50; i++) {
            if ((button = $("#item-attack-form-application button")).length === 1) break;
            await this.delay();
        }
        button.click();
        this.log(`<b>${aidItem.name}</b> toHit`);

        // Wait for chat chard then Roll AID
        for (let i = 0; i < 50; i++) {
            if (
                (button = $(`ol#chat-log .chat-message:last-child button.roll-damage[data-item-id='${aidItem.uuid}']`))
                    .length === 1
            )
                break;
            await this.delay();
        }
        button.click();
        this.log(`Roll <b>${aidItem.name}</b>`);

        // Wait for chat chard then Apply AID
        for (let i = 0; i < 50; i++) {
            if (
                (button = $(
                    `ol#chat-log .chat-message:last-child button.apply-damage[data-item-id='${aidItem.uuid}']:last-child`,
                )).length === 1
            )
                break;
            await this.delay();
        }
        button.click();
        this.log(`Apply <b>${aidItem.name}</b>`);

        // Get AID Active Effect
        let aidActiveEffect;
        for (let i = 0; i < 50; i++) {
            if ((aidActiveEffect = token.actor.temporaryEffects?.[0])) break;
            await this.delay();
        }
        this.log(`Active Effect: ${aidActiveEffect.changes[0].key} ${aidActiveEffect.changes[0].value}`);

        // Confirm Characteristic has been aided
        let aidValue = parseInt(aidActiveEffect.changes[0].value);
        let aidActivePoints = -aidActiveEffect.flags.adjustmentActivePoints;
        let actorCharaisticValue = token.actor.system.characteristics[XMLID.toLowerCase()].core + aidValue;
        if (token.actor.system.characteristics[XMLID.toLowerCase()].value !== actorCharaisticValue) {
            this.log(`FAIL: ${XMLID.toLowerCase()}.value !== actorCharaisticValue`, "color:red");
            return;
        }

        if (aidActiveEffect.changes.length !== 1) {
            this.log(`FAIL: AE has more than 1 change`, "color:red");
            return;
        }

        const costPerActivePoint = determineCostPerActivePoint(XMLID, null, token.actor);
        // if (aidActiveEffect.flags.costPerActivePoint !== costPerActivePoint) {
        //     this.log(
        //         `FAIL costPerActivePoint: ${aidActiveEffect.flags.costPerActivePoint} !== ${costPerActivePoint}`,
        //         "color:red",
        //     );
        //     return;
        // }

        //const saveWorldTime = game.time.worldTime;

        while (aidValue !== 0) {
            // Make sure AP = change.value
            if (parseInt(aidActiveEffect.changes[0].value) !== -aidActiveEffect.flags.affectedPoints) {
                this.log(
                    `FAIL aidActiveEffect.flags.affectedPoints: ${aidActiveEffect.changes[0].value} !== ${-aidActiveEffect.flags.affectedPoints}`,
                    "color:red",
                );
                return;
            }

            if (aidActivePoints !== -aidActiveEffect.flags.adjustmentActivePoints) {
                this.log(
                    `FAIL aidActivePoints: ${aidActivePoints} !== ${-aidActiveEffect.flags.adjustmentActivePoints}`,
                    "color:red",
                );
                return;
            }

            if (
                parseInt(aidActiveEffect.changes[0].value) !==
                Math.floor(-aidActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)
            ) {
                this.log(
                    `FAIL aidActiveEffect.changes[0].value: ${aidActiveEffect.changes[0].value} !== ${Math.floor(-aidActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)})`,
                    "color:red",
                );
                return;
            }

            if (
                -aidActiveEffect.flags.affectedPoints !==
                Math.floor(-aidActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)
            ) {
                this.log(
                    `FAIL aidActiveEffect.flags.affectedPoints: ${-aidActiveEffect.flags.affectedPoints} !== ${Math.floor(-aidActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)})`,
                    "color:red",
                );
                return;
            }

            // Advance world time 12 seconds
            this.log(`worldTime + 12 seconds`);
            await game.time.advance(12);

            // Wait for AE to update/fade
            for (let i = 0; i < 50; i++) {
                if (token.actor.system.characteristics[XMLID.toLowerCase()].value !== actorCharaisticValue) break;
                await this.delay();
            }
            aidActiveEffect = token.actor.temporaryEffects?.[0]; // Make sure we have latest updates

            if (aidActiveEffect && aidActiveEffect.changes.length !== 1) {
                this.log(`FAIL: AE has more than 1 change`, "color:red");
                return;
            }

            // Check for fade
            this.log(`Active Effect: ${aidActiveEffect?.changes[0].key} ${aidActiveEffect?.changes[0].value}`);
            const newAidActivePoints = Math.max(0, aidActivePoints - 5);
            // const aidNewValue = aidActiveEffect
            //     ? Math.max(0, Math.floor(-aidActiveEffect.flags.adjustmentActivePoints - 5 / costPerActivePoint))
            //     : 0;
            const aidNewValue = Math.floor(newAidActivePoints / costPerActivePoint);
            // const actorNewCharacteristicValue = Math.max(
            //     token.actor.system.characteristics[XMLID.toLowerCase()].core,
            //     actorCharaisticValue - 5 / costPerActivePoint,
            // );
            const actorNewCharacteristicValue =
                token.actor.system.characteristics[XMLID.toLowerCase()].core + aidNewValue;
            if (
                (!aidActiveEffect && aidNewValue === 0) ||
                token.actor.system.characteristics[XMLID.toLowerCase()].value === actorNewCharacteristicValue
            ) {
                this.log(
                    `Fade from ${aidValue} to ${aidNewValue} was successful. ${XMLID}=${actorNewCharacteristicValue}`,
                );
            } else {
                this.log(
                    `Expected actor ${XMLID}=${actorNewCharacteristicValue} got ${token.actor.system.characteristics[XMLID.toLowerCase()].value}`,
                    "color:red",
                );
                this.log(`Expected change.value=${aidNewValue} got ${aidActiveEffect?.changes[0].value}`, "color:red");
                return;
            }

            // fade again?
            aidActivePoints = newAidActivePoints;
            aidValue = parseInt(aidActiveEffect?.changes[0].value || 0);
            actorCharaisticValue = token.actor.system.characteristics[XMLID.toLowerCase()].core + aidValue;
        }
        this.log(`AID Active Effect <b>${XMLID}</b> for <b>${token.actor.name}</b>: Fade completed succesfully`);

        return true; // true = success
    }
}
