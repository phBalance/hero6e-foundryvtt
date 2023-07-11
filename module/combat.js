import { HERO } from "./config.js";
import { HEROSYS } from "./herosystem6e.js";
import { onActiveEffectToggle } from "./utility/effects.js"

export class HeroSystem6eCombat extends Combat {
    constructor(data, context) {

        super(data, context);

        this.segments = []

        this.previous = this.previous || {
            combatantId: null
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

    async rollInitiative(ids, { formula = null, updateTurn = true, messageOptions = {} } = {}) {
        // Structure input data
        ids = typeof ids === "string" ? [ids] : ids;

        // Iterate over Combatants, performing an initiative roll for each
        const updates = [];
        const messages = [];
        for (let [id, value] of this.combatants.entries()) {
            // Get Combatant data (non-strictly)
            const combatant = this.combatants.get(id);
            if (!combatant?.isOwner) return results;
            //if (combatant.hasRolled) continue;

            // Produce an initiative roll for the Combatant
            let dexValue = combatant.actor.system.characteristics.dex.value
            let intValue = combatant.actor.system.characteristics.int.value
            let initativeValue = dexValue + (intValue / 100)

            updates.push({
                _id: id,
                initiative: initativeValue || 0,
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
            const item = actor.items.find(o => o.system.XMLID === "LIGHTNING_REFLEXES_ALL" || o.system.XMLID === "LIGHTNING_REFLEXES_SINGLE");
            if (item) {
                const levels = item.system.LEVELS?.value || item.system.LEVELS || item.system.levels || item.system.other.levels || 0
                const lightning_reflex_initiative = combatant.initiative + parseInt(levels);
                const alias = item.system.OPTION_ALIAS || item.system.INPUT || 'All Actions'
                const lightning_reflex_alias = '(' + alias + ')'

                const combatantLR = new HeroCombatant(combatant)
                combatantLR.initiative = lightning_reflex_initiative;
                combatantLR.alias = lightning_reflex_alias;
                combatantLR.isFake = true;
                turnsRaw.push(combatantLR);
            }
        }

        turnsRaw.sort(this._sortCombatants)



        // this.turns is an array of combatants.  These combatants typically appear more than
        // once in the array (1/SPEED).  Any change to one combatant for a specific token seems
        // to update all combatant entries for that speicifc token.  So we can't store unique
        // data in combatant (like segment number).  Using turnsExtra to store unique data (like segment).
        //this.turnsExtra = []

        // Assign Combatent copies to appopriate segements
        // Notice segment[0] is unused
        let turns = []
        for (let s = 1; s <= 12; s++) {
            this.segments[s] = []
            for (let t = 0; t < turnsRaw.length; t++) {
                if (HeroSystem6eCombat.hasPhase(turnsRaw[t].actor.system.characteristics.spd.value, s)) {
                    let combatant = new HeroCombatant(turnsRaw[t])
                    combatant.turn = turns.length;
                    combatant.segment = s;
                    this.segments[s].push(combatant);
                    turns.push(combatant);
                }
            }

        }

        if (this.turn !== null) this.turn = Math.clamped(this.turn, 0, turns.length - 1);

        // Update state tracking
        let c = turns[this.turn];
        this.current = {
            round: this.round,
            turn: this.turn,
            combatantId: c ? c.id : null,
            tokenId: c ? c.tokenId : null
        };

        // One-time initialization of the previous state
        if (!this.previous) this.previous = this.current;

        // Return the array of prepared turns
        return this.turns = turns;
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
        const initA = Number.isNumeric(a.combatant.initiative) ? a.combatant.initiative : -9999;
        const initB = Number.isNumeric(b.combatant.initiative) ? b.combatant.initiative : -9999;

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
    async _onCreateDescendantDocuments(...args) {
        //console.log("_onCreateDescendantDocuments");

        // Get current combatant
        const current = this.combatant;

        // Super
        await super._onCreateDescendantDocuments(...args);

        // Setup turns in segment fashion
        this.setupTurns();

        // Keep the current Combatant the same after adding new Combatants to the Combat
        if (current) {
            let activeTurn = this.turns.find(o => o.tokenId === current.tokenId && o.segment === current.segment && o.initiative == current.initiative).turn;
            activeTurn = Math.clamped(activeTurn, 0, this.turns.length - 1);
            await this.update({ turn: activeTurn });
        }

        // Render the collection
        if (this.active) this.collection.render();
    }

    /* -------------------------------------------- */

    /** @inheritdoc */
    async _onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId) {
        //console.log("_onDeleteDescendantDocuments")

        // Update the heroTurn order and adjust the combat to keep the combatant the same (unless they were deleted)


        // Get current (active) combatant
        const current = this.combatant;

        // Assign new turn to combatants
        let j = 0;
        for (let _combatant of this.turns) {
            if (!documents.map(o => o.tokenId).includes(_combatant.tokenId)) {
                _combatant.turn = j++;
            }
            else {
                _combatant.turn = null
            }
        }

        // Find the expected new active turn
        let activeTurn = this.turns.indexOf(current)




        // Advance activeTurn if it has a null turn value (about to be deleted).
        while (activeTurn > -1 && activeTurn < this.turns.length && this.turns[activeTurn].turn === null) {
            activeTurn++;
        }
        activeTurn = this.turns[activeTurn]?.turn || activeTurn;

        // Super
        super._onDeleteDescendantDocuments(parent, collection, documents, ids, options, userId);

        // Setup turns in segment fashion
        this.setupTurns();

        // If activeTurn == -1 then combat has not begun
        if (activeTurn > -1) {
            // There is an edge case where the last combatant of the round is deleted.
            activeTurn = Math.clamped(activeTurn, 0, this.turns.length - 1);
            await this.update({ turn: activeTurn });

        }

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
        console.log("_onActorDataUpdate")
        super._onActorDataUpdate(...args)
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
        return;

        if (!game.users.activeGM?.isSelf) return;
        const prior = this.combatants.get(this.previous.combatantId);

        // Adjust the turn order before proceeding. Used for embedded document workflows
        if (Number.isNumeric(adjustedTurn)) await this.update({ turn: adjustedTurn }, { turnEvents: false });
        if (!this.started) return;

        // Identify what progressed
        const advanceRound = this.current.round > (this.previous.round ?? -1);
        const advanceTurn = this.current.turn > (this.previous.turn ?? -1);
        if (!(advanceTurn || advanceRound)) return;

        // Conclude prior turn
        if (prior) await this._onEndTurn(prior);

        // Conclude prior round
        if (advanceRound && (this.previous.round !== null)) await this._onEndRound();

        // Begin new round
        if (advanceRound) await this._onStartRound();

        // Begin a new turn
        await this._onStartTurn(this.combatant);
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
        await super._onStartTurn(combatant)

        // STUNNING
        // The character remains Stunned and can take no
        // Actions (not even Aborting to a defensive action) until his next
        // Phase.


        if (combatant.actor.statuses.has('stunned')) {
            const effect = combatant.actor.effects.contents.find(o => o.statuses.has('stunned'))

            // At beginning of combat if stunned effect is deleted a console error is generated.
            // This would be extremetly unusual as characters typically don't start combat stunned.
            await effect.delete();

            let content = `${combatant.actor.name} recovers from being stunned.`
            const token = combatant.token
            const speaker = ChatMessage.getSpeaker({ actor: combatant.actor, token })
            speaker["alias"] = combatant.actor.name
            const chatData = {
                user: game.user._id,
                type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                content: content,
                //speaker: speaker
            }

            await ChatMessage.create(chatData)


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
        //console.log("_onStartTurn", combatant.name)
        super._onEndTurn(combatant)

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
        return this.PostSegment12();

    }

    // TODO: Replace with PostSegment12 activities.
    // Such as automatic recovery
    async PostSegment12() {


        // POST-SEGMENT 12 RECOVERY
        // After Segment 12 each Turn, all characters (except those deeply
        // unconscious or holding their breath) get a free Post-Segment 12
        // Recovery. This includes Stunned characters, although the Post-
        // Segment 12 Recovery does not eliminate the Stunned condition.

        const automation = game.settings.get("hero6efoundryvttv2", "automation");

        let content = `Post-Segment 12 (Turn ${this.round - 1})`;
        content += '<ul>'
        for (let combatant of this.combatants.filter(o => !o.defeated)) {
            const actor = combatant.actor;

            // Make sure we have automation enabled
            if ((automation === "all") || (automation === "npcOnly" && actor.type == 'npc') || (automation === "pcEndOnly" && actor.type === 'pc')) {
                content += '<li>' + await combatant.actor.TakeRecovery(false) + '</li>'
            }
        }
        content += '</ul>'
        const chatData = {
            user: game.user._id,
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: content,
        }

        return ChatMessage.create(chatData)
    }

    /**
   * Begin the combat encounter, advancing to round 1 and turn 1
   * @returns {Promise<Combat>}
   */
    async startCombat() {
        await super.startCombat();

        // Find first TURN with segment 12
        if (!this.segments[12].length) return;
        let turn = this.segments[12][0]?.turn || 1

        const updateData = { round: 1, turn: turn };
        return this.update(updateData);
    }

    /**
   * Rewind the combat to the previous turn
   * @returns {Promise<Combat>}
   */
    async previousTurn() {
        //console.log("previousTurn");
        if ((this.turn === 0) && (this.round === 0)) return this;
        else if ((this.turn <= 0) && (this.turn !== null)) return this.previousRound();

        // Hero combats start with round 1 and segment 12.
        // So anything less than segment 12 will call previousTurn
        let segment12turn = this.segments[12][0]?.turn || -1;
        if ((this.round <= 1) && (this.turn <= segment12turn)) {
            return this.previousRound();
        }

        let advanceTime = -1 * CONFIG.time.turnTime;
        let previousTurn = (this.turn ?? this.turns.length) - 1;

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
        let turn = (this.round === 0) ? 0 : Math.max(this.turns.length - 1, 0);
        if (this.turn === null) turn = null;
        let round = Math.max(this.round - 1, 0);
        let advanceTime = -1 * (this.turn || 0) * CONFIG.time.turnTime;
        if (round > 0) advanceTime -= CONFIG.time.roundTime;

        // Hero combats start with round 1 and segment 12.
        // So anything less than segment 12 will call previousTurn
        let segment12turn = this.segments[12][0]?.turn || -1;
        if ((round <= 1) && (turn <= segment12turn)) {
            round = 0;
            turn = null
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


}

class HeroCombatant extends Combatant {
    constructor(combatant) {
        super();
        Object.assign(this, combatant);
        this.id = combatant.id;
    }

    id = null;
    initiative = null;  //Override
    turn = null;
    segment = null;
    alias = null;
    isFake = false;
    //hasRolled = true; // Initiative is static, but actor DEX/INT/SPD might change
}

