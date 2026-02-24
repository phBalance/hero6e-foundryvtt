import { HEROSYS } from "../herosystem6e.mjs";

// v13 has namespaced this. Remove when support is no longer provided. Also remove from eslint template.
const FoundryVttActiveEffectConfig = foundry.applications?.sheets?.ActiveEffectConfig || ActiveEffectConfig;

export class HeroSystemActiveEffectConfig extends FoundryVttActiveEffectConfig {
    // V12 static get defaultOptions is replaced by V13 static DEFAULT_OPTIONS = {}
    static get defaultOptions() {
        const defaultOptions = super.defaultOptions;
        return foundry.utils.mergeObject(defaultOptions, {
            //classes: ["herosystem6e", "sheet", "item"],
            width: 700,
            // height: 660,
            // scrollY: [".sheet-body"],
            classes: ["sheet", "herosystem-active-effect-config", "active-effect-sheet"],
            template: `systems/${HEROSYS.module}/templates/actor/active-effect-config.hbs`,
        });
    }

    addHeroListeners(html, context) {
        const detailsSection = html.find("section[data-tab='details']")?.[0];
        if (detailsSection) {
            const originItem = fromUuidSync(context.source.origin);
            const token = fromUuidSync(context.source.origin?.match(/(.*).Actor/)?.[1]);
            const originText =
                (originItem ? `${token?.name || originItem.actor?.name}: ${originItem.name}` : context.source.origin) ||
                "";

            detailsSection.append(
                $(`
                <fieldset>
                    <div class="form-group">
                        <label>HERO.Origin</label>
                        <div class="form-fields">
                            <input type="text" name="originText" value="${originText}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.XMLID</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.XMLID" value="${context.source.flags[game.system.id]?.XMLID || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.key</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.key" value="${context.source.flags[game.system.id]?.key || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.adjustmentActivePoints</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.adjustmentActivePoints" value="${context.source.flags[game.system.id]?.adjustmentActivePoints || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.source</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.source" value="${context.source.flags[game.system.id]?.source || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.target</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.target" value="${context.source.flags[game.system.id]?.target || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.targetDisplay</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.targetDisplay" value="${context.source.flags[game.system.id]?.targetDisplay || ""}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.type</label>
                        <div class="form-fields">
                            <input type="text" name="flags.${game.system.id}.type" value="${context.source.flags[game.system.id]?.type || ""}" disabled/>
                        </div>
                    </div>
                </fieldset>
                `)[0],
            );
        }

        const durationSection = html.find("section[data-tab='duration']")?.[0];
        if (durationSection) {
            const remaining =
                context.source.duration.startTime + context.source.duration.seconds - game.time.worldTime ||
                "Does not fade";
            const startTimeDisplay = new Date(context.source.duration.startTime * 1000)
                .toUTCString()
                .replace(" GMT", "");

            durationSection.append(
                $(`
                <fieldset>
                    <div class="form-group">
                        <label>HERO.Fade in (seconds)</label>
                        <div class="form-fields">
                            <input type="text" value="${remaining}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.startTime</label>
                        <div class="form-fields">
                            <input type="text" value="${context.source.duration.startTime}" disabled/>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>HERO.startTimeDisplay</label>
                        <div class="form-fields">
                            <input type="text" value="${startTimeDisplay}" disabled/>
                        </div>
                    </div>
                </fieldset>
                `)[0],
            );
        }
    }

    // v13 uses _onRender instead of activateListeners
    _onRender(context, options) {
        super._onRender(context, options);
        this.addHeroListeners.call(this, $(this.element), context);
    }

    // V12 uses getData, V13 does not as it is a V2 application
    async getData() {
        const context = await super.getData();

        context.gameSystemId = game.system.id;

        try {
            for (let i = 0; i < context.data.changes.length; i++) {
                context.data.changes[i] = { ...context.data.changes[i], ...context.data.system.changes?.[i] };
            }
            const originItem = fromUuidSync(context.data.origin);
            const token = fromUuidSync(context.data.origin?.match(/(.*).Actor/)?.[1]);
            context.originText = originItem
                ? `${token?.name || originItem.actor?.name}: ${originItem.name}`
                : context.data.origin;

            //sourceText
            for (const change of context.data.changes) {
                if (change.source) {
                    const sourceItem = fromUuidSync(change.source);
                    const token = fromUuidSync(change.source.match(/(.*).Actor/)?.[1]);
                    change.sourceText = `${token?.name || sourceItem.actor?.name}: ${sourceItem.name}`;
                }
            }

            context.data.startTimeDisplay = new Date(context.data.duration.startTime * 1000)
                .toUTCString()
                .replace(" GMT", "");

            context.remaining = context.data.duration.startTime + context.data.duration.seconds - game.time.worldTime;
        } catch (e) {
            console.error(e);
        }

        return context;
    }

    _onEffectControl(event) {
        event.preventDefault();
        const button = event.currentTarget;
        switch (button.dataset.action) {
            case "add":
                return this._addEffectChange();
            case "delete":
                button.closest(".effect-change").remove();
                return this.submit({ preventClose: true }).then(() => this.render());
        }
    }

    async _updateObject(event, formData) {
        await super._updateObject(event, formData);
    }

    _getSubmitData(updateData = {}) {
        const fd = new foundry.applications.ux.FormDataExtended(this.form, { editors: this.editors, disabled: true });
        let data = foundry.utils.expandObject(fd.object);
        if (updateData) foundry.utils.mergeObject(data, updateData);
        data.changes = Array.from(Object.values(data.changes || {}));
        data.statuses ??= [];

        // Need to collapse the array (get rid of any sparse indexes that can occur when deleting middle indexes)
        //data.system.changes = Array.from(Object.values(data.system.changes || {}));
        return data;
    }
}
