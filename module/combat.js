export class HeroSystem6eCombat extends Combat {
    constructor(data, context) {
        super(data, context);

        this.segments = [];
        for (let s = 1; s <= 12; s++) {
            this.segments[s] = [];
        }

        this.previous = this.previous || {
            combatantId: null,
        };
    }

    /**
     * Roll initiative for one or multiple Combatants within the Combat entity
     * @param {string|string[]} ids     A Combatant id or Array of ids for which to roll
     * @param {object} [options={}]     Additional options which modify how initiative rolls are created or presented.
     * @param {string|null} [options.formula]         A non-default initiative formula to roll. Otherwise the system default is used.
     * @param {boolean} [options.updateTurn=true]     Update the Combat heroTurn after adding new initiative scores to keep the heroTurn on the same Combatant.
     * @param {object} [options.messageOptions={}]    Additional options with which to customize created Chat Messages
     * @return {Promise<Combat>}        A promise which resolves to the updated Combat entity once updates are complete.
     */

    async rollInitiative() {
        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        for (let [id /*, value*/] of this.combatants.entries()) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) return this;
            //if (combatant.hasRolled) continue;

            if (!combatant.actor) continue;

            // Produce an initiative roll for the Combatant
            let characteristic =
                combatant.actor.system?.initiativeCharacteristic || "dex";
            let dexValue =
                combatant.actor.system.characteristics[characteristic].value;
            let intValue = combatant.actor.system.characteristics.int.value;
            let initiativeValue = dexValue + intValue / 100;

            updates.push({
                _id: id,
                initiative: initiativeValue || 0,
            });
        }
        if (!updates.length) return this;

        // Update multiple combatants
        await this.updateEmbeddedDocuments("Combatant", updates);

        return this;
    }

    /* -------------------------------------------- */

    /**
     * Return the Array of combatants sorted into initiative order, breaking ties alphabetically by name.
     * @return {Combatant[]}
     */

    setupTurns() {
        // Roll Initiative everytime as DEX/INT/SPD may have changed
        this.rollAll();

        // Determine the turn order and the current turn
        const turnsRaw = this.combatants.contents.sort(this._sortCombatants);

        for (let i = 0; i < this.combatants.contents.length; i++) {
            let combatant = turnsRaw[i];

            // Lightning Reflexes
            const actor = game.actors.get(combatant.actorId);
            if (!actor) {
                continue; // Not sure how this could happen
            }

            const item = actor.items.find(
                (o) =>
                    o.system.XMLID === "LIGHTNING_REFLEXES_ALL" ||
                    o.system.XMLID === "LIGHTNING_REFLEXES_SINGLE",
            );
            if (item) {
                const levels =
                    item.system.LEVELS?.value ||
                    item.system.LEVELS ||
                    item.system.levels ||
                    item.system.other.levels ||
                    0;
                const lightning_reflex_initiative =
                    combatant.initiative + parseInt(levels);
                const alias =
                    item.system.OPTION_ALIAS ||
                    item.system.INPUT ||
                    "All Actions";
                const lightning_reflex_alias = "(" + alias + ")";

                const combatantLR = new HeroCombatant(combatant);
                combatantLR.initiative = lightning_reflex_initiative;
                combatantLR.alias = lightning_reflex_alias;
                combatantLR.isFake = true;
                turnsRaw.push(combatantLR);
            }
        }

        turnsRaw.sort(this._sortCombatants);

        // this.turns is an array of combatants.  These combatants typically appear more than
        // once in the array (1/SPEED).  Any change to one combatant for a specific token seems
        // to update all combatant entries for that speicifc token.  So we can't store unique
        // data in combatant (like segment number).  Using turnsExtra to store unique data (like segment).
        //this.turnsExtra = []

        // Assign Combatent copies to appopriate segements
        // Notice segment[0] is unused
        let turns = [];
        for (let s = 1; s <= 12; s++) {
            this.segments[s] = [];
            for (let t = 0; t < turnsRaw.length; t++) {
                if (!turnsRaw[t].actor) {
                    //ui.notifications.warn(`${turnsRaw[t].name} references an Actor which no longer exists within the World.`);
                    continue;
                }
                if (
                    HeroSystem6eCombat.hasPhase(
                        turnsRaw[t].actor.system.characteristics.spd.value,
                        s,
                    )
                ) {
                    let combatant = new HeroCombatant(turnsRaw[t]);
                    combatant.turn = turns.length;
                    combatant.segment = s;
                    this.segments[s].push(combatant);
                    turns.push(combatant);
                }
            }
        }

        if (this.turn !== null)
            this.turn = Math.clamped(this.turn, 0, turns.length - 1);

        // Update state tracking
        let c = turns[this.turn];
        this.current = {
            round: this.round,
            turn: this.turn,
            combatantId: c ? c.id : null,
            tokenId: c ? c.tokenId : null,
        };

        // One-time initialization of the previous state
        if (!this.previous) this.previous = this.current;

        // Return the array of prepared turns
        return (this.turns = turns);
    }

    _sortCombatants(a, b) {
        const initA = Number.isNumeric(a.initiative) ? a.initiative : -9999;
        const initB = Number.isNumeric(b.initiative) ? b.initiative : -9999;

        let initDifference = initB - initA;
        if (initDifference != 0) {
            return initDifference;
        }

        const typeA = a.actor?.hasPlayerOwner || a.hasPlayerOwner;
        const typeB = b.actor?.hasPlayerOwner || b.hasPlayerOwner;

        if (typeA != typeB) {
            if (typeA) {
                return -1;
            }
            if (typeB) {
                return 1;
            }
        }
    }

    _sortSegments(a, b) {
        const initA = Number.isNumeric(a.combatant.initiative)
            ? a.combatant.initiative
            : -9999;
        const initB = Number.isNumeric(b.combatant.initiative)
            ? b.combatant.initiative
            : -9999;

        let initDifference = initB - initA;
        if (initDifference != 0) {
            return initDifference;
        }

        const typeA = a.combatant.hasPlayerOwner;
        const typeB = b.combatant.hasPlayerOwner;

        if (typeA != typeB) {
            if (typeA) {
                return -1;
            }
            if (typeB) {
                return 1;
            }
        }
    }

    // Standard HeroSystem rules per SPEED CHART
    static hasPhase(spd, segment) {
        switch (parseInt(spd)) {
            case 1:
                return [7].includes(segment);
            case 2:
                return [6, 12].includes(segment);
            case 3:
                return [4, 8, 12].includes(segment);
            case 4:
                return [3, 6, 9, 12].includes(segment);
            case 5:
                return [3, 5, 8, 10, 12].includes(segment);
            case 6:
                return [2, 4, 6, 8, 10, 12].includes(segment);
            case 7:
                return [2, 4, 6, 7, 9, 11, 12].includes(segment);
            case 8:
                return [2, 3, 5, 6, 8, 9, 11, 12].includes(segment);
            case 9:
                return [2, 3, 4, 6, 7, 8, 10, 11, 12].includes(segment);
            case 10:
                return [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].includes(segment);
            case 11:
                return [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].includes(segment);
            case 12:
                return true;
            default:
                if (spd < 1) return false;
                return true;
        }
    }

    /* -------------------------------------------- */

    /**
     * Begin the combat encounter, advancing to heroRound 1 and heroTurn 1
     * @return {Promise<Combat>}
     */
    // async startCombat() {
    //     this.setSegment(12)
    //     return await this.update({ round: 1, turn: 0 });
    // }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onUpdate(data, options, userId) {
        //console.log("_onUpdate")
        super._onUpdate(data, options, userId);
        if (data.combatants) this.setupTurns();

        // Render the sidebar
        if (data.active === true) ui.combat.initialize({ combat: this });
        return ui.combat.scrollToTurn();
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onCreateDescendantDocuments(
        parent,
        collection,
        documents,
        data,
        options,
        userId,
    ) {
        //console.log("_onCreateDescendantDocuments");

        //Missing actor?
        let missingActors = documents.filter((o) => !o.actor);
        {
            for (let c of missingActors) {
                ui.notifications.warn(
                    `${c.name} references an Actor which no longer exists within the World.`,
                );
            }
        }

        documents = documents.filter((o) => o.actor);
        if (documents.length === 0) return;

        // Get current combatant
        const current = this.combatant;

        // Super
        await super._onCreateDescendantDocuments(
            parent,
            collection,
            documents,
            data,
            options,
            userId,
        );

        // Setup turns in segment fashion
        this.setupTurns();

        // Keep the current Combatant the same after adding new Combatants to the Combat
        if (current) {
            let activeTurn = this.turns.find(
                (o) =>
                    o.tokenId === current.tokenId &&
                    o.segment === current.segment &&
                    o.initiative == current.initiative,
            ).turn;
            activeTurn = Math.clamped(activeTurn, 0, this.turns.length - 1);

            // Edge case where combat tracker is empty and this is the first combatant.
            // Advance to phase 12
            while (
                this.round === 1 &&
                activeTurn < this.turns.length - 1 &&
                this.turns[activeTurn].segment < 12
            ) {
                activeTurn++;
            }

            // Another Edge case where combatant has speed of 1 and thus no segment 12
            if (this.round === 1 && this.turns[activeTurn].segment != 12) {
                this.round = 2;
            }

            await this.update({ turn: activeTurn, round: this.round });
        }

        // Render the collection
        if (this.active) this.collection.render();
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onDeleteDescendantDocuments(
        parent,
        collection,
        documents,
        ids,
        options,
        userId,
    ) {
        //console.log("_onDeleteDescendantDocuments")

        // Update the heroTurn order and adjust the combat to keep the combatant the same (unless they were deleted)

        // Get current (active) combatant
        const current = this.combatant;

        // Assign new turn to combatants
        let j = 0;
        for (let _combatant of this.turns) {
            if (!documents.map((o) => o.tokenId).includes(_combatant.tokenId)) {
                _combatant.turn = j++;
            } else {
                _combatant.turn = null;
            }
        }

        // Find the expected new active turn
        let activeTurn = this.turns.indexOf(current);

        // Advance activeTurn if it has a null turn value (about to be deleted).
        while (
            activeTurn > -1 &&
            activeTurn < this.turns.length &&
            this.turns[activeTurn].turn === null
        ) {
            activeTurn++;
        }
        activeTurn = this.turns[activeTurn]?.turn || activeTurn;

        // Super
        super._onDeleteDescendantDocuments(
            parent,
            collection,
            documents,
            ids,
            options,
            userId,
        );

        // Setup turns in segment fashion
        this.setupTurns();

        const updateData = {};

        // If activeTurn == -1 then combat has not begun
        if (activeTurn > -1) {
            // There is an edge case where the last combatant of the round is deleted.
            activeTurn = Math.clamped(activeTurn, 0, this.turns.length - 1);
            //await this.update({ turn: activeTurn });
            updateData.turn = activeTurn;
        }

        // Determine segement
        let segment_prev = current?.segment;
        let segment = this.combatant?.segment;
        let advanceTime = segment - segment_prev || 0;

        const updateOptions = { advanceTime, direction: 1 };
        //Hooks.callAll("combatTurn", this, updateData, updateOptions);
        await this.update(updateData, updateOptions);

        // Render the collection
        if (this.active) this.collection.render();
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onUpdateDescendantDocuments(...args) {
        //console.log("_onUpdateDescendantDocuments")
        super._onUpdateEmbeddedDocuments(...args);
        this.setupTurns();

        // // If the current combatant was removed, update the heroTurn order to the next survivor
        // let heroTurn = this.heroTurn;
        // if (result.includes(currId)) {
        //     if (nextSurvivor) heroTurn = this.segments[this.segment].findIndex(t => t.id === nextSurvivor.id);
        // }

        // // Otherwise keep the combatant the same
        // else heroTurn = this.segments[this.segment].findIndex(t => t.id === currId);

        // // Update database or perform a local override
        // heroTurn = Math.max(heroTurn, 0);

        // if (game.user.id === userId) this.update({ heroTurn });
        // else this.update({ heroTurn });

        // Render the collection
        if (this.active) this.collection.render();
    }

    async _onActorDataUpdate(...args) {
        console.log("_onActorDataUpdate");
        super._onActorDataUpdate(...args);
        this.setupTurns();
        if (this.active) this.collection.render();
    }

    /* -------------------------------------------- */

    /**
     * Manage the execution of Combat lifecycle events.
     * This method orchestrates the execution of four events in the following order, as applicable:
     * 1. End Turn
     * 2. End Round
     * 3. Begin Round
     * 4. Begin Turn
     * Each lifecycle event is an async method, and each is awaited before proceeding.
     * @param {number} [adjustedTurn]   Optionally, an adjusted turn to commit to the Combat.
     * @returns {Promise<void>}
     * @protected
     */
    async _manageTurnEvents(adjustedTurn) {
        //console.log("_manageTurnEvents", adjustedTurn)
        await super._manageTurnEvents(adjustedTurn);
    }

    /**
     * A workflow that occurs at the start of each Combat Turn.
     * This workflow occurs after the Combat document update, new turn information exists in this.current.
     * This can be overridden to implement system-specific combat tracking behaviors.
     * This method only executes for one designated GM user. If no GM users are present this method will not be called.
     * @param {Combatant} combatant     The Combatant whose turn just started
     * @returns {Promise<void>}
     * @protected
     */
    async _onStartTurn(combatant) {
        //console.log("_onStartTurn", combatant.name)
        await super._onStartTurn(combatant);

        // Guard
        if (!combatant) return;

        // Reset movement history
        if (dragRuler) {
            await dragRuler.resetMovementHistory(this, combatant.id);
        }

        // STUNNING
        // The character remains Stunned and can take no
        // Actions (not even Aborting to a defensive action) until his next
        // Phase.
        // Use actor.canAct to block actions
        // Remove STUNNED effect _onEndTurn

        // Spend END for all active powers
        let content = "";
        let spentEnd = 0;

        for (let powerUsingEnd of combatant.actor.items.filter(
            (o) =>
                o.system.active === true &&
                parseInt(o.system?.end || 0) > 0 &&
                (o.system.subType || o.type) != "attack",
        )) {
            const costEndOnlyToActivate = powerUsingEnd.system.MODIFIER.find(
                (o) => o.XMLID === "COSTSEND" && o.OPTION === "ACTIVATE",
            );
            if (!costEndOnlyToActivate) {
                let end = parseInt(powerUsingEnd.system.end);
                spentEnd += end;
                content += `<li>${powerUsingEnd.name} (${end})</li>`;
            }
        }

        const encumbered = combatant.actor.effects.find(
            (o) => o.flags.encumbrance,
        );
        if (encumbered) {
            const endCostPerTurn =
                Math.abs(parseInt(encumbered.flags?.dcvDex)) - 1;
            if (endCostPerTurn > 0) {
                spentEnd += endCostPerTurn;
                content += `<li>${encumbered.name} (${endCostPerTurn})</li>`;
            }
        }

        if (spentEnd > 0 && !this.combatant.isFake) {
            let segment = this.combatant.segment;
            let value = parseInt(
                this.combatant.actor.system.characteristics.end.value,
            );
            let newEnd = value;
            newEnd -= spentEnd;

            await this.combatant.actor.update({
                "system.characteristics.end.value": newEnd,
            });

            content = `Spent ${spentEnd} END (${value} to ${newEnd}) on turn ${this.round} segment ${segment}:<ul>${content}</ul>`;

            const token = combatant.token;
            const speaker = ChatMessage.getSpeaker({
                actor: combatant.actor,
                token,
            });
            speaker["alias"] = combatant.actor.name;
            const chatData = {
                user: game.user._id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: content,
                whisper: ChatMessage.getWhisperRecipients("GM"),
                speaker,
            };

            await ChatMessage.create(chatData);
        }

        // Some attacks include a DCV penalty which was added as an ActiveEffect.
        // At the beginning of our turn we make sure that AE is deleted.
        const removeOnNextPhase = combatant.actor.effects.filter(
            (o) =>
                o.flags.nextPhase && o.duration.startTime < game.time.worldTime,
        );
        for (const ae of removeOnNextPhase) {
            await ae.delete();
        }

        // Remove Aborted
        if (combatant.actor.statuses.has("aborted")) {
            const effect = combatant.actor.effects.contents.find((o) =>
                o.statuses.has("aborted"),
            );
            await effect.delete();
        }
    }

    /**
     * A workflow that occurs at the end of each Combat Turn.
     * This workflow occurs after the Combat document update, prior round information exists in this.previous.
     * This can be overridden to implement system-specific combat tracking behaviors.
     * This method only executes for one designated GM user. If no GM users are present this method will not be called.
     * @param {Combatant} combatant     The Combatant whose turn just ended
     * @returns {Promise<void>}
     * @protected
     */
    async _onEndTurn(combatant) {
        console.log("_onEndTurn", combatant.name);

        const automation = game.settings.get(
            "hero6efoundryvttv2",
            "automation",
        );

        // Hover (flight) uses 1 END
        if (
            automation === "all" ||
            (automation === "npcOnly" && combatant.actor.type == "npc") ||
            (automation === "pcEndOnly" && combatant.actor.type === "pc")
        ) {
            if (combatant.actor?.flags?.activeMovement === "flight") {
                console.log(combatant.actor);
                if (dragRuler?.getRangesFromSpeedProvider) {
                    if (
                        dragRuler.getMovedDistanceFromToken(
                            combatant.token.object,
                        ) === 0
                    ) {
                        let endValue =
                            parseInt(
                                combatant.actor.system.characteristics.end
                                    .value,
                            ) - 1;
                        await combatant.actor.update({
                            "system.characteristics.end.value": endValue,
                        });
                    }
                }
            }
        }

        super._onEndTurn(combatant);

        // At the end of the Segment, any non-Persistent Powers, and any Skill Levels of any type, turn off for STUNNED actors.
        if (
            this.turns?.[this.turn]?.segment !=
            this.turns?.[this.turn - 1]?.segment
        ) {
            console.log("next segment");
            for (let _combatant of this.combatants) {
                if (
                    _combatant.actor.statuses.has("stunned") ||
                    _combatant.actor.statuses.has("knockedout")
                ) {
                    for (const item of _combatant.actor.getActiveConstantItems()) {
                        await item.toggle();
                    }
                }
            }
        }

        if (combatant.actor.statuses.has("stunned")) {
            const effect = combatant.actor.effects.contents.find((o) =>
                o.statuses.has("stunned"),
            );

            await effect.delete();

            let content = `${combatant.actor.name} recovers from being stunned.`;
            const token = combatant.token;
            const speaker = ChatMessage.getSpeaker({
                actor: combatant.actor,
                token,
            });
            speaker["alias"] = combatant.actor.name;
            const chatData = {
                user: game.user._id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: content,
                //speaker: speaker
            };

            await ChatMessage.create(chatData);
        }
    }

    /**
     * A workflow that occurs at the end of each Combat Round.
     * This workflow occurs after the Combat document update, prior round information exists in this.previous.
     * This can be overridden to implement system-specific combat tracking behaviors.
     * This method only executes for one designated GM user. If no GM users are present this method will not be called.
     * @returns {Promise<void>}
     * @protected
     */
    async _onEndRound() {
        //console.log("_onEndRound")

        super._onEndRound();

        // Make really sure we only call at the end of the round
        if (this.current.round > 1 && this.current.turn === 0) {
            return this.PostSegment12();
        }
    }

    // TODO: Replace with PostSegment12 activities.
    // Such as automatic recovery
    async PostSegment12() {
        // POST-SEGMENT 12 RECOVERY
        // After Segment 12 each Turn, all characters (except those deeply
        // unconscious or holding their breath) get a free Post-Segment 12
        // Recovery. This includes Stunned characters, although the Post-
        // Segment 12 Recovery does not eliminate the Stunned condition.

        const automation = game.settings.get(
            "hero6efoundryvttv2",
            "automation",
        );

        let content = `Post-Segment 12 (Turn ${this.round - 1})`;
        let contentHidden = `Post-Segment 12 (Turn ${this.round - 1})`;
        content += "<ul>";
        contentHidden += "<ul>";
        let hasHidden = false;
        for (let combatant of this.combatants.filter((o) => !o.defeated)) {
            const actor = combatant.actor;

            /// If this is an NPC and their STUN <= 0 then leave them be.
            // Typically, you should only use the Recovery Time Table for
            // PCs. Once an NPC is Knocked Out below the -10 STUN level
            // he should normally remain unconscious until the fight ends.
            // ACTOR#ONUPDATE SHOULD MARK AS DEFEATED
            // if (actor.type != "pc" && parseInt(actor.system.characteristics.stun.value) <= -10)
            // {
            //     //console.log("defeated", combatant)
            //     continue;
            // }

            // Make sure we have automation enabled
            if (
                automation === "all" ||
                (automation === "npcOnly" && actor.type == "npc") ||
                (automation === "pcEndOnly" && actor.type === "pc")
            ) {
                // Make sure combatant is visible in combat tracker
                if (!combatant.hidden) {
                    content +=
                        "<li>" +
                        (await combatant.actor.TakeRecovery()) +
                        "</li>";
                } else {
                    hasHidden = true;
                    contentHidden +=
                        "<li>" +
                        (await combatant.actor.TakeRecovery()) +
                        "</li>";
                }
            }
        }
        content += "</ul>";
        contentHidden += "</ul>";
        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: content,
        };

        await ChatMessage.create(chatData);

        if (hasHidden) {
            return ChatMessage.create({
                ...chatData,
                content: contentHidden,
                whisper: ChatMessage.getWhisperRecipients("GM"),
            });
        }
    }

    /**
     * Begin the combat encounter, advancing to round 1 and turn 1
     * @returns {Promise<Combat>}
     */
    async startCombat() {
        await super.startCombat();

        await this.setupTurns();

        // Find first TURN with segment 12
        if (!this.segments[12].length) return;
        let turn = this.segments[12][0]?.turn || 1;

        const updateData = { round: 1, turn: turn };
        return this.update(updateData);
    }

    /**
     * Rewind the combat to the previous turn
     * @returns {Promise<Combat>}
     */
    async previousTurn() {
        //console.log("previousTurn");
        if (this.turn === 0 && this.round === 0) return this;
        else if (this.turn <= 0 && this.turn !== null)
            return this.previousRound();

        // Hero combats start with round 1 and segment 12.
        // So anything less than segment 12 will call previousTurn
        let segment12turn = this.segments[12][0]?.turn || -1;
        if (this.round <= 1 && this.turn <= segment12turn) {
            return this.previousRound();
        }

        let previousTurn = (this.turn ?? this.turns.length) - 1;

        // Determine segement
        let segment = this.combatant.segment;
        let segment_prev = this.turns[previousTurn].segment;
        let advanceTime = segment_prev - segment;
        if (advanceTime > 0) {
            advanceTime = 0;
        }

        // Update the document, passing data through a hook first
        const updateData = { round: this.round, turn: previousTurn };
        const updateOptions = { advanceTime, direction: -1 };
        Hooks.callAll("combatTurn", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }

    /**
     * Rewind the combat to the previous round
     * @returns {Promise<Combat>}
     */
    async previousRound() {
        //console.log("previousRound");
        let turn = this.round === 0 ? 0 : Math.max(this.turns.length - 1, 0);
        if (this.turn === null) turn = null;
        let round = Math.max(this.round - 1, 0);
        //let advanceTime = -1 * (this.turn || 0) * CONFIG.time.turnTime;
        //if (round > 0) advanceTime -= HERO.time.turn; //CONFIG.time.roundTime;

        // Determine segement
        let segment = this.combatant.segment;
        let segment_prev = this.turns[turn].segment;
        if (round > 0) {
            segment += 12;
        }
        let advanceTime = segment_prev - segment;

        // Hero combats start with round 1 and segment 12.
        // So anything less than segment 12 will call previousTurn
        let segment12turn = this.segments[12][0]?.turn || -1;
        if (round <= 1 && turn <= segment12turn) {
            round = 0;
            turn = null;
        }
        if (round == 0) {
            turn = null;
        }

        // Update the document, passing data through a hook first
        const updateData = { round, turn };
        const updateOptions = { advanceTime, direction: -1 };
        Hooks.callAll("combatRound", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }

    /**
     * Advance the combat to the next turn
     * @returns {Promise<Combat>}
     */
    async nextTurn() {
        let turn = this.turn ?? -1;
        let skip = this.settings.skipDefeated;

        // Determine the next turn number
        let next = null;
        if (skip) {
            for (let [i, t] of this.turns.entries()) {
                if (i <= turn) continue;
                if (t.isDefeated) continue;
                next = i;
                break;
            }
        } else next = turn + 1;

        // Maybe advance to the next round
        let round = this.round;
        if (this.round === 0 || next === null || next >= this.turns.length) {
            return this.nextRound();
        }

        // Determine segement
        let segment = this.combatant.segment;
        let segment_next = this.turns[next].segment;
        if (segment_next < segment) {
            segment_next += 12;
        }
        let advanceTime = segment_next - segment;

        // Update the document, passing data through a hook first
        const updateData = { round, turn: next };
        const updateOptions = { advanceTime: advanceTime, direction: 1 };
        Hooks.callAll("combatTurn", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }

    /**
     * Advance the combat to the next round
     * @returns {Promise<Combat>}
     */
    async nextRound() {
        let turn = this.turn === null ? null : 0; // Preserve the fact that it's no-one's turn currently.
        if (this.settings.skipDefeated && turn !== null) {
            turn = this.turns.findIndex((t) => !t.isDefeated);
            if (turn === -1) {
                ui.notifications.warn("COMBAT.NoneRemaining", {
                    localize: true,
                });
                turn = 0;
            }
        }
        //let advanceTime = Math.max(this.turns.length - this.turn, 0) * CONFIG.time.turnTime;
        //advanceTime += HERO.time.turn; //CONFIG.time.roundTime;
        let nextRound = this.round + 1;

        // Determine segement
        let segment = this.combatant.segment;
        let segment_next = this.turns[0].segment;
        //if (segment_next < segment) {
        segment_next += 12;
        //}
        let advanceTime = segment_next - segment;

        // Update the document, passing data through a hook first
        const updateData = { round: nextRound, turn };
        const updateOptions = { advanceTime, direction: 1 };
        Hooks.callAll("combatRound", this, updateData, updateOptions);
        return this.update(updateData, updateOptions);
    }
}

class HeroCombatant extends Combatant {
    constructor(combatant) {
        super();
        Object.assign(this, combatant);
        this.id = combatant.id;
    }

    id = null;
    initiative = null; //Override
    turn = null;
    segment = null;
    alias = null;
    isFake = false;
    //hasRolled = true; // Initiative is static, but actor DEX/INT/SPD might change
}
