import { HeroSystem6eItem } from "../item/item.mjs";

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
        await this.testAid(this.token6);
        await this.testAid(this.token5);
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

    async testAid(token) {
        // Create AID
        const xml = `
            <POWER XMLID="AID" ID="1734814179562" BASECOST="0.0" LEVELS="2" ALIAS="Aid" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
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

        // Confirm STR has been aided
        let aidValue = parseInt(aidActiveEffect.changes[0].value);
        let actorStrValue = 10 + aidValue;
        if (token.actor.system.characteristics.str.value !== actorStrValue) {
            this.log(`FAIL`, "color:red");
            return;
        }

        if (aidActiveEffect.changes.length !== 1) {
            this.log(`FAIL: AE has more than 1 change`, "color:red");
            return;
        }

        //const saveWorldTime = game.time.worldTime;

        while (aidValue !== 0) {
            // Advance world time 12 seconds

            this.log(`worldTime + 12 seconds`);
            await game.time.advance(12);

            // Wait for AE to update/fade
            for (let i = 0; i < 50; i++) {
                if (token.actor.system.characteristics.str.value !== actorStrValue) break;
                await this.delay();
            }
            aidActiveEffect = token.actor.temporaryEffects?.[0]; // Make sure we have latest updates

            if (aidActiveEffect && aidActiveEffect.changes.length !== 1) {
                this.log(`FAIL: AE has more than 1 change`, "color:red");
                return;
            }

            // Check for fade
            this.log(`Active Effect: ${aidActiveEffect?.changes[0].key} ${aidActiveEffect?.changes[0].value}`);
            const aidNewValue = Math.max(0, aidValue - 5);
            const actorNewStrValue = Math.max(10, actorStrValue - 5);
            if (
                (!aidActiveEffect && aidNewValue === 0) ||
                token.actor.system.characteristics.str.value === actorNewStrValue
            ) {
                this.log(`Fade from ${aidValue} to ${aidNewValue} was successful. STR=${actorNewStrValue}`);
            } else {
                this.log(
                    `Excpected actor STR=${actorNewStrValue} got ${token.actor.system.characteristics.str.value}`,
                    "color:red",
                );
                this.log(`Excpected change.value=${aidNewValue} got ${aidActiveEffect?.changes[0].value}`, "color:red");

                // await this.delay();
                // this.log(`Active Effect: ${aidActiveEffect.changes[0].key} ${aidActiveEffect.changes[0].value}`);

                return;
            }

            // fade again?
            aidValue = parseInt(aidActiveEffect?.changes[0].value || 0);
            actorStrValue = 10 + aidValue;
        }
        this.log(`Active Effect: Fade completed succesfully`);
    }
}
