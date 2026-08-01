import { HeroSystem6eCombatantSingle } from "./combatant-single.mjs";
import { HeroSystem6eCombatSingle } from "./combat-single.mjs";
import { isQuenchTestRunning } from "./utility/util.mjs";

const { CombatTracker } = foundry.applications.sidebar.tabs;

export class HeroSystem6eCombatTrackerSingle extends CombatTracker {
    static {
        /**
         * Updates the header and handles real-time active row highlighting fixes.
         * Enforces complete null guards to accommodate unlinked V14 Quench test models.
         */
        const onRenderTracker = (app, html, _context, options) => {
            // AppV2 fires renderCombatTracker for every subclass: the legacy tracker's
            // rows lack this tracker's classes, so touching them only strips state
            if (!(app instanceof HeroSystem6eCombatTrackerSingle)) return;
            const element = html;
            if (!element) return;
            // Marks this app's DOM so single-tracker-only CSS (e.g. hiding the core
            // Roll All / Roll NPCs header buttons) never leaks onto the legacy
            // tracker. BEFORE the started-guard: an un-started combat is exactly
            // when the roll buttons would tempt a GM
            element.classList.add("hero-single-tracker");

            // Per-client density preference (#3157); non-active rows shrink via CSS
            let compact = false;
            try {
                compact = !!game.settings.get(game.system.id, "combatTrackerCompact");
            } catch (e) {
                console.warn(`Unable to read the compact tracker setting`, e);
            }
            element.classList.toggle("hero-compact", compact);

            // Exit out immediately if combat hasn't formally begun, if the instance is missing,
            // or if core tracking parameters haven't finished compiling yet.
            if (!app?.viewed || !app.viewed.started) return;

            // Update header titles using standard Hero System nomenclature variables
            const encounterTitle = element.querySelector(".combat-tracker-header .encounter-title");
            if (encounterTitle) {
                encounterTitle.textContent = `Turn=${app.viewed.round} Segment=${app.viewed.segment}.${app.viewed.turn}`;
            }

            // Strip any false active highlights that the core template engine miscalculated
            element.querySelectorAll(".combatant.active").forEach((el) => {
                el.classList.remove("active");
            });

            // Safely check the true active combatant ID string straight from the source database.
            // The active combatant row only carries the highlight inside the current segment group.
            // Exclude the exploded-group summary row, which reuses the active member's id
            const activeId = app.viewed.combatant?.id;
            if (activeId) {
                const activeRow = element.querySelector(
                    `.current-segment-member:not(.hero-group-parent):not(.hero-lr-shadow):not(.hero-lr-spent)[data-combatant-id="${activeId}"], .current-segment-member:not(.hero-group-parent):not(.hero-lr-shadow):not(.hero-lr-spent)[data-id="${activeId}"]`,
                );
                if (activeRow) {
                    activeRow.classList.add("active");
                    // Per-app guard: the sidebar and a popout are separate instances and
                    // must each follow the fight (a shared module-level guard let whichever
                    // rendered first consume the change and froze the other). Scroll only
                    // on real combat updates — or a window's very first render — never on
                    // cosmetic re-renders like expansion toggles.
                    const isCombatUpdate = options?.renderContext === "updateCombat";
                    const firstRender = app._lastAutoScrolledId === undefined;
                    if ((isCombatUpdate || firstRender) && app._lastAutoScrolledId !== activeId) {
                        app._lastAutoScrolledId = activeId;
                        // Pin the current segment header near the top of the viewport
                        // (below the sticky held panel), keeping the acting row visible;
                        // deep segments fall back to centering the acting row (#4556)
                        const tracker = activeRow.closest(".combat-tracker");
                        const headerRow = tracker?.querySelector(".active-segment-header-slot");
                        if (tracker && headerRow) {
                            const stickyOffset =
                                (tracker.querySelector(".combatant.hero-held-panel-header")?.offsetHeight ?? 0) +
                                (tracker.querySelector(".hero-held-scroll-wrapper:not(.hero-held-collapsed)")
                                    ?.offsetHeight ?? 0);
                            const trackerRect = tracker.getBoundingClientRect();
                            const headerRect = headerRow.getBoundingClientRect();
                            const activeRect = activeRow.getBoundingClientRect();
                            if (activeRect.top - headerRect.top > tracker.clientHeight / 2) {
                                activeRow.scrollIntoView({ block: "center", behavior: "smooth" });
                            } else {
                                const delta = headerRect.top - trackerRect.top - stickyOffset - 4;
                                tracker.scrollTo({ top: Math.max(0, tracker.scrollTop + delta), behavior: "smooth" });
                            }
                        } else {
                            activeRow.scrollIntoView({ block: "center", behavior: "smooth" });
                        }
                    }
                }
            }

            // Gather panel member rows into a pinned container beneath the header; the
            // container caps at 20vh and scrolls when more holders than that pile up
            const panelHeaderRow = element.querySelector(".combatant.hero-held-panel-header");
            const panelMemberRows = element.querySelectorAll("li.combatant.hero-held-panel-member");
            if (panelHeaderRow && panelMemberRows.length > 0 && !element.querySelector(".hero-held-scroll-wrapper")) {
                const wrapper = document.createElement("li");
                wrapper.className = `hero-held-scroll-wrapper${
                    panelHeaderRow.classList.contains("segment-collapsed") ? " hero-held-collapsed" : ""
                }`;
                const list = document.createElement("ol");
                list.className = "hero-held-scroll plain";
                wrapper.appendChild(list);
                panelHeaderRow.after(wrapper);
                panelMemberRows.forEach((li) => list.appendChild(li));
            }

            // Delayed-action markers: owners get inline Resolve-now / Cancel controls
            element.querySelectorAll("li.combatant.hero-delayed-row[data-combatant-id]").forEach((li) => {
                if (li.querySelector(".hero-delayed-controls")) return;
                const combatant = app.viewed.combatants.get(li.dataset.combatantId);
                if (!combatant?.isOwner) return;
                const delayedId = [...li.classList]
                    .find((cls) => cls.startsWith("hero-delayed-id-"))
                    ?.slice("hero-delayed-id-".length);
                if (!delayedId) return;
                const wrap = document.createElement("span");
                wrap.className = "hero-delayed-controls";
                const makeControl = (icon, tooltip, onClick) => {
                    const control = document.createElement("button");
                    control.type = "button";
                    control.className = `inline-control combatant-control icon fa-solid ${icon}`;
                    control.dataset.tooltip = tooltip;
                    control.setAttribute("aria-label", tooltip);
                    control.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        clickEvent.stopPropagation();
                        onClick();
                    });
                    return control;
                };
                wrap.append(
                    makeControl("fa-bolt", "Resolve now", () =>
                        app.viewed.resolveDelayedActionNow?.(combatant.id, delayedId),
                    ),
                    makeControl("fa-xmark", "Cancel (interrupted)", () =>
                        app.viewed.cancelDelayedAction?.(combatant.id, delayedId),
                    ),
                );
                li.appendChild(wrap);
            });

            // Owners can click condition icons to toggle them (prone → stand up, etc.)
            element.querySelectorAll("li.combatant[data-combatant-id] .token-effects").forEach((container) => {
                const li = container.closest("li.combatant");
                const combatant = app.viewed.combatants.get(li?.dataset.combatantId);
                if (combatant?.isOwner && container.querySelector("img.token-effect")) {
                    container.classList.add("hero-effects-clickable");
                }
            });

            // Compact hold controls: panel rows show "⚡ <condition>" (the use control for
            // owners, a passive label otherwise); positional timeline rows get a plain ⚡
            element.querySelectorAll("li.combatant.hero-held-row").forEach((li) => {
                const combatant = app.viewed.combatants.get(li.dataset.combatantId);
                if (!combatant?.heldAction) return;
                const controls = li.querySelector(".combatant-controls");
                if (!controls || controls.querySelector(".hero-use-held, .hero-held-condition")) return;

                const isPanelRow = li.classList.contains("hero-held-panel-member");
                const hold = combatant.heldAction;
                const conditionLabel = (hold?.mode === "event" && hold.trigger) || "Held Action";

                if (!combatant.isOwner) {
                    if (isPanelRow) {
                        const label = document.createElement("span");
                        label.className = "hero-held-condition";
                        const icon = document.createElement("i");
                        icon.className = "fa-solid fa-hourglass-half";
                        label.append(icon, ` ${conditionLabel}`);
                        controls.prepend(label);
                    }
                    return;
                }

                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("aria-label", "Use Held Action");
                button.dataset.tooltip = "Use Held Action";
                button.addEventListener("click", (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                    app._onUseHeldAction(li.dataset.combatantId);
                });
                if (isPanelRow) {
                    button.className = "inline-control combatant-control hero-use-held hero-use-held-compact";
                    const icon = document.createElement("i");
                    icon.className = "fa-solid fa-bolt";
                    const label = document.createElement("span");
                    label.textContent = conditionLabel;
                    button.append(icon, label);
                } else {
                    button.className = "inline-control combatant-control icon fa-solid fa-bolt hero-use-held";
                }
                controls.prepend(button);
            });

            // Lightning Reflexes: owners of scoped-LR combatants get an act-early
            // toggle on their current-segment row while the position is reachable
            element
                .querySelectorAll(
                    "li.combatant.current-segment-member:not(.hero-group-parent):not(.hero-lr-shadow):not(.hero-lr-spent)",
                )
                .forEach((li) => {
                    const combatant = app.viewed.combatants.get(li.dataset.combatantId);
                    const state = app._lrElevationState?.(combatant);
                    if (!state) return;
                    const controls = li.querySelector(".combatant-controls");
                    if (!controls || controls.querySelector(".hero-lr-elevate")) return;

                    const button = document.createElement("button");
                    button.type = "button";
                    const label =
                        state === "elevated"
                            ? "Cancel Act Early (Lightning Reflexes)"
                            : "Act Early (Lightning Reflexes)";
                    button.setAttribute("aria-label", label);
                    button.dataset.tooltip = label;
                    button.className = `inline-control combatant-control icon fa-solid fa-bolt-lightning hero-lr-elevate${
                        state === "elevated" ? " hero-lr-elevated" : ""
                    }`;
                    button.addEventListener("click", (clickEvent) => {
                        clickEvent.preventDefault();
                        clickEvent.stopPropagation();
                        app._onToggleLrElevation(li.dataset.combatantId);
                    });
                    controls.prepend(button);
                });

            // The row template's Delay button has no handler in core or the
            // system — in HERO, "delaying" IS declaring a Held Action (6E2 20),
            // so route it to the hold dialog
            element.querySelectorAll('button[data-action="delayCombatant"]').forEach((button) => {
                button.addEventListener("click", (clickEvent) => {
                    clickEvent.preventDefault();
                    clickEvent.stopPropagation();
                    const li = button.closest("[data-combatant-id]");
                    if (li?.dataset.combatantId) app._onDeclareHoldAction(li.dataset.combatantId);
                });
            });
        };

        Hooks.on("renderCombatTracker", onRenderTracker);

        /**
         * Timing-contest button on Held Action use cards (6E2 21; 5ER 361):
         * simultaneous Actions are resolved by opposed characteristic rolls.
         */
        Hooks.on("renderChatMessageHTML", (_message, html) => {
            const button = html?.querySelector?.("button.hero-timing-contest");
            if (!button || button.dataset.heroContestWired) return;
            button.dataset.heroContestWired = "true";
            button.addEventListener("click", () => HeroSystem6eCombatTrackerSingle.#onTimingContest(button));
        });

        /**
         * A bare "aborted" status toggle (token HUD) routes into the real Abort
         * flow: the raw status is removed and the declaration dialog opens, so
         * the Phase cost, chat card, and ledger entry are all recorded.
         * Cancelling leaves the status off — the dialog IS the declaration.
         */
        Hooks.on("createActiveEffect", (effect, _options, userId) => {
            try {
                if (userId !== game.user.id) return;
                if (!effect.statuses?.has("aborted")) return;
                // Tracker-declared aborts carry the record; only raw toggles route
                if (effect.getFlag(game.system.id, "abort")) return;
                if (isQuenchTestRunning()) return;
                const tracker = ui.combat;
                if (!(tracker instanceof HeroSystem6eCombatTrackerSingle) || tracker._abortFlowActive) return;
                const combat = tracker.viewed;
                if (!combat?.started) return;
                const actor = effect.parent;
                if (actor?.documentName !== "Actor") return;
                const combatant =
                    combat.combatants.find((c) => c.actor === actor) ??
                    combat.combatants.find((c) => c.actorId === actor.id);
                if (!combatant?.isOwner) return;
                effect
                    .delete()
                    .then(() => tracker._onAbortAction(combatant.id))
                    .catch((e) => console.error(e));
            } catch (e) {
                console.error(`Aborted-status toggle routing failed`, e);
            }
        });

        /**
         * Injects the Hero System client preferences into core's Combat Tracker
         * Settings dialog (#3157). The inputs persist immediately on change —
         * core's submit handler writes only core.combatTheme and
         * core.combatTrackerConfig and silently discards unknown form fields,
         * so riding the Save button is not an option.
         */
        const onRenderTrackerConfig = (_app, html) => {
            try {
                if (!(ui.combat instanceof HeroSystem6eCombatTrackerSingle)) return;
                const root = html;
                if (!root || root.querySelector(".hero-tracker-config")) return;

                const compact = !!game.settings.get(game.system.id, "combatTrackerCompact");
                const fieldset = document.createElement("fieldset");
                fieldset.className = "hero-tracker-config";
                fieldset.innerHTML = `
                    <legend>Hero System</legend>
                    <div class="form-group">
                        <label for="hero-tracker-compact">${game.i18n.localize("Settings.AlphaTesting.combatTrackerCompact.Name")}</label>
                        <div class="form-fields">
                            <input type="checkbox" id="hero-tracker-compact" ${compact ? "checked" : ""}>
                        </div>
                        <p class="hint">${game.i18n.localize("Settings.AlphaTesting.combatTrackerCompact.Hint")}</p>
                    </div>`;
                fieldset.querySelector("input").addEventListener("change", (event) => {
                    // Applies live: the setting's onChange re-renders the tracker
                    game.settings
                        .set(game.system.id, "combatTrackerCompact", event.target.checked)
                        .catch((e) => console.error(e));
                });

                const footer = root.querySelector("footer.form-footer, .form-footer");
                if (footer) footer.before(fieldset);
                else (root.querySelector("form") ?? root).append(fieldset);
            } catch (e) {
                console.error(`Unable to inject tracker preferences into the settings dialog`, e);
            }
        };

        Hooks.on("renderCombatTrackerConfig", onRenderTrackerConfig);
    }

    /**
     * Opposed timing contest for a simultaneous Held Action (6E2 21; 5ER 361):
     * the holder contests the CURRENT combat actor — the one whose Action the
     * held interrupt collides with. Both sides make their characteristic roll
     * (DEX, or EGO for Mental Powers); the larger success margin acts first and
     * equal margins are simultaneous.
     * @param {HTMLButtonElement} button - The card button carrying combat/combatant ids
     */
    static async #onTimingContest(button) {
        const combat = game.combats.get(button.dataset.combatId);
        const holder = combat?.combatants.get(button.dataset.combatantId);
        if (!combat || !holder?.actor) {
            return void ui.notifications.warn(`The combat or the holding combatant no longer exists.`);
        }
        if (!game.user.isGM && !holder.isOwner) return;

        // The contest is against whoever is acting NOW; a held action used on the
        // holder's own turn collides with nobody
        const opponent = combat.combatant;
        if (!opponent?.actor || opponent.id === holder.id) {
            return void ui.notifications.warn(
                `No opposing current actor to contest — the timing contest applies when a Held Action collides with another combatant's Action.`,
            );
        }

        const escapeHTML = foundry.utils.escapeHTML ?? ((value) => Handlebars.escapeExpression(value));
        const charOptions = ["dex", "ego"]
            .map((key) => `<option value="${key}">${key.toUpperCase()}</option>`)
            .join("");
        const content = `<fieldset>
            <legend>Simultaneous Actions — vs ${escapeHTML(opponent.name)}</legend>
            <div class="form-group">
                <label>${escapeHTML(holder.name)} rolls</label>
                <select name="holder-char">${charOptions}</select>
            </div>
            <div class="form-group">
                <label>${escapeHTML(opponent.name)} rolls</label>
                <select name="opponent-char">${charOptions}</select>
            </div>
            <p class="hint">Mental Powers contest EGO instead of DEX.</p>
        </fieldset>`;

        const choice = await foundry.applications.api.DialogV2.wait({
            window: { title: `Timing Contest — ${holder.name} vs ${opponent.name}` },
            content,
            buttons: [
                {
                    action: "roll",
                    label: "Roll",
                    default: true,
                    callback: (event, btn) => ({
                        holderChar: btn.form.elements["holder-char"].value,
                        opponentChar: btn.form.elements["opponent-char"].value,
                    }),
                },
                { action: "cancel", label: "Cancel" },
            ],
            rejectClose: false,
        });
        if (!choice || choice === "cancel") return;

        const rollSide = async (combatant, key) => {
            const characteristic = combatant.actor.system?.characteristics?.[key];
            const target = characteristic?.roll ?? Math.round(9 + (characteristic?.value ?? 10) / 5);
            const roll = await new Roll("3d6").evaluate();
            return { combatant, key, target, roll, margin: target - roll.total };
        };
        const holderSide = await rollSide(holder, choice.holderChar);
        const opponentSide = await rollSide(opponent, choice.opponentChar);

        const line = (side) =>
            `${escapeHTML(side.combatant.name)}: ${side.key.toUpperCase()} roll ${side.target}-, rolled ${side.roll.total} (${
                side.margin >= 0 ? `made it by ${side.margin}` : `missed by ${-side.margin}`
            })`;
        const verdict =
            holderSide.margin === opponentSide.margin
                ? `The Actions occur <b>simultaneously</b>.`
                : `<b>${escapeHTML(
                      (holderSide.margin > opponentSide.margin ? holderSide : opponentSide).combatant.name,
                  )}</b> acts first.`;
        await ChatMessage.create({
            speaker: ChatMessage.getSpeaker({ actor: holder.actor }),
            rolls: [holderSide.roll, opponentSide.roll].map((r) => r.toJSON()),
            content: `<p><b>Timing contest</b> (6E2 21; 5ER 361)</p>
                <p>${line(holderSide)}</p>
                <p>${line(opponentSide)}</p>
                <p>${verdict}</p>
                <p class="hint">The roll-off loser cannot then Abort (5ER 361).</p>`,
        });
    }

    /**
     * Per-combat user overrides for segment expansion, cached from localStorage.
     * Keyed by combat id, each value maps segment number (1-12) to an explicit
     * expanded/collapsed choice. Absent segments use the automatic window default.
     * @type {Record<string, Record<number, boolean>>}
     */
    #segmentExpansion = {};

    /**
     * Root actor ids of groups the user manually exploded, per combat id.
     * The group containing the active combatant is always exploded.
     * @type {Record<string, Set<string>>}
     */
    #explodedGroups = {};

    _getExplodedGroups(combatId) {
        return (this.#explodedGroups[combatId] ??= new Set());
    }

    _segmentExpansionStorageKey(combatId) {
        return `${game.system.id}.segmentExpansion.${combatId}`;
    }

    _getSegmentExpansion(combatId) {
        if (!this.#segmentExpansion[combatId]) {
            let stored = {};
            try {
                stored = JSON.parse(localStorage.getItem(this._segmentExpansionStorageKey(combatId)) ?? "{}");
            } catch (e) {
                console.warn(`Unable to parse stored segment expansion state`, e);
            }
            this.#segmentExpansion[combatId] = stored;
        }
        return this.#segmentExpansion[combatId];
    }

    _setSegmentExpansion(combatId, segment, expanded) {
        const overrides = this._getSegmentExpansion(combatId);
        overrides[segment] = expanded;
        this._persistSegmentExpansion(combatId);
    }

    _persistSegmentExpansion(combatId) {
        try {
            localStorage.setItem(
                this._segmentExpansionStorageKey(combatId),
                JSON.stringify(this._getSegmentExpansion(combatId)),
            );
        } catch (e) {
            console.warn(`Unable to persist segment expansion state`, e);
        }
    }

    /**
     * Drops expansion overrides for segments the fight has moved past, restoring
     * the collapsed default for passed segments.
     * @param {string} combatId
     * @param {number} currentAbs
     * @param {number} round
     * @private
     */
    _dropStaleSegmentOverrides(combatId, currentAbs) {
        const overrides = this._getSegmentExpansion(combatId);
        let dirty = false;
        for (const key of Object.keys(overrides)) {
            const abs = Number(key);
            if (!Number.isFinite(abs)) continue; // "held" panel key
            // Keys are absolute segments (legacy bare-segment keys are all < 24
            // and sweep themselves out here on the first pass)
            if (abs < currentAbs) {
                delete overrides[key];
                dirty = true;
            }
        }
        if (dirty) this._persistSegmentExpansion(combatId);
    }

    /**
     * Overrides the modern ApplicationV2 rendering lifecycle handler.
     * ✅ FIX: Enforces deep object sanitation on options to stop the 'turn in undefined' core crash.
     * @override
     * @protected
     */
    async _onRender(context, options) {
        const safeContext = context || {};

        // Fortify a CLONE for core: programmatic renders (Quench) reach core's
        // `"turn" in renderData.find(...)` probe with no matching entry and crash.
        // The original options must stay untouched — core passes renderContext as a
        // STRING ("updateCombat") and the render hooks rely on it to tell combat
        // updates apart from cosmetic re-renders.
        const invalid = !options || typeof options !== "object" || Array.isArray(options);
        const safeOptions = invalid ? {} : { ...options };
        // This tracker owns auto-scrolling (segment timeline + sticky held panel make
        // core's offset math wrong anyway), so skip core's scroll block entirely.
        safeOptions.parts = [];

        await super._onRender(safeContext, safeOptions);

        // Owners toggle conditions by clicking their icons (delegated; the app
        // element persists across renders, so bind once per instance)
        if (!this._heroEffectsClickBound && this.element) {
            this.element.addEventListener("click", this._onTokenEffectClick.bind(this));
            this._heroEffectsClickBound = true;
        }
    }

    /**
     * The effects core renders as row icons, in render order — the clicked icon's
     * DOM index maps back into this list. Mirrors core's _prepareTurnContext filter.
     * @param {Actor} actor
     * @returns {ActiveEffect[]}
     * @private
     */
    _rowEffectsFor(actor) {
        const SHOW_ICON = CONST.ACTIVE_EFFECT_SHOW_ICON;
        const defeatedId = CONFIG.specialStatusEffects?.DEFEATED;
        const result = [];
        for (const effect of actor?.appliedEffects ?? []) {
            if (defeatedId && effect.statuses.has(defeatedId)) continue;
            if (
                effect.showIcon === SHOW_ICON.ALWAYS ||
                (effect.showIcon === SHOW_ICON.CONDITIONAL && effect.isTemporary)
            ) {
                result.push(effect);
            }
        }
        return result;
    }

    /**
     * Click-to-toggle for row condition icons (feedback + #4546: standing up from
     * prone should be one click). Owners only; only simple single-status actor
     * conditions toggle — maneuver/item effects and hold/abort statuses are owned
     * by their own flows.
     * @param {MouseEvent} event
     * @private
     */
    async _onTokenEffectClick(event) {
        const img = event.target?.closest?.("img.token-effect");
        if (!img) return;
        const li = img.closest(".combatant[data-combatant-id]");
        const combatant = this.viewed?.combatants.get(li?.dataset.combatantId);
        const actor = combatant?.actor;
        if (!actor || !combatant.isOwner) return;
        event.preventDefault();
        event.stopPropagation();

        const icons = this._rowEffectsFor(actor);
        const index = [...(img.parentElement?.querySelectorAll("img.token-effect") ?? [])].indexOf(img);
        const effect = icons[index];
        // Toggle only simple actor-level conditions (prone, stunned…):
        // - item effects (maneuvers) store their localized NAME in statuses and
        //   belong to their item's toggle, not toggleStatusEffect
        // - multi-status effects would be deleted then partially re-created
        // - holds/aborts carry bookkeeping the tracker flows own
        if (!effect || effect.statuses.size !== 1 || effect.parent !== actor) return;
        const [status] = effect.statuses;
        // encumbered is weight-derived: a click-toggle would be recreated by the
        // next encumbrance recalc (or orphan the penalties)
        if (["holding", "aborted", "encumbered"].includes(status)) return;
        if (!CONFIG.statusEffects?.some((s) => s.id === status)) return;
        await actor.toggleStatusEffect(status);
    }

    /**
     * Rebuilds the tracker as a chronological segment timeline:
     * - every non-empty segment of the current Turn, in order, including passed ones
     * - plus the previous 2 and next 2 non-empty segments, even across Turn boundaries
     * - the current segment is always expanded; the prev/next window expands by default;
     *   everything else renders as a collapsed header until the user expands it, and
     *   manual expand/collapse choices persist per client
     * @override
     */
    async _prepareTrackerContext(context, options) {
        // 1. Let Foundry assemble the core combatant turns layout dataset natively
        await super._prepareTrackerContext(context, options);
        const combat = this.viewed;
        if (!combat?.started) {
            // HERO rolls no initiative: unstarted rows preview DEX (+ always-on LR)
            // instead of the core d20 button. hasDecimals forces the plain-span
            // branch of the core template, which also removes the GM-editable input.
            for (const turn of context.turns ?? []) {
                const combatant = combat?.combatants.get(turn.id);
                const actor = combatant?.actor;
                if (!actor) {
                    turn.initiative = "\u2014";
                    turn.hasRolled = true;
                    continue;
                }
                const characteristicKey = actor.system?.initiativeCharacteristic ?? "dex";
                const dex = actor.system?.characteristics?.[characteristicKey]?.value ?? 10;
                const preview = dex + (combatant.lightningReflexes?.always ?? 0);
                turn.initiative = String(preview);
                turn.hasRolled = true;
                turn._heroPreview = preview;
            }
            context.turns?.sort((a, b) => (b._heroPreview ?? -1) - (a._heroPreview ?? -1));
            context.hasDecimals = true;
            return context;
        }

        const masterTurns = context.turns || [];
        const masterById = new Map(masterTurns.map((t) => [t.id, t]));
        const activeCombatantId = combat.combatant?.id || null;

        // Absolute segment indices are monotonic across Turns; combat begins at Turn 1, Segment 12
        const currentAbs = combat.round * 12 + combat.segment;
        const startAbs = 1 * 12 + 12;
        const segmentOf = (abs) => ((abs - 1) % 12) + 1;
        const roundOf = (abs) => Math.floor((abs - 1) / 12);

        const membersAt = (abs) => {
            const segment = segmentOf(abs);
            const isPast = abs < currentAbs;
            return combat.combatants.filter((c) => {
                if (!c.actor) return false;
                // Core filters hidden combatants out of player-facing turns; match it here
                if (c.hidden && !game.user.isGM) return false;
                // A positional Held Action commits the banked Phase to exactly its
                // declared slot — natural Phases don't render while one is pending
                // (mirrors occupiesSegment; also stops double rows feeding #4557)
                if (c.heldAction?.mode === "position") {
                    return !isPast && (c.holdsPositionAtAbs(abs) || c.spentHoldAtAbs(abs));
                }
                // queryAbs matters: the SPD-lockout window is an absolute range,
                // and a bare segment number aliases across Turns
                if (c.hasPhaseInSegment(segment, abs)) return true;
                // A spent hold keeps displaying at the acted position until the
                // segment ends; event/generic holds render in the panel instead
                return !isPast && c.spentHoldAtAbs(abs);
            });
        };

        // Past segments render from the combat ledger when it has records: what actually
        // happened, including combatants that have since been removed. Live computation
        // is the fallback for combats predating the ledger.
        const historyCache = new Map();
        const historyAt = (abs) => {
            if (abs >= currentAbs) return null;
            if (!historyCache.has(abs)) {
                let rows = combat.historyRowsForSegment?.(abs) ?? null;
                if (rows && !game.user.isGM) rows = rows.filter((row) => !row.hidden);
                historyCache.set(abs, rows);
            }
            return historyCache.get(abs);
        };
        const segmentPopulation = (abs) => historyAt(abs)?.length ?? membersAt(abs).length;

        // Candidate positions: every non-empty segment of the current Turn, clamped to combat start
        const positions = new Set([currentAbs]);
        for (let segment = 1; segment <= 12; segment++) {
            const abs = combat.round * 12 + segment;
            if (abs >= startAbs && segmentPopulation(abs) > 0) positions.add(abs);
        }

        // Include the previous 2 and next 2 non-empty segments, across Turn boundaries,
        // but only auto-expand the nearest one in each direction.
        // Past segments default to collapsed headers (#4556/#4562); only the
        // nearest FUTURE segment auto-expands
        const windowAbs = new Set();
        let found = 0;
        for (let abs = currentAbs - 1; abs >= startAbs && found < 2; abs--) {
            if (segmentPopulation(abs) > 0) {
                positions.add(abs);
                found++;
            }
        }
        found = 0;
        for (let abs = currentAbs + 1; abs <= currentAbs + 24 && found < 2; abs++) {
            if (membersAt(abs).length > 0) {
                if (found === 0) windowAbs.add(abs);
                positions.add(abs);
                found++;
            }
        }

        // A delayed action's landing segment always renders, even if otherwise
        // empty — but a GM-hidden combatant's landing must not leak an otherwise
        // empty segment header to players
        for (const combatant of combat.combatants) {
            if (combatant.hidden && !game.user.isGM) continue;
            for (const [, record] of combat.delayedActionsFor?.(combatant) ?? []) {
                if (record.resolveAbs >= currentAbs && record.resolveAbs <= currentAbs + 24) {
                    positions.add(record.resolveAbs);
                }
            }
        }

        // The single tracker follows only Foundry's own disposition setting; the legacy
        // combatTrackerDispositionHighlighting system setting applies to the old tracker
        let dispositionTint = false;
        try {
            dispositionTint = !!game.settings.get("core", Combat.CONFIG_SETTING)?.turnMarker?.disposition;
        } catch (e) {
            console.warn(`Unable to read combat tracker disposition setting`, e);
        }

        // Once the fight moves past a segment, its manual expansion override is
        // dropped so the past-default (collapsed) applies again; this also clears
        // the segment-number key aliasing across Turns (#4556/#4562)
        if (this._lastSeenAbs !== currentAbs) {
            if (this._lastSeenAbs !== undefined && currentAbs > this._lastSeenAbs) {
                this._dropStaleSegmentOverrides(combat.id, currentAbs);
            }
            this._lastSeenAbs = currentAbs;
        }

        const expansionOverrides = this._getSegmentExpansion(combat.id);
        const timelineTurns = [];

        // Event/generic holders occupy no initiative slot; they wait in a panel above the
        // timeline until activated (⚡), released, or expired by their natural Phase
        const panelHolders = combat.combatants
            .filter((c) => {
                if (!c.actor) return false;
                if (c.hidden && !game.user.isGM) return false;
                const hold = c.heldAction;
                return !!hold && hold.mode !== "position";
            })
            .sort(
                (a, b) =>
                    (b.actor.system?.characteristics?.dex?.value ?? 0) -
                        (a.actor.system?.characteristics?.dex?.value ?? 0) ||
                    HeroSystem6eCombatSingle.stableTiebreak(a, b),
            );

        const panelExpanded = expansionOverrides["held"] ?? true;
        if (panelHolders.length > 0) {
            const panelHeader = {
                id: "held-panel-header",
                _id: "held-panel-header",
                name: `⏳ Held Actions (${panelHolders.length})`,
                img: "icons/svg/clockwork.svg",
                css: [
                    "hero-timeline-header-row",
                    "collapsible-segment-header-slot",
                    "hero-held-panel-header",
                    panelExpanded ? "segment-expanded" : "segment-collapsed",
                ].join(" "),
                hasRolled: true,
                initiative: panelHolders.length,
                isFakeHeader: true,
                active: false,
            };
            Object.defineProperty(panelHeader, "token", { get: () => null, configurable: true, enumerable: true });
            Object.defineProperty(panelHeader, "actor", { get: () => null, configurable: true, enumerable: true });
            timelineTurns.push(panelHeader);

            {
                for (const combatant of panelHolders) {
                    const base = masterById.get(combatant.id);
                    const row = base
                        ? { ...base }
                        : {
                              id: combatant.id,
                              _id: combatant.id,
                              name: combatant.name,
                              hidden: combatant.hidden,
                              defeated: combatant.isDefeated,
                              css: "",
                          };
                    // || not ??: an import without an image stores "" which would
                    // otherwise render as a broken <img> showing its alt text (#2657)
                    row.img = row.img || combatant.img || combatant.actor?.img || "icons/svg/mystery-man.svg";
                    row.initiative = null;
                    row.hasRolled = true;
                    row.active = false;
                    row.effects = { icons: [], tooltip: "" };
                    row.css = `${(row.css || "").replace(/\bactive\b/g, "").trim()} hero-held-row hero-held-panel-member`;
                    if (dispositionTint) row.css = `${row.css} ${this._dispositionClass(combatant)}`.trim();
                    timelineTurns.push(row);
                }
            }
        }

        for (const abs of [...positions].sort((a, b) => a - b)) {
            const segment = segmentOf(abs);
            const round = roundOf(abs);
            const isCurrent = abs === currentAbs;
            const isPast = abs < currentAbs;
            const isNextTurn = round > combat.round;
            const expanded = isCurrent || (expansionOverrides[abs] ?? windowAbs.has(abs));

            // _comparePriority breaks priority ties by combatant id, keeping the order stable;
            // the exact position matters because segment numbers alias across Turns
            const members = membersAt(abs).sort((a, b) =>
                combat._comparePriority(a, b, combat, segment, { queryAbs: abs }),
            );
            const historyRows = isPast ? historyAt(abs) : null;

            const roundLabel = round === combat.round ? "" : ` (Turn ${round})`;
            const stateLabel = isCurrent ? " — Current" : isPast ? " — Passed" : "";
            // Delayed-action markers count as rows — a segment rendered solely for
            // a landing would otherwise read "(0)" above a visible marker
            const delayedCount = isPast
                ? 0
                : combat.combatants.reduce((n, c) => {
                      if (c.hidden && !game.user.isGM) return n;
                      return n + (combat.delayedActionsFor?.(c) ?? []).filter(([, r]) => r.resolveAbs === abs).length;
                  }, 0);
            const countLabel = ` (${(historyRows?.length ?? members.length) + delayedCount})`;

            const headerId = `seg-header-${round}-${segment}`;
            const headerTurn = {
                id: headerId,
                _id: headerId,
                name: `Segment ${segment}${roundLabel}${stateLabel}${countLabel}`,
                img: "icons/svg/clockwork.svg",
                css: [
                    "hero-timeline-header-row",
                    isCurrent ? "active-segment-header-slot" : "collapsible-segment-header-slot",
                    isPast ? "past-segment-header-slot" : "",
                    isNextTurn ? "next-turn-header-slot" : "",
                    expanded ? "segment-expanded" : "segment-collapsed",
                ]
                    .filter(Boolean)
                    .join(" "),
                hasRolled: true, // Header is marked true, but its HTML container is display: none
                initiative: members.length,
                isFakeHeader: true,
                active: false,
            };
            Object.defineProperty(headerTurn, "token", { get: () => null, configurable: true, enumerable: true });
            Object.defineProperty(headerTurn, "actor", { get: () => null, configurable: true, enumerable: true });
            timelineTurns.push(headerTurn);

            // Member rows always render; a collapsed segment hides them via class so
            // expansion toggles animate in place without a re-render
            const memberClasses = `timeline-member hero-seg-abs-${abs}${expanded ? "" : " segment-member-hidden"}`;

            if (historyRows) {
                for (const [idx, h] of historyRows.entries()) {
                    const live = h.combatantId ? combat.combatants.get(h.combatantId) : null;
                    const rowId = live ? live.id : `ledger-${abs}-${idx}`;
                    const kindLabel =
                        {
                            "held-used": " (held)",
                            "held-forfeit": " (hold spent)",
                            aborted: " (aborted)",
                            haymaker: " (haymaker)",
                        }[h.kind] ?? "";
                    const base = live ? masterById.get(live.id) : null;
                    const row = base
                        ? { ...base }
                        : {
                              id: rowId,
                              _id: rowId,
                              hidden: false,
                              defeated: false,
                              css: "",
                          };
                    row.id = rowId;
                    row._id = rowId;
                    row.name = `${h.name}${kindLabel}`;
                    row.img = h.img || row.img || "icons/svg/mystery-man.svg";
                    row.initiative = (h.priority ?? 0).toFixed(2);
                    row.hasRolled = true;
                    row.active = false;
                    row.effects = { icons: [], tooltip: "" };
                    row.css = [
                        (row.css || "").replace(/\bactive\b/g, "").trim(),
                        "past-segment-preview",
                        "hero-history-row",
                        memberClasses,
                        live ? "" : "hero-history-removed",
                    ]
                        .filter(Boolean)
                        .join(" ");
                    if (live && dispositionTint) row.css = `${row.css} ${this._dispositionClass(live)}`.trim();
                    if (!live) {
                        Object.defineProperty(row, "token", { get: () => null, configurable: true, enumerable: true });
                        Object.defineProperty(row, "actor", { get: () => null, configurable: true, enumerable: true });
                    }
                    timelineTurns.push(row);
                }
                continue;
            }

            // An elevated scoped-LR combatant occupies two visible positions: the LR
            // stop, and a shadow row where the rest of the Phase lands at natural DEX
            const entries = [];
            for (const combatant of members) {
                const priority = combat.getInitiativePriority(combatant, segment, { queryAbs: abs });
                entries.push({ combatant, priority, lrShadow: false });
                if (combatant.lrElevatedAbs === abs) {
                    const scopedLevels = combatant.lightningReflexes?.scoped?.levels ?? 0;
                    if (scopedLevels > 0) {
                        entries.push({ combatant, priority: priority - scopedLevels, lrShadow: true });
                    }
                }
                // A completed LR stop stays visible at the elevated position for the
                // rest of the segment (the natural row above is the Phase remainder)
                const spentLr = combatant.getFlag(game.system.id, "spentLrPosition");
                if (spentLr?.segmentAbs === abs) {
                    entries.push({ combatant, priority: spentLr.priority, lrShadow: false, lrSpent: true });
                }
            }
            // Delayed actions land at their scheduled position (declared DEX, or the
            // very end of the segment when none): inert marker rows
            if (!isPast) {
                for (const combatant of combat.combatants) {
                    if (combatant.hidden && !game.user.isGM) continue;
                    for (const [delayedId, record] of combat.delayedActionsFor?.(combatant) ?? []) {
                        if (record.resolveAbs !== abs) continue;
                        entries.push({
                            combatant,
                            priority: record.priority ?? -1,
                            lrShadow: false,
                            delayed: record,
                            delayedId,
                        });
                    }
                }
            }
            // Same order _comparePriority produces: priority descending, then the
            // per-segment sub-roll shuffle within a shared roll group
            entries.sort(
                (a, b) =>
                    b.priority - a.priority ||
                    (combat.tieBreakOrder
                        ? combat.tieBreakOrder(a.combatant, b.combatant, abs)
                        : HeroSystem6eCombatSingle.stableTiebreak(a.combatant, b.combatant)),
            );

            // Tokens of the same root actor tied on the same priority act back to back;
            // collapse them into a single row with a count. The row represents the active
            // member when the group contains it so click/hover target the acting token.
            const groups = [];
            for (const entry of entries) {
                const rollKey =
                    combat._tieRollKey?.(entry.combatant) ?? (entry.combatant.actorId || entry.combatant.id);
                const key = `${rollKey}${entry.lrShadow ? ":lr-shadow" : ""}${entry.delayed ? `:delayed:${entry.delayedId}` : ""}${entry.lrSpent ? ":lr-spent" : ""}`;
                const prev = groups.at(-1);
                if (prev && prev.key === key && prev.priority === entry.priority && !entry.delayed && !entry.lrSpent) {
                    prev.combatants.push(entry.combatant);
                } else {
                    groups.push({
                        key,
                        priority: entry.priority,
                        combatants: [entry.combatant],
                        lrShadow: entry.lrShadow,
                        delayed: entry.delayed ?? null,
                        delayedId: entry.delayedId ?? null,
                        lrSpent: !!entry.lrSpent,
                    });
                }
            }

            for (const group of groups) {
                // Multi-member groups explode into their individual members beneath the ×N
                // header row, indented so the hierarchy is clear. The group holding the
                // active combatant is always exploded; others explode on demand.
                const isGroup = group.combatants.length > 1;
                const isActiveGroup = isGroup && isCurrent && group.combatants.some((c) => c.id === activeCombatantId);
                const exploded = isActiveGroup || (isGroup && this._getExplodedGroups(combat.id).has(group.key));
                const representative = group.combatants.find((c) => c.id === activeCombatantId) ?? group.combatants[0];
                const stateCss = isPast
                    ? "past-segment-preview"
                    : !isCurrent
                      ? `future-segment-preview${isNextTurn ? " next-turn-preview" : ""}`
                      : "current-segment-member";

                const buildRow = (combatant) => {
                    const base = masterById.get(combatant.id);
                    const row = base
                        ? { ...base }
                        : {
                              id: combatant.id,
                              _id: combatant.id,
                              name: combatant.name,
                              hidden: combatant.hidden,
                              defeated: combatant.isDefeated,
                              css: "",
                          };
                    // || not ??: an import without an image stores "" which would
                    // otherwise render as a broken <img> showing its alt text (#2657)
                    row.img = row.img || combatant.img || combatant.actor?.img || "icons/svg/mystery-man.svg";

                    // Pull the calculated priority score from the source-of-truth document method so
                    // Handlebars draws the number instead of the d20 roll button
                    row.initiative = group.priority.toFixed(2);
                    row.hasRolled = true;
                    if (dispositionTint) row.css = `${row.css || ""} ${this._dispositionClass(combatant)}`.trim();
                    row.active = false;
                    row.css = (row.css || "").replace(/\bactive\b/g, "").trim();
                    return row;
                };

                if (exploded) {
                    // Summary header above the members; it carries the representative's id
                    // (never the active highlight) so hover still targets a real token.
                    // Clicking it collapses the group unless the group is the active one.
                    const parentRow = buildRow(representative);
                    parentRow.name = `▼ ${parentRow.name} ×${group.combatants.length}`;
                    parentRow.effects = { icons: [], tooltip: "" };
                    parentRow.css = [
                        parentRow.css,
                        stateCss,
                        memberClasses,
                        "hero-group-row hero-group-parent",
                        isActiveGroup ? "hero-group-locked" : "",
                    ]
                        .filter(Boolean)
                        .join(" ")
                        .trim();
                    timelineTurns.push(parentRow);
                }

                for (const combatant of exploded ? group.combatants : [representative]) {
                    const row = buildRow(combatant);
                    if (exploded) {
                        row.css = `${row.css} hero-group-exploded`.trim();
                    } else if (isGroup) {
                        // Collapsed group header: clicking explodes it into its members
                        row.name = `▶ ${row.name} ×${group.combatants.length}`;
                        row.effects = { icons: [], tooltip: "" };
                        row.css = `${row.css} hero-group-row hero-group-collapsed`.trim();
                    }

                    if (group.lrSpent) {
                        // The acted LR stop: inert display of where the scoped action
                        // happened; the combatant's live row is the Phase remainder
                        row.name = `↯ ${row.name} (acted early)`;
                        row.effects = { icons: [], tooltip: "" };
                        row.active = false;
                        row.css = `${row.css} hero-lr-row hero-lr-spent ${stateCss} ${memberClasses}`.trim();
                        timelineTurns.push(row);
                        continue;
                    }

                    if (group.delayed) {
                        // Delayed-action landing: informational marker, no controls
                        // (a truthy initiative keeps core's d20 roll button away)
                        const record = group.delayed;
                        row.name =
                            record.kind === "haymaker"
                                ? `💥 ${row.name} — Haymaker resolves`
                                : `⏳ ${row.name} — ${record.label}`;
                        row.initiative =
                            record.priority !== null && record.priority !== undefined ? String(record.priority) : "—";
                        row.effects = { icons: [], tooltip: "" };
                        row.css =
                            `${row.css} hero-haymaker-row hero-delayed-row hero-delayed-id-${group.delayedId} ${stateCss} ${memberClasses}`.trim();
                        timelineTurns.push(row);
                        continue;
                    }

                    // Positional holds render at their declared slot with the held marker;
                    // spent holds keep the row at the acted position; the holder's
                    // natural-Phase rows stay unmarked
                    if (!isPast && combatant.holdsPositionAtAbs(abs)) {
                        row.css = `${row.css} is-holding-action hero-held-row`.trim();
                        row.name = `⏳ ${row.name} (held)`;
                    } else if (!isPast && combatant.spentHoldAtAbs(abs)) {
                        row.css = `${row.css} is-holding-action`.trim();
                        // Present tense while the used Held Action is still the active
                        // turn; past tense once the pointer has moved on (#4603)
                        const acting = combatant.id === activeCombatantId && abs === currentAbs;
                        row.name = `${row.name} (${acting ? "acting" : "acted"})`;
                    } else if (
                        !isPast &&
                        (combatant.abortSpentAbs === abs ||
                            (combatant.abortSpentAbs === null && combatant.abortAppliesAtAbs?.(abs)))
                    ) {
                        // The Phase an abort consumed stays visible but greyed, so the
                        // table can see where the cost lands (6E2 22). Unrecorded aborts
                        // (bare status toggles) grey every Phase while the status binds.
                        row.css = `${row.css} hero-aborted-row`.trim();
                        row.name = `${row.name} (aborted)`;
                    }

                    // An elevated scoped-LR combatant acts early this segment only; the
                    // shadow row marks where the rest of the Phase lands afterwards
                    if (!group.lrShadow && combatant.lrElevatedAbs === abs) {
                        row.css = `${row.css} hero-lr-row`.trim();
                        row.name = `↯ ${row.name} (LR)`;
                    } else if (group.lrShadow) {
                        row.css = `${row.css} hero-lr-shadow`.trim();
                        row.name = `${row.name} (rest of Phase)`;
                        row.effects = { icons: [], tooltip: "" };
                    }

                    row.css = `${row.css} ${stateCss} ${memberClasses}`.trim();
                    if (isCurrent && combatant.id === activeCombatantId && !group.lrShadow) {
                        row.active = true;
                        row.css = `${row.css} active`.trim();
                    }

                    timelineTurns.push(row);
                }
            }
        }

        context.turns = timelineTurns;
        return context;
    }

    /**
     * Row tint class for the combatant's token disposition.
     * @param {Combatant} combatant
     * @returns {string}
     * @protected
     */
    _dispositionClass(combatant) {
        const token = combatant.token;
        switch (token?.disposition) {
            case CONST.TOKEN_DISPOSITIONS.FRIENDLY:
                return token.hasPlayerOwner
                    ? "combat-tracker-hero-disposition-player"
                    : "combat-tracker-hero-disposition-friendly";
            case CONST.TOKEN_DISPOSITIONS.NEUTRAL:
                return "combat-tracker-hero-disposition-neutral";
            case CONST.TOKEN_DISPOSITIONS.HOSTILE:
                return "combat-tracker-hero-disposition-hostile";
            case CONST.TOKEN_DISPOSITIONS.SECRET:
                return "combat-tracker-hero-disposition-secret";
            default:
                return "";
        }
    }

    /**
     * Resolves the combatant row element for a delegated tracker event.
     * Core handlers are delegated from the tracker root, so event.currentTarget
     * is not the row; walk up from the event target instead.
     * @param {Event} event
     * @param {HTMLElement} [target] - Explicit target element provided by core action dispatch
     * @returns {HTMLElement|null}
     * @private
     */
    _combatantRowFromEvent(event, target) {
        if (target?.dataset?.combatantId) return target;
        return event.target?.closest?.(".combatant[data-combatant-id]") ?? null;
    }

    /** @override */
    _onCombatantHoverIn(event) {
        const row = this._combatantRowFromEvent(event);
        // GUARD: Short-circuit fake layout rows and missing document references
        if (!row || !this.viewed?.combatants?.has(row.dataset.combatantId)) return;
        return super._onCombatantHoverIn(event);
    }

    /** @override */
    _onCombatantHoverOut(event) {
        const row = this._combatantRowFromEvent(event);
        if (!row || !this.viewed?.combatants?.has(row.dataset.combatantId)) return;
        return super._onCombatantHoverOut(event);
    }

    /** @override */
    _onCombatantMouseDown(event, target) {
        const row = this._combatantRowFromEvent(event, target);
        const combatantId = row?.dataset?.combatantId;
        if (!combatantId) return;

        // The Held Actions panel header toggles its expansion in place (no render:
        // a full re-render restores a stale scrollTop and yanks the list around)
        if (combatantId === "held-panel-header") {
            if (!this.viewed) return;
            const expand = row.classList.contains("segment-collapsed");
            this._setSegmentExpansion(this.viewed.id, "held", expand);
            row.classList.toggle("segment-collapsed", !expand);
            row.classList.toggle("segment-expanded", expand);
            row.closest(".combat-tracker")
                ?.querySelector(".hero-held-scroll-wrapper")
                ?.classList.toggle("hero-held-collapsed", !expand);
            return;
        }

        // Segment headers toggle their expansion in place; the current segment is
        // always expanded. Member rows carry hero-seg-abs-<abs> linkage classes so
        // the flip animates via CSS without a re-render.
        if (combatantId.startsWith("seg-header-")) {
            if (!this.viewed || row.classList.contains("active-segment-header-slot")) return;
            const parts = combatantId.split("-");
            const segment = parseInt(parts.at(-1));
            const round = parseInt(parts.at(-2));
            if (Number.isNaN(segment) || Number.isNaN(round)) return;
            const expand = row.classList.contains("segment-collapsed");
            const abs = round * 12 + segment;
            // Keyed by ABSOLUTE segment: a bare number would alias this Turn's
            // passed header with next Turn's future one
            this._setSegmentExpansion(this.viewed.id, abs, expand);
            row.classList.toggle("segment-collapsed", !expand);
            row.classList.toggle("segment-expanded", expand);
            row.closest(".combat-tracker")
                ?.querySelectorAll(`.hero-seg-abs-${abs}`)
                .forEach((li) => li.classList.toggle("segment-member-hidden", !expand));
            return;
        }

        // GUARD: Prevent clicking, panning, or pinging rows without a real combatant
        if (!this.viewed?.combatants?.has(combatantId)) return;

        // Group headers toggle their explosion; the active group cannot be collapsed
        if (row.classList.contains("hero-group-row")) {
            if (row.classList.contains("hero-group-locked")) return;
            const key = this.viewed.combatants.get(combatantId)?.actorId || combatantId;
            const explodedGroups = this._getExplodedGroups(this.viewed.id);
            if (row.classList.contains("hero-group-collapsed")) explodedGroups.add(key);
            else explodedGroups.delete(key);
            this.render();
            return;
        }

        return super._onCombatantMouseDown(event, row);
    }

    /**
     * All combatants sharing the clicked group row's root actor.
     * @param {string} combatantId
     * @returns {Combatant[]}
     * @private
     */
    _groupMembers(combatantId) {
        const representative = this.viewed?.combatants.get(combatantId);
        if (!representative) return [];
        const key = representative.actorId || representative.id;
        return this.viewed.combatants.filter((c) => (c.actorId || c.id) === key);
    }

    /**
     * Group header hide/defeated/ping buttons apply to every member of the group.
     * Pan stays single-target: there is only one camera.
     * @override
     */
    _onCombatantControl(event, target) {
        const row = target.closest("[data-combatant-id]");
        const action = target.dataset.action;
        if (!row?.classList.contains("hero-group-row")) return super._onCombatantControl(event, target);

        const members = this._groupMembers(row.dataset.combatantId);
        switch (action) {
            case "toggleHidden":
                return Promise.all(members.map((c) => this._onToggleHidden(c)));
            case "toggleDefeated": {
                // Mirrors core _onToggleDefeatedStatus for the whole group: every member
                // converges on the representative's next state. Linked tokens share one
                // actor document, so the status is set once per unique actor — concurrent
                // per-combatant toggles race and stack duplicate defeated/dead effects.
                const isDefeated = !this.viewed.combatants.get(row.dataset.combatantId)?.isDefeated;
                const flagUpdates = members.map((c) => ({ _id: c.id, defeated: isDefeated }));
                const uniqueActors = [
                    ...new Map(members.filter((c) => c.actor).map((c) => [c.actor.uuid, c.actor])).values(),
                ];
                return (async () => {
                    await this.viewed.updateEmbeddedDocuments("Combatant", flagUpdates);
                    const defeatedId = CONFIG.specialStatusEffects.DEFEATED;
                    for (const actor of uniqueActors) {
                        await actor.toggleStatusEffect(defeatedId, { overlay: true, active: isDefeated });
                    }
                })();
            }
            case "pingCombatant": {
                // Ping only visible members to avoid one core warning per hidden token;
                // fall back to the representative so an empty result still warns once
                const pingable = members.filter(
                    (c) => c.sceneId === canvas.scene?.id && c.token?.object && this._isTokenVisible(c.token.object),
                );
                if (pingable.length === 0) return super._onCombatantControl(event, target);
                return Promise.all(pingable.map((c) => this._onPingCombatant(c)));
            }
            default:
                return super._onCombatantControl(event, target);
        }
    }

    /**
     * Adds Hold/Abort entries to the row context menu and guards every entry against
     * the tracker's synthetic rows (segment headers, group summaries, the held panel).
     * @override
     */
    /**
     * Whether same-actor grouping is enabled world-wide; the split/rejoin
     * context options are meaningless (and hidden) without it.
     * @returns {boolean}
     * @private
     */
    _groupingEnabled() {
        try {
            return !!game.settings.get(game.system.id, "combatTrackerGrouping");
        } catch (e) {
            void e; // setting not registered yet
            return true;
        }
    }

    _getEntryContextOptions() {
        // HERO rolls no initiative in this tracker (priorities derive from DEX +
        // the per-segment tie rolls), so core's Clear/Reroll Initiative entries
        // could only corrupt the derived values
        const coreInitiativeOptions = new Set(["COMBATANT.ACTIONS.Clear", "COMBATANT.ACTIONS.Reroll"]);
        const options = super._getEntryContextOptions().filter((option) => !coreInitiativeOptions.has(option.label));
        const getCombatant = (li) => this.viewed?.combatants.get(li.dataset?.combatantId) ?? null;

        for (const option of options) {
            const visible = option.visible;
            option.visible = (li) =>
                !!getCombatant(li) && (typeof visible === "function" ? visible.call(this, li) : (visible ?? true));
        }

        options.push(
            {
                label: "Hold Action…",
                icon: "fa-solid fa-hourglass-half",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    // Holds are declared on the character's own Phase (6E2 20); declaring
                    // out of turn would let the banked Phase land earlier than it should.
                    // The GM is exempt for NPC bookkeeping.
                    return (
                        !!combatant?.isOwner &&
                        !!this.viewed?.started &&
                        !combatant.heldAction &&
                        (game.user.isGM || this.viewed?.combatant?.id === combatant.id)
                    );
                },
                onClick: (event, li) => this._onDeclareHoldAction(li.dataset.combatantId),
            },
            {
                label: "Use Held Action",
                icon: "fa-solid fa-bolt",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    return !!combatant?.isOwner && !!combatant.heldAction;
                },
                onClick: (event, li) => this._onUseHeldAction(li.dataset.combatantId),
            },
            {
                label: "Re-declare Hold…",
                icon: "fa-solid fa-hourglass-half",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    if (!combatant?.isOwner || !combatant.heldAction) return false;
                    // The banked Phase can be re-pointed when its moment arrives: the
                    // pointer is on the holder (held-slot interrupt) or the hold waits
                    // in the panel; the GM may re-point at any time
                    if (game.user.isGM) return true;
                    return this.viewed?.combatant?.id === combatant.id || combatant.heldAction.mode !== "position";
                },
                onClick: (event, li) => this._onRedeclareHoldAction(li.dataset.combatantId),
            },
            {
                label: "Release Hold",
                icon: "fa-solid fa-hand",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    return !!combatant?.isOwner && !!combatant.heldAction;
                },
                onClick: (event, li) => this._onReleaseHeldAction(li.dataset.combatantId),
            },
            {
                label: "Split from Group",
                icon: "fa-solid fa-arrow-right-from-bracket",
                visible: (li) => {
                    if (!game.user.isGM || !this._groupingEnabled()) return false;
                    // The ×N summary row represents the whole group — splitting "it"
                    // would really split whichever member's id the row carries.
                    // Explode the group and split individual members instead.
                    if (li.classList?.contains("hero-group-row")) return false;
                    const combatant = getCombatant(li);
                    if (!combatant || combatant.getFlag(game.system.id, "soloTieRoll")) return false;
                    // Only meaningful when a same-actor sibling exists to group with
                    return this.viewed.combatants.some(
                        (c) => c.id !== combatant.id && c.actorId && c.actorId === combatant.actorId,
                    );
                },
                onClick: (event, li) => this.viewed?.setCombatantSoloTieRoll?.(li.dataset.combatantId, true),
            },
            {
                label: "Split All from Group",
                icon: "fa-solid fa-arrows-split-up-and-left",
                visible: (li) => {
                    if (!game.user.isGM || !this._groupingEnabled()) return false;
                    const combatant = getCombatant(li);
                    if (!combatant?.actorId || combatant.getFlag(game.system.id, "soloTieRoll")) return false;
                    // Only for a genuine ×N group: two or more non-solo members
                    return (
                        this.viewed.combatants.filter(
                            (c) => c.actorId === combatant.actorId && !c.getFlag(game.system.id, "soloTieRoll"),
                        ).length > 1
                    );
                },
                onClick: (event, li) => {
                    const combat = this.viewed;
                    const combatant = combat?.combatants.get(li.dataset.combatantId);
                    if (!combatant?.actorId) return;
                    const ids = combat.combatants
                        .filter((c) => c.actorId === combatant.actorId && !c.getFlag(game.system.id, "soloTieRoll"))
                        .map((c) => c.id);
                    combat.setCombatantsSoloTieRoll?.(ids, true);
                },
            },
            {
                label: "Rejoin Group",
                icon: "fa-solid fa-arrow-right-to-bracket",
                visible: (li) => {
                    if (!game.user.isGM || !this._groupingEnabled()) return false;
                    return !!getCombatant(li)?.getFlag(game.system.id, "soloTieRoll");
                },
                onClick: (event, li) => this.viewed?.setCombatantSoloTieRoll?.(li.dataset.combatantId, false),
            },
            {
                label: "Rejoin All to Group",
                icon: "fa-solid fa-arrows-to-dot",
                visible: (li) => {
                    if (!game.user.isGM || !this._groupingEnabled()) return false;
                    const combatant = getCombatant(li);
                    if (!combatant?.actorId) return false;
                    // Meaningful once two or more members are split out
                    return (
                        this.viewed.combatants.filter(
                            (c) => c.actorId === combatant.actorId && c.getFlag(game.system.id, "soloTieRoll"),
                        ).length > 1
                    );
                },
                onClick: (event, li) => {
                    const combat = this.viewed;
                    const combatant = combat?.combatants.get(li.dataset.combatantId);
                    if (!combatant?.actorId) return;
                    const ids = combat.combatants
                        .filter((c) => c.actorId === combatant.actorId && c.getFlag(game.system.id, "soloTieRoll"))
                        .map((c) => c.id);
                    combat.setCombatantsSoloTieRoll?.(ids, false);
                },
            },
            {
                label: "Remove Group from Combat",
                icon: "fa-solid fa-users-slash",
                visible: (li) => {
                    if (!game.user.isGM) return false;
                    const combatant = getCombatant(li);
                    const combat = this.viewed;
                    if (!combatant || !combat?._tieRollKey) return false;
                    // Same membership rule the ×N display grouping uses; split-out
                    // (solo) members are their own group and keep the single remove
                    const key = combat._tieRollKey(combatant);
                    return combat.combatants.filter((c) => combat._tieRollKey(c) === key).length > 1;
                },
                onClick: async (event, li) => {
                    const combat = this.viewed;
                    const combatant = combat?.combatants.get(li.dataset.combatantId);
                    if (!combatant || !game.user.isGM) return;
                    const key = combat._tieRollKey(combatant);
                    const ids = combat.combatants.filter((c) => combat._tieRollKey(c) === key).map((c) => c.id);
                    await combat.deleteEmbeddedDocuments("Combatant", ids);
                },
            },
            {
                label: "Act Early (Lightning Reflexes)",
                icon: "fa-solid fa-bolt-lightning",
                visible: (li) => this._lrElevationState(getCombatant(li)) === "available",
                onClick: (event, li) => this._onToggleLrElevation(li.dataset.combatantId),
            },
            {
                label: "Cancel Act Early (LR)",
                icon: "fa-solid fa-rotate-left",
                visible: (li) => this._lrElevationState(getCombatant(li)) === "elevated",
                onClick: (event, li) => this._onToggleLrElevation(li.dataset.combatantId),
            },
            {
                label: "Abort…",
                icon: "fa-solid fa-shield-halved",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    return !!combatant?.isOwner && !!this.viewed?.started && !combatant.abortEffect;
                },
                onClick: (event, li) => this._onAbortAction(li.dataset.combatantId),
            },
            {
                label: "Cancel Abort",
                icon: "fa-solid fa-rotate-left",
                visible: (li) => {
                    const combatant = getCombatant(li);
                    return !!combatant?.isOwner && !!combatant.abortEffect;
                },
                onClick: (event, li) => this._onCancelAbort(li.dataset.combatantId),
            },
        );

        return options;
    }

    /**
     * Posts a hold-related chat card, whispered to the GM for hidden combatants.
     * @param {Combatant} combatant
     * @param {string} content
     * @private
     */
    _holdCard(combatant, content) {
        const data = { speaker: ChatMessage.getSpeaker({ actor: combatant.actor }), content };
        if (combatant.hidden) data.whisper = ChatMessage.getWhisperRecipients("GM");
        return ChatMessage.create(data);
    }

    /**
     * Whether the combatant has already used their action this Segment: they spent
     * a Held Action here, or their turn in the sorted order has already passed.
     * @param {Combatant} combatant
     * @returns {boolean}
     * @private
     */
    _actedThisSegment(combatant) {
        const combat = this.viewed;
        if (!combat?.started) return false;
        const turnIndex = combat.turns?.findIndex((t) => t.id === combatant.id) ?? -1;
        return (
            combatant.spentHoldInSegment(combat.segment) ||
            (combatant.occupiesSegment?.(combat.segment) && turnIndex !== -1 && turnIndex < (combat.turn ?? 0))
        );
    }

    /**
     * The shared Hold Action dialog (6E2 20-21; 5ER 360-361): a position (segment +
     * DEX, only legal segments offered per the null zone), an event trigger, or a
     * generic hold. A decimal DEX (e.g. 13.12) pins the exact tie-break position;
     * whole numbers keep the segment's random tie-break roll.
     * @param {Combatant} combatant
     * @param {object} [options]
     * @param {string} [options.title] - Dialog title prefix
     * @param {object} [options.initial] - Existing hold to prefill (re-declare)
     * @returns {Promise<{mode: string, segmentAbs?: number, dex?: number, fraction?: number,
     *                    trigger?: string}|null>}
     * @private
     */
    async _holdDeclarationDialog(combatant, { title = "Hold Action", initial = null } = {}) {
        const combat = this.viewed;
        const actor = combatant.actor;
        const currentAbs = combat.round * 12 + combat.segment;
        const characteristicKey = actor.system?.initiativeCharacteristic ?? "dex";
        const ownDex = actor.system?.characteristics?.[characteristicKey]?.value ?? 10;
        // Only unrestricted All Actions LR raises the holding position — holding is
        // not the scoped action a restricted purchase was bought for
        const actingDex = ownDex + (combatant.lightningReflexes?.always ?? 0);
        // Same-segment holds must slot below the position the count has reached
        const actingThreshold = combat.getFlag(game.system.id, "actingPriority") ?? actingDex;

        // Legal window: from now up to (not including) the segment of the next natural
        // Phase — a Held Action is lost the moment that segment begins (null zone)
        const spd = combatant.combatSpd;
        const nextNaturalAbs = spd > 0 ? HeroSystem6eCombatantSingle.nextPhaseAbs(spd, currentAbs + 1) : currentAbs;
        const segmentChoices = [];
        for (let abs = currentAbs; abs < nextNaturalAbs; abs++) {
            const segment = ((abs - 1) % 12) + 1;
            const round = Math.floor((abs - 1) / 12);
            segmentChoices.push({
                abs,
                label: `Segment ${segment}${round === combat.round ? "" : ` (Turn ${round})`}`,
            });
        }

        const defaultDexValue =
            initial?.mode === "position" && initial.dex !== undefined
                ? initial.fraction !== undefined
                    ? (initial.dex + initial.fraction).toFixed(2)
                    : String(initial.dex)
                : String(Math.max(0, ownDex - 1));
        const initialSegmentAbs = initial?.mode === "position" ? initial.segmentAbs : null;
        const checkedMode = initial?.mode ?? (segmentChoices.length ? "position" : "event");

        const escapeHTML = foundry.utils.escapeHTML ?? ((value) => Handlebars.escapeExpression(value));

        // Anchored reentry ("act right after X") tracks the anchor's live position; a
        // numeric DEX cannot, because tie-break fractions re-roll every segment (#4602).
        // Eligible anchors per candidate segment: only combatants who actually receive
        // a stop there (natural Phase or held slot; defeated/aborted/spent excluded),
        // ordered by acting position.
        const anchorChoicesByAbs = {};
        for (const choice of segmentChoices) {
            const segment = ((choice.abs - 1) % 12) + 1;
            anchorChoicesByAbs[choice.abs] = combat.combatants.contents
                .filter((c) => c.id !== combatant.id && c.actor && (!c.hidden || game.user.isGM))
                .filter((c) => combat._takesTurnInSegment(c, segment, { queryAbs: choice.abs }))
                .map((c) => ({
                    id: c.id,
                    name: c.name,
                    priority: combat.getInitiativePriority(c, segment, { queryAbs: choice.abs }),
                }))
                .sort((a, b) => b.priority - a.priority);
        }
        const anchorOptionsHTML = (abs, selectedId) =>
            (anchorChoicesByAbs[abs] ?? [])
                .map(
                    (entry) =>
                        `<option value="${entry.id}" ${entry.id === selectedId ? "selected" : ""}>${escapeHTML(entry.name)} (DEX ${Math.floor(entry.priority)})</option>`,
                )
                .join("");

        const selectedSegmentAbs = segmentChoices.some((c) => c.abs === initialSegmentAbs)
            ? initialSegmentAbs
            : (segmentChoices[0]?.abs ?? null);
        const initialAnchorId = initial?.mode === "position" ? (initial.anchor?.combatantId ?? null) : null;
        const initialRelation = initial?.anchor?.relation === "before" ? "before" : "after";
        // Anchoring is the friendlier default; only a redeclared numeric hold opens
        // on the DEX branch. An unanchorable segment flips to DEX at render time.
        const initialKind = initialAnchorId || initial?.mode !== "position" ? "anchor" : "dex";

        const positionOption = segmentChoices.length
            ? `<label><input type="radio" name="hold-mode" value="position" ${checkedMode === "position" ? "checked" : ""}> Until a position</label>
               <div class="form-group">
                   <label>Segment</label>
                   <select name="hold-segment">${segmentChoices
                       .map(
                           (choice) =>
                               `<option value="${choice.abs}" ${choice.abs === initialSegmentAbs ? "selected" : ""}>${choice.label}</option>`,
                       )
                       .join("")}</select>
               </div>
               <div class="form-group">
                   <label><input type="radio" name="hold-position-kind" value="anchor" ${initialKind === "anchor" ? "checked" : ""}> Next to a combatant</label>
                   <select name="hold-anchor">${anchorOptionsHTML(selectedSegmentAbs, initialAnchorId)}</select>
               </div>
               <div class="form-group hero-hold-relation">
                   <label><input type="radio" name="hold-anchor-relation" value="after" ${initialRelation === "after" ? "checked" : ""}> Right after</label>
                   <label><input type="radio" name="hold-anchor-relation" value="before" ${initialRelation === "before" ? "checked" : ""}> Right before</label>
               </div>
               <div class="form-group">
                   <label><input type="radio" name="hold-position-kind" value="dex" ${initialKind === "dex" ? "checked" : ""}> At a DEX count</label>
                   <input type="number" name="hold-dex" value="${defaultDexValue}" min="0" max="99.99" step="0.01">
               </div>`
            : "";
        const content = `<fieldset class="hero-hold-dialog">
            <legend>Hold until</legend>
            ${positionOption}
            <label><input type="radio" name="hold-mode" value="event" ${checkedMode === "event" || (!positionOption && checkedMode !== "generic") ? "checked" : ""}> An event</label>
            <div class="form-group">
                <input type="text" name="hold-trigger" placeholder="e.g. if the guard turns around" value="${escapeHTML(initial?.trigger ?? "")}">
            </div>
            <label><input type="radio" name="hold-mode" value="generic" ${checkedMode === "generic" ? "checked" : ""}> Generic (no precondition — GM discretion)</label>
        </fieldset>`;

        const result = await foundry.applications.api.DialogV2.wait({
            window: { title: `${title} — ${actor.name}` },
            content,
            // DEX count and anchor are mutually exclusive: the unchecked branch's
            // controls grey out, and the anchor list re-filters per segment
            render: (event, dialog) => {
                const root = dialog.element;
                const segmentSelect = root?.querySelector?.('select[name="hold-segment"]');
                const anchorSelect = root?.querySelector?.('select[name="hold-anchor"]');
                if (!segmentSelect || !anchorSelect) return;
                const dexInput = root.querySelector('input[name="hold-dex"]');
                const kindRadios = [...root.querySelectorAll('input[name="hold-position-kind"]')];
                const relationRadios = [...root.querySelectorAll('input[name="hold-anchor-relation"]')];
                const syncControls = () => {
                    const kind = kindRadios.find((r) => r.checked)?.value ?? "dex";
                    if (dexInput) dexInput.disabled = kind !== "dex";
                    anchorSelect.disabled = kind !== "anchor";
                    for (const r of relationRadios) r.disabled = kind !== "anchor";
                };
                const rebuildAnchors = () => {
                    const prior = anchorSelect.value;
                    anchorSelect.innerHTML = anchorOptionsHTML(parseInt(segmentSelect.value), prior || initialAnchorId);
                    // A segment nobody acts in cannot be anchored
                    const anchorKind = kindRadios.find((r) => r.value === "anchor");
                    const dexKind = kindRadios.find((r) => r.value === "dex");
                    if (anchorKind) {
                        anchorKind.disabled = !anchorSelect.options.length;
                        if (anchorKind.disabled && anchorKind.checked && dexKind) dexKind.checked = true;
                    }
                    syncControls();
                };
                segmentSelect.addEventListener("change", rebuildAnchors);
                for (const r of kindRadios) r.addEventListener("change", syncControls);
                rebuildAnchors();
            },
            buttons: [
                {
                    action: "hold",
                    label: "Hold",
                    default: true,
                    callback: (event, button) => {
                        const form = button.form.elements;
                        return {
                            mode: form["hold-mode"].value,
                            segmentAbs: parseInt(form["hold-segment"]?.value),
                            positionKind: form["hold-position-kind"]?.value ?? "dex",
                            dexRaw: parseFloat(form["hold-dex"]?.value),
                            anchorId: form["hold-anchor"]?.value || null,
                            relation: form["hold-anchor-relation"]?.value ?? "after",
                            trigger: form["hold-trigger"]?.value.trim() ?? "",
                        };
                    },
                },
                { action: "cancel", label: "Cancel" },
            ],
            rejectClose: false,
        });
        if (!result || result === "cancel") return null;

        if (result.mode === "position") {
            const segmentAbs = Number.isFinite(result.segmentAbs) ? result.segmentAbs : currentAbs;
            if (result.positionKind === "anchor") {
                const anchorTarget = result.anchorId ? combat.combatants.get(result.anchorId) : null;
                if (!anchorTarget) {
                    ui.notifications.warn(`Select a combatant to hold next to.`);
                    return null;
                }
                const segment = ((segmentAbs - 1) % 12) + 1;
                const targetPriority = combat.getInitiativePriority(anchorTarget, segment, { queryAbs: segmentAbs });
                if (!(targetPriority > 0)) {
                    ui.notifications.warn(
                        `${anchorTarget.name} has no Phase or held position in ${HeroSystem6eCombatantSingle.phaseLabel(segmentAbs)}.`,
                    );
                    return null;
                }
                const relation = result.relation === "before" ? "before" : "after";
                // The holder shares the anchor's exact scalar, so the anchor itself
                // must sit below the count for a same-segment hold
                if (segmentAbs === currentAbs && targetPriority >= actingThreshold) {
                    ui.notifications.warn(
                        `A same-segment hold must slot below the current acting position (${actingThreshold.toFixed(2)}).`,
                    );
                    return null;
                }
                return {
                    mode: "position",
                    segmentAbs,
                    // Declaration-time snapshot: the fallback acting position should
                    // the anchor later vanish from the segment
                    dex: Math.floor(targetPriority),
                    anchor: { combatantId: anchorTarget.id, relation, name: anchorTarget.name },
                };
            }
            const dexRaw = Number.isFinite(result.dexRaw) ? result.dexRaw : Math.max(0, ownDex - 1);
            const dex = Math.floor(dexRaw);
            const fraction = Number.isInteger(dexRaw) ? undefined : Math.round((dexRaw - dex) * 100) / 100;
            // An integer entry is judged pessimistically: its random fraction could
            // land anywhere below the next whole DEX
            const effective = dex + (fraction ?? 1);
            if (segmentAbs === currentAbs && effective >= actingThreshold) {
                ui.notifications.warn(
                    `A same-segment hold must slot below the current acting position (${actingThreshold.toFixed(2)}).`,
                );
                return null;
            }
            return { mode: "position", segmentAbs, dex, ...(fraction !== undefined ? { fraction } : {}) };
        }
        if (result.mode === "event") return { mode: "event", trigger: result.trigger };
        return { mode: "generic" };
    }

    /**
     * Human-readable clause for a hold declaration's target ("until DEX 13.12 in
     * Segment 4", "until right after Grond in Segment 4", "— until: the guard
     * turns around").
     * @param {object} hold
     * @returns {string}
     * @private
     */
    _holdDescription(hold) {
        if (hold.mode === "position") {
            const where = HeroSystem6eCombatantSingle.phaseLabel(hold.segmentAbs);
            if (hold.anchor) {
                const relation = hold.anchor.relation === "before" ? "before" : "after";
                return `until right ${relation} ${hold.anchor.name ?? "their anchor"} in ${where}`;
            }
            return `until DEX ${hold.fraction !== undefined ? (hold.dex + hold.fraction).toFixed(2) : hold.dex} in ${where}`;
        }
        if (hold.mode === "event") return hold.trigger ? `— until: ${hold.trigger}` : "until a declared event";
        return "with no declared condition";
    }

    /**
     * Declares a fresh Held Action for the combatant and ends their turn.
     * @param {string} combatantId
     * @protected
     */
    async _onDeclareHoldAction(combatantId) {
        const combat = this.viewed;
        const combatant = combat?.combatants.get(combatantId);
        const actor = combatant?.actor;
        if (!combat?.started || !combatant?.isOwner || !actor) return;
        if (combatant.heldAction) return;
        const blocked = this._blockedActionReason(combatant);
        if (blocked) return void ui.notifications.warn(blocked);
        // Holds are declared on the character's own Phase (6E2 20); the GM may backfill
        if (!game.user.isGM && combat.combatant?.id !== combatant.id) {
            return void ui.notifications.warn(`Held Actions are declared on the character's own Phase.`);
        }
        // One banked Phase, ever (6E2 20): a combatant who already used this Segment's
        // action cannot bank another
        if (this._actedThisSegment(combatant)) {
            if (!game.user.isGM) {
                return void ui.notifications.warn(
                    `${actor.name} has already acted this Segment and cannot declare a Held Action.`,
                );
            }
            const proceed = await foundry.applications.api.DialogV2.confirm({
                window: { title: `Hold Action — ${actor.name}` },
                content: `<p>${actor.name} has already acted this Segment. Declare a Held Action anyway?</p>`,
                rejectClose: false,
            });
            if (!proceed) return;
        }

        const currentAbs = combat.round * 12 + combat.segment;
        const choice = await this._holdDeclarationDialog(combatant);
        if (!choice) return;

        const hold = {
            ...choice,
            declaredAbs: currentAbs,
            id: foundry.utils.randomID(),
            combatantId: combatant.id,
        };
        const description = this._holdDescription(hold);

        await this._applyHoldingEffect(combatant, hold);
        await this._holdCard(
            combatant,
            `${actor.name} holds their action ${description} (declared in ${HeroSystem6eCombatantSingle.phaseLabel(currentAbs)}).`,
        );
        await combat.logEvent("hold.declare", {
            combatant,
            data: {
                mode: hold.mode,
                segmentAbs: hold.segmentAbs ?? null,
                dex: hold.dex ?? null,
                fraction: hold.fraction ?? null,
                anchor: hold.anchor ?? null,
                trigger: hold.trigger ?? null,
            },
        });

        // Declaring a hold IS the combatant's Phase: end their turn
        if (combat.combatant?.id === combatant.id) {
            try {
                await combat.nextTurn();
            } catch (e) {
                console.warn(`Unable to advance the turn after declaring a hold`, e);
            }
        }
    }

    /**
     * Re-declares an existing Held Action in place — the banked Phase moves to a new
     * position/condition without being spent and without granting a new Phase. The
     * null-zone window is recomputed from the current position; declaredAbs is
     * refreshed so the hold expires relative to the re-declaration.
     * @param {string} combatantId
     * @protected
     */
    async _onRedeclareHoldAction(combatantId) {
        const combat = this.viewed;
        const combatant = combat?.combatants.get(combatantId);
        const effect = combatant?.heldActionEffect;
        if (!combat?.started || !combatant?.isOwner || !effect) return;
        const blocked = this._blockedActionReason(combatant);
        if (blocked) return void ui.notifications.warn(blocked);

        const currentAbs = combat.round * 12 + combat.segment;
        const existing = combatant.heldAction;
        const choice = await this._holdDeclarationDialog(combatant, {
            title: "Re-declare Hold",
            initial: existing,
        });
        if (!choice) return;

        const hold = {
            ...choice,
            declaredAbs: currentAbs,
            id: foundry.utils.randomID(),
            combatantId: combatant.id,
        };
        // Replace the flag wholesale in ONE write: setFlag merges (stale position
        // keys would survive a conversion to event/generic), and a delete-then-set
        // pair leaves a window where every client reads a bare generic hold
        await effect.update({
            [`flags.${game.system.id}.-=hold`]: null,
            [`flags.${game.system.id}.hold`]: hold,
        });

        const description = this._holdDescription(hold);
        await this._holdCard(
            combatant,
            `${combatant.actor.name} re-declares their Held Action ${description} (in ${HeroSystem6eCombatantSingle.phaseLabel(currentAbs)}).`,
        );
        await combat.logEvent("hold.redeclare", {
            combatant,
            data: {
                mode: hold.mode,
                segmentAbs: hold.segmentAbs ?? null,
                dex: hold.dex ?? null,
                fraction: hold.fraction ?? null,
                anchor: hold.anchor ?? null,
                trigger: hold.trigger ?? null,
            },
        });
    }

    /**
     * Creates a status effect for one combatant of the actor. toggleStatusEffect
     * cannot be used when a sibling combatant of the same (linked) actor already
     * carries the status — it would reuse (and the caller would overwrite) the
     * sibling's effect — so a parallel effect is created from the status definition.
     * @param {Actor} actor
     * @param {string} statusId
     * @returns {Promise<ActiveEffect|null>}
     * @private
     */
    async _createStatusEffectFor(actor, statusId) {
        if (!actor.statuses.has(statusId)) {
            await actor.toggleStatusEffect(statusId, { active: true });
            return actor.effects.find((e) => e.statuses.has(statusId)) ?? null;
        }
        // Adopt a bare same-status effect nobody owns (a token-HUD toggle carries
        // no combatantId) — a parallel duplicate could never be consumed by any
        // tracker flow and would orphan the status on the actor forever
        const flagKey = { holding: "hold", aborted: "abort" }[statusId];
        const orphan = flagKey
            ? actor.effects.find((e) => e.statuses.has(statusId) && !e.getFlag(game.system.id, flagKey)?.combatantId)
            : null;
        if (orphan) return orphan;
        const effectData = await ActiveEffect.implementation.fromStatusEffect(statusId);
        return (await ActiveEffect.implementation.create(effectData.toObject(), { parent: actor })) ?? null;
    }

    /**
     * Creates the holding effect that carries a hold declaration.
     * @param {Combatant} combatant
     * @param {object} hold
     * @returns {Promise<ActiveEffect|null>}
     * @private
     */
    async _applyHoldingEffect(combatant, hold) {
        const effect = await this._createStatusEffectFor(combatant.actor, "holding");
        if (effect) await effect.setFlag(game.system.id, "hold", hold);
        return effect;
    }

    /**
     * Consumes a Held Action: the holder acts right now, at whatever point in the
     * order the table has reached. The turn pointer is deliberately not moved.
     * @param {string} combatantId
     * @protected
     */
    async _onUseHeldAction(combatantId) {
        const combat = this.viewed;
        const combatant = combat?.combatants.get(combatantId);
        const actor = combatant?.actor;
        const effect = combatant?.heldActionEffect;
        if (!combatant?.isOwner || !effect) return;
        const blocked = this._blockedActionReason(combatant);
        if (blocked) return void ui.notifications.warn(blocked);
        const hold = combatant.heldAction;
        await effect.delete();
        await this._recordSpentAction(combatant, hold);
        await this._holdCard(
            combatant,
            `${actor.name} uses their Held Action in ${combat.currentPhaseLabel}.
            <div class="card-buttons">
                <button type="button" class="hero-timing-contest" data-combat-id="${combat.id}" data-combatant-id="${combatant.id}">
                    <i class="fa-solid fa-stopwatch"></i> Timing contest vs the current actor
                </button>
            </div>
            <p class="hint">Only if the Actions collide: defensive (abortable-to) Actions simply go first — no roll needed.</p>`,
        );
        await combat.logEvent("hold.use", { combatant, data: { mode: hold?.mode ?? null } });
    }

    /**
     * Using (or aborting with) a Held Action consumes this segment's action: it takes
     * the place of the Phase — a character cannot have two Phases in one Segment
     * (6E2 20; 5ER 360). Records the acted position so turn flow skips the natural
     * Phase and the tracker keeps the row where they acted.
     * @param {Combatant} combatant
     * @param {{mode: string, segmentAbs?: number, dex?: number}|null} hold - The hold as it was before deletion
     * @private
     */
    async _recordSpentAction(combatant, hold) {
        const combat = this.viewed;
        if (!combat?.started || !hold) return;
        const currentAbs = combat.round * 12 + combat.segment;
        const atOwnSlot = hold.mode === "position" && hold.segmentAbs === currentAbs;
        const replacesNaturalPhase = hold.mode !== "position" && combatant.hasPhaseInSegment(combat.segment);
        if (!atOwnSlot && !replacesNaturalPhase) return;
        // An anchored slot resolves to concrete numbers as it is spent — the display
        // record must not drift if the anchor later moves or leaves
        const anchored = atOwnSlot && hold.anchor ? combat.resolveHoldAnchorPriority(hold, currentAbs) : null;
        const dex =
            anchored !== null
                ? Math.floor(anchored)
                : atOwnSlot
                  ? hold.dex
                  : Math.floor(combat.getInitiativePriority(combatant, combat.segment));
        const spent = { segmentAbs: currentAbs, dex };
        if (anchored !== null) {
            spent.fraction = anchored - Math.floor(anchored);
            // The spent row shares the anchor's exact scalar; ordering still
            // needs the adjacency side for the rest of the segment
            spent.anchor = {
                combatantId: hold.anchor.combatantId,
                relation: hold.anchor.relation === "before" ? "before" : "after",
            };
        } else if (atOwnSlot && hold.fraction !== undefined) spent.fraction = hold.fraction;
        await combatant.update({
            [`flags.${game.system.id}.spentHoldPosition`]: spent,
            // A stale slot-taken marker would spend the NEXT hold declared this segment
            [`flags.${game.system.id}.heldSlotTakenAbs`]: null,
        });
    }

    /**
     * Drops a Held Action without acting.
     * @param {string} combatantId
     * @protected
     */
    async _onReleaseHeldAction(combatantId) {
        const combatant = this.viewed?.combatants.get(combatantId);
        const actor = combatant?.actor;
        const effect = combatant?.heldActionEffect;
        if (!combatant?.isOwner || !effect) return;
        const hold = combatant.heldAction;
        await effect.delete();
        // Releasing at the held slot still forfeits that position (the banked Phase is
        // gone); releasing an event/generic hold costs nothing — the natural Phase stays
        if (hold?.mode === "position") await this._recordSpentAction(combatant, hold);
        await this._holdCard(
            combatant,
            `${actor.name} releases their Held Action without acting in ${this.viewed.currentPhaseLabel}.`,
        );
        await this.viewed.logEvent("hold.release", { combatant, data: { mode: hold?.mode ?? null } });
    }

    /**
     * Whether a scoped Lightning Reflexes elevation is possible for this combatant
     * right now: "available" while the elevated position is still ahead of the
     * segment's count, "elevated" while an elevation can still be cancelled (its
     * turn has not arrived), null otherwise.
     * @param {Combatant|null} combatant
     * @returns {"available"|"elevated"|null}
     * @protected
     */
    _lrElevationState(combatant) {
        const combat = this.viewed;
        if (!combat?.started || !combatant?.isOwner || !combatant.actor) return null;
        const scoped = combatant.lightningReflexes?.scoped;
        if (!scoped) return null;

        const currentAbs = combat.round * 12 + combat.segment;
        const turnIndex = combat.turns?.findIndex((t) => t.id === combatant.id) ?? -1;
        const reached = turnIndex !== -1 && turnIndex <= (combat.turn ?? 0);

        if (combatant.lrElevatedAbs === currentAbs) {
            // Cancellable until the elevated stop arrives; ending that stop returns
            // the rest of the Phase at natural DEX automatically (nextTurn)
            return reached ? null : "elevated";
        }

        // Elevation moves this segment's natural Phase earlier: it needs a Phase here,
        // an action still unspent, and an elevated position the count has not passed.
        // A position only counts as passed once someone has COMPLETED a turn above it
        // (the segment high-water mark) — the current actor merely being up has not
        // passed it; elevating above them preempts the pointer instead.
        if (!combatant.hasPhaseInSegment(combat.segment)) return null;
        if (combatant.heldAction) return null;
        if (combatant.spentHoldInSegment?.(combat.segment)) return null;
        if (reached) return null;
        const elevatedPriority = combat.getInitiativePriority(combatant, combat.segment) + scoped.levels;
        const highWater = combat.getFlag(game.system.id, "segmentHighWater") ?? null;
        if (highWater !== null && elevatedPriority >= highWater) return null;
        return "available";
    }

    /**
     * Toggles a scoped Lightning Reflexes elevation for the current segment. The
     * elevated character acts at DEX + LR but may only execute the scoped action
     * (6E1 116; 5ER 96); cancelling before the elevated turn arrives restores the
     * natural position. The pointer is re-synced to the same active combatant, since
     * the flag write re-sorts the turns array under the stored index.
     * @param {string} combatantId
     * @protected
     */
    async _onToggleLrElevation(combatantId) {
        const combat = this.viewed;
        const combatant = combat?.combatants.get(combatantId);
        const actor = combatant?.actor;
        if (!combat?.started || !combatant?.isOwner || !actor) return;

        const state = this._lrElevationState(combatant);
        if (!state) return;
        const activeId = combat.combatant?.id ?? null;

        if (state === "elevated") {
            await combatant.unsetFlag(game.system.id, "lrElevatedAbs");
            await this._holdCard(combatant, `${actor.name} stands down to their natural DEX.`);
            await combat.logEvent("lr.cancel", { combatant });
        } else {
            const blocked = this._blockedActionReason(combatant);
            if (blocked) return void ui.notifications.warn(blocked);
            const currentAbs = combat.round * 12 + combat.segment;
            await combatant.setFlag(game.system.id, "lrElevatedAbs", currentAbs);
            const elevatedPriority = combat.getInitiativePriority(combatant, combat.segment);
            await this._holdCard(
                combatant,
                `${actor.name} acts early at effective DEX ${Math.floor(elevatedPriority)} (Lightning Reflexes — only: ${combatant.lightningReflexes.scoped.label}); the rest of their Phase follows at their natural DEX.`,
            );
            await combat.logEvent("lr.elevate", { combatant, priority: elevatedPriority, data: { auto: false } });

            // Elevating above the unacted current actor preempts the pointer: the
            // count has not reached that position, so the LR stop goes first and the
            // displaced actor re-enters via the acting-priority threshold afterwards.
            // lrPreemptPointer re-checks and, for players, relays through the GM.
            const actingPriority =
                combat.getFlag(game.system.id, "actingPriority") ??
                (activeId ? combat.getInitiativePriority(combat.combatants.get(activeId), combat.segment) : -Infinity);
            if (activeId && activeId !== combatant.id && elevatedPriority > actingPriority) {
                await combat.lrPreemptPointer(combatant.id, activeId);
                return;
            }
        }

        await this._resyncTurnPointer(combat, activeId);
    }

    /**
     * Points the turn index back at the given combatant after a mid-segment priority
     * change re-sorted the turns array. previousCombatantId is the active combatant
     * itself so the natural-turn hold consumption's self-advance guard skips this
     * pointer-only update.
     * @param {Combat} combat
     * @param {string|null} activeId
     * @private
     */
    async _resyncTurnPointer(combat, activeId) {
        return combat?.resyncTurnPointer?.(activeId);
    }

    /**
     * Why the combatant cannot take a voluntary action right now, or null when
     * unblocked. A Stunned character can take no Action at all — not even Aborting
     * (6E2 105); an aborted character cannot act again until the Phase they aborted
     * has passed (6E2 22; 5ER 361).
     * @param {Combatant} combatant
     * @returns {string|null}
     * @private
     */
    _blockedActionReason(combatant) {
        const combat = this.viewed;
        const actor = combatant?.actor;
        if (!actor) return null;
        if (actor.statuses.has("stunned")) {
            return `${actor.name} is Stunned and can take no Actions — not even Aborting.`;
        }
        if (combat?.started) {
            const currentAbs = combat.round * 12 + combat.segment;
            // Extra Phase (and kin): no other Actions while the activation runs
            const committed = (combat.delayedActionsFor?.(combatant) ?? []).find(
                ([, record]) =>
                    record.commit && (record.declaredAbs ?? 0) <= currentAbs && currentAbs <= (record.resolveAbs ?? 0),
            );
            if (committed) {
                return `${actor.name} is activating ${committed[1].label} and can take no other Actions until it goes off.`;
            }
            if (combatant.abortAppliesAtAbs?.(currentAbs)) {
                const spentAbs = combatant.abortSpentAbs;
                const until =
                    spentAbs === null
                        ? "their aborted Phase has passed"
                        : `Segment ${HeroSystem6eCombatantSingle.segmentOf(spentAbs)} has passed`;
                return `${actor.name} has Aborted and cannot act again until ${until}.`;
            }
        }
        return null;
    }

    /**
     * Why a fresh abort is illegal right now, or null. Beyond the shared action
     * guards, a character who already used their Phase this Segment cannot Abort
     * until the next Segment (6E2 22; 5ER 361).
     * @param {Combatant} combatant
     * @returns {string|null}
     * @private
     */
    _blockedAbortReason(combatant) {
        const shared = this._blockedActionReason(combatant);
        if (shared) return shared;
        const combat = this.viewed;
        if (!combat?.started) return null;
        const turnIndex = combat.turns?.findIndex((t) => t.id === combatant.id) ?? -1;
        const actedThisSegment =
            combatant.spentHoldInSegment(combat.segment) ||
            (combatant.occupiesSegment?.(combat.segment) && turnIndex !== -1 && turnIndex < (combat.turn ?? 0));
        if (actedThisSegment) {
            return `${combatant.actor.name} has already acted this Segment and cannot Abort until the next Segment.`;
        }
        return null;
    }

    /**
     * The Phases a fresh abort would consume from the current combat position: the
     * current Phase when the pointer is on the combatant (their DEX came up without
     * acting — e.g. a Held Action interrupt), otherwise the next full Phase; an
     * Extra Phase power consumes the one after as well (6E2 22).
     * @param {Combatant} combatant
     * @param {{extraPhase?: boolean}} [options]
     * @returns {{isActive: boolean, firstAbs: number, spentAbs: number, nextActAbs: number}}
     * @private
     */
    _abortCost(combatant, { extraPhase = false } = {}) {
        const combat = this.viewed;
        const currentAbs = combat.round * 12 + combat.segment;
        const isActive = combat.combatant?.id === combatant.id;
        const spd = combatant.combatSpd;
        const firstAbs = isActive ? currentAbs : HeroSystem6eCombatantSingle.nextPhaseAbs(spd, currentAbs);
        const spentAbs = extraPhase ? HeroSystem6eCombatantSingle.nextPhaseAbs(spd, firstAbs + 1) : firstAbs;
        const nextActAbs = HeroSystem6eCombatantSingle.nextPhaseAbs(spd, spentAbs + 1);
        return { isActive, firstAbs, spentAbs, nextActAbs };
    }

    /**
     * Applies an abort to a defensive Action (6E2 21-22; 5ER 361). A held Phase is
     * spent instead when the combatant is holding — no further Phase is lost;
     * otherwise the consumed Phase is recorded and the aborted status enforces the
     * lockout until it passes. When the abort replaces the current Phase, the turn
     * advances.
     * @param {Combatant} combatant
     * @param {object} [options]
     * @param {string} [options.toAction] - Defensive action label for the chat card
     * @param {string} [options.statusId] - Maneuver status to apply alongside (e.g. dodge, block)
     * @param {boolean} [options.extraPhase] - The power takes an Extra Phase: two Phases are consumed
     * @param {boolean} [options.force] - Skip the legality guards (GM override)
     * @returns {Promise<boolean>} Whether the abort was applied
     * @protected
     */
    async _declareAbort(combatant, options = {}) {
        // Latched for the whole declaration: the defense toggle re-enters
        // promptOutOfTurnAbortForManeuver, and creating the aborted status fires
        // the bare-status-toggle hook — neither may re-prompt for the abort this
        // very flow is declaring
        this._abortFlowActive = true;
        try {
            return await this.#declareAbortInner(combatant, options);
        } finally {
            this._abortFlowActive = false;
        }
    }

    /**
     * @see _declareAbort
     */
    async #declareAbortInner(
        combatant,
        { toAction = "a defensive Action", statusId = null, extraPhase = false, force = false } = {},
    ) {
        const combat = this.viewed;
        const actor = combatant?.actor;
        if (!combat?.started || !combatant?.isOwner || !actor) return false;
        if (combatant.abortEffect) return false;
        // The isActive read below must see settled pointer state, or an abort on
        // the active combatant can silently skip its end-of-turn
        await combat.settleMaintenance?.();

        if (!force) {
            const reason = this._blockedAbortReason(combatant);
            if (reason) {
                ui.notifications.warn(reason);
                return false;
            }
        }

        if (statusId) await this._applyAbortDefense(actor, statusId);

        // A held Phase absorbs the abort — no further Phases are lost (6E2 22; 5ER 361)
        const holdingEffect = combatant.heldActionEffect;
        if (holdingEffect) {
            const hold = combatant.heldAction;
            await holdingEffect.delete();
            await this._recordSpentAction(combatant, hold);
            await this._holdCard(
                combatant,
                `${actor.name} Aborts to ${toAction} using their Held Action in ${combat.currentPhaseLabel} — no further Phase is lost.`,
            );
            await combat.logEvent("abort.declare", {
                combatant,
                data: { toAction, viaHold: true, spentAbs: combat.round * 12 + combat.segment },
            });
            return true;
        }

        const abortEffect = await this._createStatusEffectFor(actor, "aborted");

        // SPD 0 has no Phase to consume; bind the record (spentAbs null = until removed)
        // and leave the cost for the GM to adjudicate
        if (combatant.combatSpd <= 0) {
            if (abortEffect)
                await abortEffect.setFlag(game.system.id, "abort", { spentAbs: null, combatantId: combatant.id });
            await this._holdCard(combatant, `${actor.name} Aborts to ${toAction} in ${combat.currentPhaseLabel}.`);
            await combat.logEvent("abort.declare", { combatant, data: { toAction, spentAbs: null } });
            return true;
        }

        const { isActive, firstAbs, spentAbs, nextActAbs } = this._abortCost(combatant, { extraPhase });
        if (abortEffect) await abortEffect.setFlag(game.system.id, "abort", { spentAbs, combatantId: combatant.id });

        const { phaseLabel } = HeroSystem6eCombatantSingle;
        const costText = extraPhase
            ? `their Phases in ${phaseLabel(firstAbs)} and ${phaseLabel(spentAbs)} (Extra Phase)`
            : isActive
              ? `their current Phase (${phaseLabel(spentAbs)})`
              : `their Phase in ${phaseLabel(spentAbs)}`;
        await this._holdCard(
            combatant,
            `${actor.name} Aborts to ${toAction} — this consumes ${costText}; they cannot act again until ${phaseLabel(nextActAbs)}.`,
        );
        await combat.logEvent("abort.declare", { combatant, data: { toAction, spentAbs, extraPhase } });

        if (isActive) {
            try {
                await combat.nextTurn();
            } catch (e) {
                console.warn(`Unable to advance the turn after an abort`, e);
            }
        }
        return true;
    }

    /**
     * Applies the defensive maneuver chosen in the abort dialog through the actor's
     * real maneuver item, so the effect carries its CV changes and the standard
     * next-Phase expiry flags. Falls back to the bare status icon for actors without
     * the item (e.g. tokens that never went through upload).
     * @param {Actor} actor
     * @param {string} statusId - dodge or block
     * @private
     */
    async _applyAbortDefense(actor, statusId) {
        const xmlid = { dodge: "DODGE", block: "BLOCK" }[statusId];
        const maneuverItem = xmlid
            ? actor.items.find((i) => ["maneuver", "martialart"].includes(i.type) && i.system?.XMLID === xmlid)
            : null;
        if (maneuverItem) {
            if (!maneuverItem.isActive) await maneuverItem.toggle();
            return;
        }
        await actor.toggleStatusEffect(statusId, { active: true });
    }

    /**
     * Opens the abort declaration dialog: what the character aborts to (flavor for
     * the chat card; Dodge and Block also activate their maneuver) and, for the
     * GM, whether the power takes an Extra Phase. Blocked aborts warn players; the
     * GM may override.
     * @param {string} combatantId
     * @protected
     */
    async _onAbortAction(combatantId) {
        const combat = this.viewed;
        const combatant = combat?.combatants.get(combatantId);
        const actor = combatant?.actor;
        if (!combat?.started || !combatant?.isOwner || !actor) return;
        if (combatant.abortEffect) return;

        const reason = this._blockedAbortReason(combatant);
        if (reason && !game.user.isGM) return void ui.notifications.warn(reason);
        if (reason) {
            const proceed = await foundry.applications.api.DialogV2.confirm({
                window: { title: `Abort — ${actor.name}` },
                content: `<p>${reason}</p><p>Abort anyway?</p>`,
                rejectClose: false,
            });
            if (!proceed) return;
        }

        const { segmentOf, roundOf } = HeroSystem6eCombatantSingle;
        const holding = !!combatant.heldAction;
        let costLine;
        if (holding) {
            costLine = "The Held Action will be spent — no further Phase is lost.";
        } else if (combatant.combatSpd <= 0) {
            costLine = "No Phases on the Speed Chart — the GM adjudicates the cost.";
        } else {
            const { isActive, spentAbs, nextActAbs } = this._abortCost(combatant);
            const roundLabel = roundOf(spentAbs) === combat.round ? "" : ` (Turn ${roundOf(spentAbs)})`;
            costLine = isActive
                ? `This consumes the current Phase and ends the turn; ${actor.name} cannot act again until Segment ${segmentOf(nextActAbs)}.`
                : `This consumes the Phase in Segment ${segmentOf(spentAbs)}${roundLabel}; ${actor.name} cannot act again until Segment ${segmentOf(nextActAbs)}.`;
        }

        const extraPhaseOption =
            game.user.isGM && !holding && combatant.combatSpd > 0
                ? `<label><input type="checkbox" name="abort-extra-phase"> Power takes an Extra Phase (consumes two Phases)</label>`
                : "";

        const content = `<fieldset class="hero-hold-dialog">
            <legend>Abort to</legend>
            <div class="form-group">
                <select name="abort-action">
                    <option value="dodge">Dodge</option>
                    <option value="block">Block</option>
                    <option value="dive">Dive For Cover</option>
                    <option value="other">Other defensive Action</option>
                </select>
                <input type="text" name="abort-detail" placeholder="details, e.g. activate Force Field">
            </div>
            ${extraPhaseOption}
            <p class="hint">${costLine}</p>
        </fieldset>`;

        const result = await foundry.applications.api.DialogV2.wait({
            window: { title: `Abort — ${actor.name}` },
            content,
            buttons: [
                {
                    action: "abort",
                    label: "Abort",
                    default: true,
                    callback: (event, button) => {
                        const form = button.form.elements;
                        return {
                            action: form["abort-action"].value,
                            detail: form["abort-detail"]?.value.trim() ?? "",
                            extraPhase: !!form["abort-extra-phase"]?.checked,
                        };
                    },
                },
                { action: "cancel", label: "Cancel" },
            ],
            rejectClose: false,
        });
        if (!result || result === "cancel") return;

        const labels = { dodge: "Dodge", block: "Block", dive: "Dive For Cover", other: "a defensive Action" };
        const statusIds = { dodge: "dodge", block: "block" };
        // Guards already ran above (with the GM override prompt)
        await this._declareAbort(combatant, {
            toAction: result.detail || labels[result.action] || "a defensive Action",
            statusId: statusIds[result.action] ?? null,
            extraPhase: result.extraPhase,
            force: true,
        });
    }

    /**
     * Removes the aborted status — the correction tool for a mis-declared abort.
     * @param {string} combatantId
     * @protected
     */
    async _onCancelAbort(combatantId) {
        const combatant = this.viewed?.combatants.get(combatantId);
        const effect = combatant?.abortEffect;
        if (!combatant?.isOwner || !effect) return;
        await effect.delete();
        await this.viewed.logEvent("abort.cancel", { combatant });
    }
}
