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
        $(".dialog.end-to-end-testing").css("left", 5);

        await this.performTests();
    }

    async performTests() {
        await this.createTestScene();
        await this.createTestActors();

        // AID
        if (!(await this.testAdjustment(this.token6, this.token5, "AID", "STR"))) return;
        if (!(await this.testAdjustment(this.token6, this.token5, "AID", "PD"))) return;
        if (!(await this.testAdjustment(this.token6, this.token5, "AID", "END"))) return;
        if (!(await this.testAdjustment(this.token6, this.token5, "AID", "DEX"))) return;
        if (!(await this.testAdjustment(this.token5, this.token5, "AID", "DEX"))) return;

        // reset actors
        await this.token5.actor.FullHealth();
        await this.token6.actor.FullHealth();

        // DRAIN
        if (!(await this.testAdjustment(this.token6, this.token5, "DRAIN", "STR"))) return;
        if (!(await this.testAdjustment(this.token6, this.token5, "DRAIN", "DEX"))) return;
        if (!(await this.testAdjustment(this.token5, this.token6, "DRAIN", "DEX"))) return;
    }

    log(text, css) {
        if (css) {
            console.error(text);
        } else {
            console.log(text);
        }

        this.orderedListElement.append(`<li style="${css}">${text}</li>`);
        //el[0].scrollIntoView();
        $(`.dialog .end-to-end-testing li:last-child`)[0].scrollIntoView();
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

    async testAdjustment(tokenSource, tokenTarget, powerXMLID, targetXMLID) {
        // Create AID
        const xml = `
            <POWER XMLID="${powerXMLID}" ID="1734814179562" BASECOST="0.0" LEVELS="2" ALIAS="${powerXMLID.titleCase()}" POSITION="1" 
            MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" 
            INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="${targetXMLID}" USESTANDARDEFFECT="No" QUANTITY="1" 
            AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            </POWER>
        `;
        const itemData = HeroSystem6eItem.itemDataFromXml(xml, tokenSource.actor);
        const adjustmentItem = await HeroSystem6eItem.create(itemData, { parent: tokenSource.actor });
        await adjustmentItem._postUpload();
        this.log(
            `Added <b>${adjustmentItem.name} ${adjustmentItem.system.INPUT}</b> to <b>${adjustmentItem.actor.name}</b>`,
        );

        // Target tokenTarget
        await game.user.updateTokenTargets([tokenTarget.id]);
        await game.user.broadcastActivity({
            targets: Array.from(game.user.targets.map((t) => t.id)),
        });

        for (let i = 0; i < 50; i++) {
            if (game.user.targets.first()?.id === tokenTarget.id) break;
            this.delay(); // For some reson targets don't always update right away.
        }

        // Roll
        await adjustmentItem.roll();

        // Wait for application to render then Click "Roll to Hit"
        let button;
        for (let i = 0; i < 50; i++) {
            if ((button = $("#item-attack-form-application button")).length === 1) break;
            await this.delay();
        }
        button.click();
        this.log(`CLICK: ${button.text().trim()}`);

        // Wait for chat chard then Roll AID
        for (let i = 0; i < 50; i++) {
            if (
                (button = $(
                    `ol#chat-log .chat-message:last-child button.roll-damage[data-item-id='${adjustmentItem.uuid}']`,
                )).length === 1
            )
                break;
            await this.delay();
        }
        button.click();
        this.log(`CLICK: ${button.text().trim()}`);

        // Wait for chat chard then Apply AID
        for (let i = 0; i < 50; i++) {
            if (
                (button = $(
                    `ol#chat-log .chat-message:last-child button.apply-damage[data-item-id='${adjustmentItem.uuid}']:last-child`,
                )).length === 1
            )
                break;
            await this.delay();
        }
        if (!button.text().trim().includes(" to ")) {
            this.log(`FAIL: Is "Apply ${powerXMLID} to ${tokenTarget.name}" in the chatcard?`, "color:red");
            return false;
        }
        button.click();
        this.log(`CLICK: ${button.text().trim()}`);

        // Get Active Effect
        let adjustmentActiveEffect;
        for (let i = 0; i < 50; i++) {
            if ((adjustmentActiveEffect = tokenTarget.actor.temporaryEffects?.[0])) break;
            await this.delay();
        }
        if (!adjustmentActiveEffect) {
            this.log(
                `FAIL: unable to locate AE. Is "Apply ${powerXMLID}  to ${tokenTarget.name}" in the chatcard?`,
                "color:red",
            );
            return false;
        }
        this.log(
            `Active Effect: ${adjustmentActiveEffect.changes?.[0].key} ${adjustmentActiveEffect.changes?.[0].value}`,
        );

        // Confirm Characteristic has been aided
        let adjustmentValue = parseInt(adjustmentActiveEffect.changes[0].value);
        let adjustmentActivePoints = -adjustmentActiveEffect.flags.adjustmentActivePoints;
        let actorCharaisticValue =
            tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].core + adjustmentValue;
        if (tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].value !== actorCharaisticValue) {
            this.log(`FAIL: ${targetXMLID.toLowerCase()}.value !== actorCharaisticValue`, "color:red");
            return;
        }

        if (adjustmentActiveEffect.changes.length !== 1) {
            this.log(`FAIL: AE has more than 1 change`, "color:red");
            return;
        }

        const costPerActivePoint = determineCostPerActivePoint(targetXMLID, null, tokenTarget.actor);
        // if (aidActiveEffect.flags.costPerActivePoint !== costPerActivePoint) {
        //     this.log(
        //         `FAIL costPerActivePoint: ${aidActiveEffect.flags.costPerActivePoint} !== ${costPerActivePoint}`,
        //         "color:red",
        //     );
        //     return;
        // }

        //const saveWorldTime = game.time.worldTime;

        while (adjustmentValue !== 0) {
            // Make sure AP = change.value
            if (parseInt(adjustmentActiveEffect.changes[0].value) !== -adjustmentActiveEffect.flags.affectedPoints) {
                this.log(
                    `FAIL aidActiveEffect.flags.affectedPoints: ${adjustmentActiveEffect.changes[0].value} !== ${-adjustmentActiveEffect.flags.affectedPoints}`,
                    "color:red",
                );
                return;
            }

            if (adjustmentActivePoints !== -adjustmentActiveEffect.flags.adjustmentActivePoints) {
                this.log(
                    `FAIL aidActivePoints: ${adjustmentActivePoints} !== ${-adjustmentActiveEffect.flags.adjustmentActivePoints}`,
                    "color:red",
                );
                return;
            }

            if (
                parseInt(adjustmentActiveEffect.changes[0].value) !==
                Math.floor(-adjustmentActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)
            ) {
                this.log(
                    `FAIL adjustmentActiveEffect.changes[0].value: ${adjustmentActiveEffect.changes[0].value} !== ${Math.floor(-adjustmentActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)})`,
                    "color:red",
                );
                return;
            }

            if (
                -adjustmentActiveEffect.flags.affectedPoints !==
                Math.floor(-adjustmentActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)
            ) {
                this.log(
                    `FAIL adjustmentActiveEffect.flags.affectedPoints: ${-adjustmentActiveEffect.flags.affectedPoints} !== ${Math.floor(-adjustmentActiveEffect.flags.adjustmentActivePoints / costPerActivePoint)})`,
                    "color:red",
                );
                return;
            }

            // Advance world time 12 seconds
            this.log(`worldTime + 12 seconds`);
            await game.time.advance(12);

            // Wait for AE to update/fade
            for (let i = 0; i < 50; i++) {
                if (tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].value !== actorCharaisticValue)
                    break;
                await this.delay();
            }
            adjustmentActiveEffect = tokenTarget.actor.temporaryEffects?.[0]; // Make sure we have latest updates

            if (adjustmentActiveEffect && adjustmentActiveEffect.changes.length !== 1) {
                this.log(`FAIL: AE has more than 1 change`, "color:red");
                return;
            }

            // Check for fade
            this.log(
                `Active Effect: ${adjustmentActiveEffect?.changes[0].key} ${adjustmentActiveEffect?.changes[0].value}`,
            );
            const newAidActivePoints =
                powerXMLID === "AID"
                    ? Math.max(0, adjustmentActivePoints - 5)
                    : Math.min(0, adjustmentActivePoints + 5);
            // const aidNewValue = aidActiveEffect
            //     ? Math.max(0, Math.floor(-aidActiveEffect.flags.adjustmentActivePoints - 5 / costPerActivePoint))
            //     : 0;
            const adjustmentNewValue = Math.floor(newAidActivePoints / costPerActivePoint);
            // const actorNewCharacteristicValue = Math.max(
            //     token.actor.system.characteristics[XMLID.toLowerCase()].core,
            //     actorCharaisticValue - 5 / costPerActivePoint,
            // );
            const actorNewCharacteristicValue =
                tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].core + adjustmentNewValue;
            if (
                (!adjustmentActiveEffect && adjustmentNewValue === 0) ||
                tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].value ===
                    actorNewCharacteristicValue
            ) {
                this.log(
                    `Fade from ${adjustmentValue} to ${adjustmentNewValue} was successful. ${targetXMLID}=${actorNewCharacteristicValue}`,
                );
            } else {
                this.log(
                    `Expected actor ${targetXMLID}=${actorNewCharacteristicValue} got ${tokenTarget.actor.system.characteristics[targetXMLID.toLowerCase()].value}`,
                    "color:red",
                );
                this.log(
                    `Expected change.value=${adjustmentNewValue} got ${adjustmentActiveEffect?.changes[0].value}`,
                    "color:red",
                );
                return;
            }

            // fade again?
            adjustmentActivePoints = newAidActivePoints;
            adjustmentValue = adjustmentNewValue;
            actorCharaisticValue = actorNewCharacteristicValue;
        }
        this.log(
            `AID Active Effect <b>${targetXMLID}</b> for <b>${tokenTarget.actor.name}</b>: Fade completed succesfully`,
        );

        return true; // true = success
    }
}
