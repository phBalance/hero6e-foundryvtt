export const ROLL_TYPE = {
    SUCCESS: 0,
    NORMAL: 1,
    KILLING: 2,
    ADJUSTMENT: 3,
    ENTANGLE: 4,
    FLASH: 5,
};

/**
 * @typedef {Object} HitLocationInfo
 * @property {string} name
 * @property {"Left" | "Right" | ""} side
 * @property {string} fullName
 * @property {number} stunMultiplier
 * @property {number} bodyMultiplier
 */
export class HeroRoller {
    static STANDARD_EFFECT_DIE_ROLL = 3;
    static STANDARD_EFFECT_HALF_DIE_ROLL = 1;

    static #sidedLocations = [
        "Hand",
        "Shoulder",
        "Arm",
        "Thigh",
        "Leg",
        "Foot",
    ];

    static #sum(term) {
        return term.reduce((subTotal, result) => {
            return subTotal + result;
        }, 0);
    }

    static #extractPropertyFromTermsCluster(termsCluster, property) {
        return termsCluster.map((termCluster) => termCluster[property]);
    }

    constructor(options, rollClass = Roll) {
        this._buildRollClass = rollClass;
        this._options = options;
        this._rollObj = undefined;

        this._formulaTerms = [];

        this._type = ROLL_TYPE.SUCCESS;

        this._termsCluster = [];

        this._killingStunMultiplierHeroRoller = undefined;
        this._killingBaseStunMultiplier = 0;
        this._killingAdditionalStunMultiplier = 0;

        this._standardEffect = false;

        this._hitLocation = {
            name: "body",
            side: "",
            fullName: "body",
            stunMultiplier: 1,
            bodyMultiplier: 1,
        };
        this._useHitLocation = false;
        this._alreadyHitLocation = "none";
    }

    getType() {
        return this._type;
    }

    makeSuccessRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.SUCCESS;
        }
        return this;
    }

    makeNormalRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.NORMAL;
        }
        return this;
    }

    makeKillingRoll(apply = true, isd6minus1 = false) {
        if (apply) {
            this._type = ROLL_TYPE.KILLING;
            this._killingStunMultiplier = isd6minus1 ? "1d6-1" : "1d3";
        }
        return this;
    }

    makeAdjustmentRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.ADJUSTMENT;
        }
        return this;
    }

    makeEntangleRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.ENTANGLE;
        }
        return this;
    }

    makeFlashRoll(apply = true) {
        if (apply) {
            this._type = ROLL_TYPE.FLASH;
        }
        return this;
    }

    modifyToStandardEffect(apply = true) {
        if (apply) {
            this._standardEffect = true;
        }
        return this;
    }

    addToHitLocation(apply = true, alreadyHitLocation) {
        if (apply) {
            this._useHitLocation = true;
            this._alreadyHitLocation = alreadyHitLocation || "none";
        }
        return this;
    }

    #linkIfNotFirstTerm(operator = "+") {
        // TODO: Do we really need this not if first term given we now get rid of the operator terms?
        // if (this._formulaTerms.length > 0) {
        this._formulaTerms.push(new OperatorTerm({ operator: operator }));
        // }
    }

    // TODO: May wish to add tagging information to each of these. Are tags always 1:1?
    addDice(numDice, description) {
        if (!numDice) {
            return this;
        }

        this.#linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: {
                    _hrQualifier: "add dice",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: numDice,
                          },
                },
            }),
        );

        return this;
    }

    subDice(numDice, description) {
        if (!numDice) {
            return this;
        }

        this.#linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: {
                    _hrQualifier: "sub dice",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: numDice,
                          },
                },
            }),
        );

        return this;
    }

    addHalfDice(numDice, description) {
        if (!numDice) {
            return this;
        }

        this.#linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: {
                    _hrQualifier: "half die",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: numDice,
                          },
                },
            }),
        );

        return this;
    }

    addDiceMinus1(numDice, description) {
        if (!numDice) {
            return this;
        }

        this.#linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: {
                    _hrQualifier: "less 1 pip",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: numDice,
                          },
                },
            }),
        );

        return this;
    }

    addDieMinus1Min1(numDice, description) {
        if (!numDice) {
            return this;
        }

        this.#linkIfNotFirstTerm();

        this._formulaTerms.push(
            new Die({
                faces: 6,
                number: numDice,
                options: {
                    _hrQualifier: "less 1 pip min 1",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: numDice,
                          },
                },
            }),
        );

        return this;
    }

    addNumber(value, description) {
        if (!value) {
            return this;
        }

        this.#linkIfNotFirstTerm();

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: {
                    _hrQualifier: "add number",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: value,
                          },
                },
            }),
        );

        return this;
    }

    subNumber(value, description) {
        if (!value) {
            return this;
        }

        this.#linkIfNotFirstTerm("-");

        this._formulaTerms.push(
            new NumericTerm({
                number: value,
                options: {
                    _hrQualifier: "sub number",
                    flavor: description,
                    _hrTag: !description
                        ? undefined
                        : {
                              name: description,
                              value: value,
                          },
                },
            }),
        );

        return this;
    }

    addStunMultiplier(levels) {
        if (levels) {
            this._killingAdditionalStunMultiplier += levels;
        }
        return this;
    }

    async roll(options) {
        // Build the Foundry pseudo random roller
        this._rollObj = this._buildRollClass.fromTerms(
            this._formulaTerms,
            this._options,
        );

        await this._rollObj.evaluate({
            ...options,
            async: true,
        });

        this._rollObj.terms = this.#convertToStandardEffectIfAppropriate(
            this._rollObj.terms,
        );

        await this.#calculateStunMultiplierIfAppropriate();

        await this.#calculateHitLocationIfAppropriate();

        this._rawBaseTerms = this._rollObj.terms;

        this.#calculate();

        return this;
    }

    // TODO: May wish to consider our own custom chat template for this.
    // TODO: May wish to consider no flavour, but rather have it be the type of roll?
    async render() {
        const template = this._buildRollClass.CHAT_TEMPLATE;

        const chatData = {
            formula: this.#buildFormula(),
            flavor: null,
            user: game.user.id,
            tooltip: this.#buildTooltip(),
            total: this.#buildTooltipTotal(),
        };

        return renderTemplate(template, chatData);
    }

    tags() {
        return this._formulaTerms
            .map((term) => {
                return term.options._hrTag;
            })
            .filter(Boolean);
    }

    getFormula() {
        return this.#buildFormula();
    }

    getSuccessTerms() {
        if (this._type === ROLL_TYPE.SUCCESS) {
            return this.getBaseTerms();
        }

        throw new Error(
            `asking for success from type ${this._type} doesn't make sense`,
        );
    }
    getSuccessTotal() {
        if (this._type === ROLL_TYPE.SUCCESS) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for success from type ${this._type} doesn't make sense`,
        );
    }

    getStunTerms() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getBaseTerms();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getCalculatedTerms();
        }

        throw new Error(
            `asking for stun from type ${this._type} doesn't make sense`,
        );
    }
    getStunTotal() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getBaseTotal();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getCalculatedTotal();
        }

        throw new Error(
            `asking for stun from type ${this._type} doesn't make sense`,
        );
    }
    getStunMultiplier() {
        if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseMultiplier();
        }

        throw new Error(
            `asking for stun multiplier from type ${this._type} doesn't make sense`,
        );
    }

    getBodyTerms() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getCalculatedTerms();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseTerms();
        }

        throw new Error(
            `asking for body from type ${this._type} doesn't make sense`,
        );
    }
    getBodyTotal() {
        if (this._type === ROLL_TYPE.NORMAL) {
            return this.getCalculatedTotal();
        } else if (this._type === ROLL_TYPE.KILLING) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for body from type ${this._type} doesn't make sense`,
        );
    }

    removeNHighestRankTerms(ranksToRemove) {
        if (ranksToRemove && ranksToRemove > 0) {
            this.#removeNHighestRankTerms(ranksToRemove);
        }

        return this;
    }

    removeFirstNTerms(ranksToRemove) {
        if (ranksToRemove && ranksToRemove > 0) {
            this.#removeFirstNTerms(ranksToRemove);
        }

        return this;
    }

    getEntangleTotal() {
        if (this._type === ROLL_TYPE.ENTANGLE) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for entangle from type ${this._type} doesn't make sense`,
        );
    }

    getAdjustmentTotal() {
        if (this._type === ROLL_TYPE.ADJUSTMENT) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for adjustment from type ${this._type} doesn't make sense`,
        );
    }

    getFlashTotal() {
        if (this._type === ROLL_TYPE.FLASH) {
            return this.getBaseTotal();
        }

        throw new Error(
            `asking for flash from type ${this._type} doesn't make sense`,
        );
    }

    getBaseTerms() {
        return HeroRoller.#extractPropertyFromTermsCluster(
            this._termsCluster,
            "base",
        );
    }

    // TODO: Is there a better way of doing this?
    getFullBaseTerms() {
        return {
            base: HeroRoller.#extractPropertyFromTermsCluster(
                this._termsCluster,
                "base",
            ),
            baseMetadata: HeroRoller.#extractPropertyFromTermsCluster(
                this._termsCluster,
                "baseMetadata",
            ),
        };
    }
    getBaseTotal() {
        return HeroRoller.#sum(this.getBaseTerms());
    }

    getBaseMultiplier() {
        return Math.max(
            this._killingBaseStunMultiplier +
                this._killingAdditionalStunMultiplier,
            1,
        );
    }

    getCalculatedTerms() {
        if (
            this._type === ROLL_TYPE.SUCCESS ||
            this._type === ROLL_TYPE.ENTANGLE ||
            this._type === ROLL_TYPE.FLASH
        ) {
            console.error(
                `attempting to get calculatedTerms for roll type ${this._type}`,
            );
        }

        return HeroRoller.#extractPropertyFromTermsCluster(
            this._termsCluster,
            "calculated",
        );
    }

    getCalculatedTotal() {
        return HeroRoller.#sum(this.getCalculatedTerms());
    }

    /**
     *
     * @returns {HitLocationInfo}
     */
    getHitLocation() {
        return this._hitLocation;
    }

    clone() {
        // TODO: Clone. Is this the best approach?

        return HeroRoller.fromJSON(this.toJSON());
    }

    toData() {
        return {
            _buildRollClass: this._buildRollClass.name, // TODO: This is just wrong.
            _options: this._options,
            _rollObj: this._rollObj ? this._rollObj.toJSON() : undefined,
            _formulaTerms: this._formulaTerms,
            _type: this._type,

            _termsCluster: this._termsCluster,

            _killingStunMultiplierHeroRoller: this
                ._killingStunMultiplierHeroRoller
                ? this._killingStunMultiplierHeroRoller.toData()
                : undefined,
            _killingBaseStunMultiplier: this._killingBaseStunMultiplier,
            _killingAdditionalStunMultiplier:
                this._killingAdditionalStunMultiplier,

            _standardEffect: this._standardEffect,

            _hitLocation: this._hitLocation,
            _useHitLocation: this._useHitLocation,
            _alreadyHitLocation: this._alreadyHitLocation,
        };
    }

    toJSON() {
        return JSON.stringify(this.toData());
    }

    static fromJSON(json) {
        return HeroRoller.fromData(JSON.parse(json));
    }

    static fromData(dataObj) {
        // TODO: Finish this.
        // TODO: I suspect that will only be able to support Roll class.
        const heroRoller = new HeroRoller(dataObj.options, Roll);

        heroRoller._rollObj = dataObj._rollObj
            ? Roll.fromData(dataObj._rollObj)
            : undefined;
        heroRoller._formulaTerms = dataObj._formulaTerms;

        heroRoller._type = dataObj._type;

        heroRoller._termsCluster = dataObj._termsCluster;

        heroRoller._killingStunMultiplierHeroRoller =
            dataObj._killingStunMultiplierHeroRoller
                ? HeroRoller.fromData(dataObj._killingStunMultiplierHeroRoller)
                : undefined;
        heroRoller._killingBaseStunMultiplier =
            dataObj._killingBaseStunMultiplier;
        heroRoller._killingAdditionalStunMultiplier =
            dataObj._killingAdditionalStunMultiplier;

        heroRoller._standardEffect = dataObj._standardEffect;

        heroRoller._hitLocation = dataObj._hitLocation;
        heroRoller._useHitLocation = dataObj._useHitLocation;
        heroRoller._alreadyHitLocation = dataObj._alreadyHitLocation;

        // TODO: Check if anything is missing...

        return heroRoller;
    }

    async #calculateStunMultiplierIfAppropriate() {
        if (this._type === ROLL_TYPE.KILLING) {
            this._killingStunMultiplierHeroRoller = new HeroRoller(
                {},
                this._buildRollClass,
            )
                .addDieMinus1Min1(
                    this._killingStunMultiplier === "1d6-1" ? 1 : 0,
                )
                .addHalfDice(this._killingStunMultiplier === "1d3" ? 1 : 0)
                .modifyToStandardEffect(this._standardEffect);

            await this._killingStunMultiplierHeroRoller.roll({ async: true });

            this._killingBaseStunMultiplier =
                this._killingStunMultiplierHeroRoller.getSuccessTotal();
        }
    }

    /**
     * @returns {HitLocationInfo}
     */
    async #calculateHitLocationIfAppropriate() {
        if (
            this._useHitLocation &&
            (this._type === ROLL_TYPE.NORMAL ||
                this._type === ROLL_TYPE.KILLING)
        ) {
            this._hitLocationRoller = new HeroRoller(
                {},
                this._buildRollClass,
            ).addDice(3);
            await this._hitLocationRoller.roll();

            const locationRollTotal = this._hitLocationRoller.getBaseTotal();

            this._hitSideRoller = new HeroRoller(
                {},
                this._buildRollClass,
            ).addDice(1);
            await this._hitSideRoller.roll();

            const locationSideRollTotal = this._hitSideRoller.getBaseTotal();

            const locationName =
                this._alreadyHitLocation && this._alreadyHitLocation !== "none"
                    ? this._alreadyHitLocation
                    : CONFIG.HERO.hitLocationsToHit[locationRollTotal];
            const locationSide = locationSideRollTotal >= 4 ? "Right" : "Left";

            this._hitLocation = {
                name: locationName,
                side: locationSide,
                fullName: HeroRoller.#sidedLocations.includes(locationName)
                    ? `${locationSide} ${locationName}`
                    : locationName,
                stunMultiplier:
                    this._type === ROLL_TYPE.KILLING
                        ? CONFIG.HERO.hitLocations[locationName][0]
                        : CONFIG.HERO.hitLocations[locationName][1],
                bodyMultiplier: CONFIG.HERO.hitLocations[locationName][2],
            };
        }
    }

    #calculateValue(result) {
        switch (this._type) {
            case ROLL_TYPE.SUCCESS:
            case ROLL_TYPE.ADJUSTMENT:
                // Do nothing as there are no calculated values
                break;

            case ROLL_TYPE.NORMAL:
                // Calculate BODY
                if (result <= 1) {
                    return 0;
                } else if (result === 6) {
                    return 2;
                }

                return 1;

            case ROLL_TYPE.KILLING:
                if (this._useHitLocation) {
                    return result;
                }

                return result * this.getBaseMultiplier();

            case ROLL_TYPE.ENTANGLE:
            case ROLL_TYPE.FLASH:
            default:
                console.error(`Unhandled calculation for type ${this._type}`);
        }
    }

    #calculate() {
        const _calculatedTermsMetadata = [];
        const _calculatedTerms = [];

        let lastOperatorMultiplier = 1; // Start with +1

        const _baseTermsMetadata = [];
        const _baseTerms = this._rawBaseTerms
            .map((term, index) => {
                if (term instanceof NumericTerm) {
                    const number = lastOperatorMultiplier * term.number;
                    const hrExtra = {
                        term: "Numeric",
                        originalTermIndex: index,
                        termIndex: index,
                        qualifier: term.options._hrQualifier,
                        flavor: term.options.flavor,
                        originalBaseNumber: term.number,
                        baseNumber: term.number,
                        signMultiplier: lastOperatorMultiplier,
                        classDecorators: "",
                    };

                    // Create the metadata for this term
                    _baseTermsMetadata.push([hrExtra]);
                    _calculatedTermsMetadata.push([hrExtra]);

                    const newCalculatedTerm = [this.#calculateValue(number)];
                    _calculatedTerms.push(newCalculatedTerm);

                    const newBaseTerm = [number];
                    return newBaseTerm;
                } else if (term instanceof OperatorTerm) {
                    // NOTE: No need to handle multiplication, division, and parentheses as
                    //       this class doesn't support it.
                    lastOperatorMultiplier = term.operator === "-" ? -1 : 1;
                } else if (term instanceof Die) {
                    const thisTermBaseTermsMetadata = [];

                    const calculatedTerms = [];
                    const thisTermCalculatedTermsMetadata = [];
                    const hrExtra = {
                        term: "Dice",
                        originalTermIndex: index,
                        termIndex: index,
                        qualifier: term.options._hrQualifier,
                        flavor: term.options.flavor,
                        originalBaseNumber: term.results.length,
                        baseNumber: term.results.length,
                        signMultiplier: lastOperatorMultiplier,
                        min: -99,
                        max: -99,
                    };

                    const termResults = term.results.map((result, index) => {
                        let adjustedValue =
                            lastOperatorMultiplier * result.result;

                        if (term.options._hrQualifier === "half die") {
                            adjustedValue = Math.ceil(result.result / 2);
                            hrExtra.min = 1;
                            hrExtra.max = 3;
                        } else if (
                            term.options._hrQualifier === "less 1 pip" &&
                            !this._standardEffect
                        ) {
                            adjustedValue = result.result - 1;
                            hrExtra.min = 0;
                            hrExtra.max = 5;
                        } else if (
                            term.options._hrQualifier === "less 1 pip min 1" &&
                            !this._standardEffect
                        ) {
                            adjustedValue = Math.max(1, result.result - 1);
                            hrExtra.min = 1;
                            hrExtra.max = 5;
                        } else {
                            hrExtra.min = 1;
                            hrExtra.max = 6;
                        }

                        hrExtra.originalResultIndex = index;

                        hrExtra.classDecorators =
                            HeroRoller.#buildMinMaxClassForValue(
                                hrExtra,
                                adjustedValue,
                            );

                        thisTermBaseTermsMetadata.push(
                            foundry.utils.deepClone(hrExtra),
                        );

                        calculatedTerms.push(
                            this.#calculateValue(adjustedValue),
                        );

                        thisTermCalculatedTermsMetadata.push(
                            foundry.utils.deepClone(hrExtra),
                        );

                        return adjustedValue;
                    });

                    _baseTermsMetadata.push(thisTermBaseTermsMetadata);
                    _calculatedTermsMetadata.push(
                        thisTermCalculatedTermsMetadata,
                    );
                    _calculatedTerms.push(calculatedTerms);

                    return termResults;
                } else {
                    // Other term types will return undefined and be filtered out
                    // although we shouldn't ever get them.
                }
            })
            .filter(Boolean); // TODO: Is this still required?

        const flatBaseTerms = _baseTerms.flat();
        const flatBaseTermsMetadata = _baseTermsMetadata.flat();
        const flatCalculatedTerms = _calculatedTerms.flat();
        const flatCalculatedTermsMetadata = _calculatedTermsMetadata.flat();

        // combine
        this._termsCluster = flatBaseTerms.map((_term, index) => {
            return {
                base: flatBaseTerms[index],
                baseMetadata: flatBaseTermsMetadata[index],
                calculated: flatCalculatedTerms[index],
                calculatedMetadata: flatCalculatedTermsMetadata[index],
            };
        });
    }

    #buildFormula() {
        const baseMetadata = foundry.utils.deepClone(
            HeroRoller.#extractPropertyFromTermsCluster(
                this._termsCluster,
                "baseMetadata",
            ),
        );

        // Sort the metadata by original term - lowest index to highest
        baseMetadata.sort(function (a, b) {
            return a.termIndex - b.termIndex;
        });

        // Just look at the first term of an index we come across so that we don't have duplicate
        const seenAlready = new Set();
        const formula = baseMetadata
            .filter((metadataTerm) => {
                const found = seenAlready.has(metadataTerm.termIndex);
                if (!found) {
                    seenAlready.add(metadataTerm.termIndex);
                }
                return !found;
            })
            .reduce((formulaSoFar, metadataTerm, index) => {
                return (
                    formulaSoFar +
                    this.#buildFormulaForTerm(metadataTerm, !!index)
                );
            }, "");

        return formula.trim();
    }

    #buildTooltip() {
        return `<div class="dice-tooltip">
                    <section class="tooltip-part">
                        ${this.#buildDiceTooltip()}
                    </section>
                </div>`;
    }

    #buildDiceTooltip() {
        let preliminaryTooltip = "";

        // Show the stun multiplier only if this is a killing attack and there is no
        // hit location.
        if (this._type === ROLL_TYPE.KILLING && !this._useHitLocation) {
            const stunMultiplier =
                this._killingStunMultiplierHeroRoller.getBaseTotal();
            const stunMultiplierFormula =
                this._killingStunMultiplierHeroRoller.getFormula();
            const fullBaseTerms =
                this._killingStunMultiplierHeroRoller.getFullBaseTerms();

            preliminaryTooltip = `
                <div class="dice">
                    <header class="part-header flexrow">
                        <span class="part-formula">${stunMultiplierFormula} STUN Multiplier</span>
                        <span class="part-total">${stunMultiplier}</span>
                    </header>
                    <ol class="dice-rolls">
                        ${HeroRoller.#buildDiceRollsTooltip(
                            fullBaseTerms.base,
                            fullBaseTerms.baseMetadata,
                            true,
                        )}
                    </ol>
                </div>
            `;
        }

        // Turn the flat termsCluster array back into an unflattened original style of terms.
        const groupedCluster = [];
        this._termsCluster.forEach((termCluster) => {
            const originalTerm = termCluster.baseMetadata.termIndex;
            if (!groupedCluster[originalTerm]) {
                groupedCluster[originalTerm] = [];
            }
            groupedCluster[originalTerm].push(termCluster);
        });

        return groupedCluster.filter(Boolean).reduce((soFar, termCluster) => {
            const baseCluster = HeroRoller.#extractPropertyFromTermsCluster(
                termCluster,
                "base",
            );
            const baseTotal = HeroRoller.#sum(baseCluster);

            const baseMetadataCluster =
                HeroRoller.#extractPropertyFromTermsCluster(
                    termCluster,
                    "baseMetadata",
                );
            const baseFormula = this.#buildFormulaForTerm(
                baseMetadataCluster[0],
                false,
            );
            const baseFormulaPurpose = this.#buildFormulaBasePurpose();

            const baseTermTooltip = `
                    <div class="dice">
                        <header class="part-header flexrow">
                            <span class="part-formula">${baseFormula}${
                                baseFormulaPurpose
                                    ? ` ${baseFormulaPurpose}`
                                    : ""
                            }${
                                baseMetadataCluster[0].flavor
                                    ? ` ${baseMetadataCluster[0].flavor}`
                                    : ""
                            }</span>
                            <span class="part-total">${baseTotal}</span>
                        </header>
                        <ol class="dice-rolls">
                            ${HeroRoller.#buildDiceRollsTooltip(
                                baseCluster,
                                baseMetadataCluster,
                                true,
                            )}
                        </ol>
                    </div>
                `;

            const calculatedCluster =
                HeroRoller.#extractPropertyFromTermsCluster(
                    termCluster,
                    "calculated",
                );
            const calculatedTotal = HeroRoller.#sum(calculatedCluster);
            const calculatedFormulaPurpose =
                this.#buildFormulaCalculatedPurpose();
            const calculatedMetadataCluster =
                HeroRoller.#extractPropertyFromTermsCluster(
                    termCluster,
                    "calculatedMetadata",
                );

            const calculatedTermTooltip = !this.#buildFormulaCalculatedPurpose()
                ? ""
                : `
                        <div class="dice">
                            <header class="part-header flexrow">
                                <span class="part-formula">${calculatedFormulaPurpose} calculated from ${baseFormula} ${baseFormulaPurpose}</span>
                                <span class="part-total">${calculatedTotal}</span>
                            </header>
                            <ol class="dice-rolls">
                                ${HeroRoller.#buildDiceRollsTooltip(
                                    calculatedCluster,
                                    calculatedMetadataCluster,
                                    true,
                                )}    
                            </ol>
                        </div>
                    `;

            return `${soFar}${baseTermTooltip}${calculatedTermTooltip}`;
        }, preliminaryTooltip);
    }

    #buildFormulaForTerm(termMetadata, showOperator) {
        // We want to show a term without sign unless we aren't showing the operator.
        const sign = showOperator
            ? termMetadata.signMultiplier * termMetadata.baseNumber < 0
                ? " - "
                : " + "
            : termMetadata.signMultiplier * termMetadata.baseNumber < 0
              ? " -"
              : " ";

        if (termMetadata.term === "Dice") {
            if (termMetadata.qualifier === "half die") {
                return `${sign}${
                    termMetadata.baseNumber !== 1
                        ? `${Math.abs(termMetadata.baseNumber)}(½d6)`
                        : "½d6"
                }`;
            } else if (termMetadata.qualifier === "less 1 pip") {
                return `${
                    termMetadata.signMultiplier < 0 ||
                    termMetadata.baseNumber !== 1
                        ? `${sign}${Math.abs(termMetadata.baseNumber)}(d6-1)`
                        : `${sign}${Math.abs(termMetadata.baseNumber)}d6-1`
                }`;
            } else if (termMetadata.qualifier === "less 1 pip min 1") {
                return `${
                    termMetadata.signMultiplier < 0 ||
                    termMetadata.baseNumber !== 1
                        ? `${sign}${Math.abs(
                              termMetadata.baseNumber,
                          )}(d6-1[min 1])`
                        : `${sign}${Math.abs(
                              termMetadata.baseNumber,
                          )}d6-1[min 1]`
                }`;
            } else {
                return `${sign}${termMetadata.baseNumber}d6`;
            }
        } else if (termMetadata.term === "Numeric") {
            // NOTE: Should only be 1 value per Numeric term
            return `${sign}${Math.abs(termMetadata.baseNumber)}`;
        }
    }

    #buildFormulaBasePurpose() {
        switch (this._type) {
            case ROLL_TYPE.SUCCESS:
                return "";

            case ROLL_TYPE.NORMAL:
                return "STUN";

            case ROLL_TYPE.ENTANGLE:
            case ROLL_TYPE.KILLING:
                return "BODY";

            case ROLL_TYPE.ADJUSTMENT:
                return "Active Points";

            case ROLL_TYPE.FLASH:
                return "Segments";

            default:
                console.error(`unknown base purpose type ${this._type}`);
                return "";
        }
    }

    #buildFormulaCalculatedPurpose() {
        switch (this._type) {
            case ROLL_TYPE.SUCCESS:
            case ROLL_TYPE.ENTANGLE:
            case ROLL_TYPE.ADJUSTMENT:
            case ROLL_TYPE.FLASH:
                // No calculated terms
                return "";

            case ROLL_TYPE.KILLING:
                return "STUN";

            case ROLL_TYPE.NORMAL:
                return "BODY";

            default:
                console.error(`unknown base purpose type ${this._type}`);
                return "";
        }
    }

    static #buildDiceRollsTooltip(diceTerm, diceTermMetadata, showMinMax) {
        return diceTerm.reduce((soFar, result, index) => {
            const absNumber = Math.abs(result);

            return `${soFar}<li class="roll die d6 ${
                showMinMax ? diceTermMetadata[index].classDecorators : ""
            }">${absNumber}</li>`;
        }, "");
    }

    static #buildMinMaxClassForValue(metadata, value) {
        if (metadata.term === "Dice") {
            const absValue = Math.abs(value);

            return absValue === metadata.min
                ? "min"
                : absValue === metadata.max
                  ? "max"
                  : "";
        }

        return "";
    }

    #buildTooltipTotal() {
        switch (this._type) {
            case ROLL_TYPE.SUCCESS:
                return `${this.getSuccessTotal()}`;

            case ROLL_TYPE.NORMAL:
                return `${this.getBodyTotal()} BODY; ${this.getStunTotal()} STUN`;

            case ROLL_TYPE.KILLING:
                return `${this.getBodyTotal()} BODY; ${this.getStunTotal()} STUN (${this.getStunMultiplier()}x)`;

            case ROLL_TYPE.ENTANGLE:
                return `${this.getEntangleTotal()} BODY`;

            case ROLL_TYPE.ADJUSTMENT:
                return `${this.getAdjustmentTotal()} Active Points`;

            case ROLL_TYPE.FLASH:
                return `${this.getFlashTotal()} Segments`;

            default:
                console.error(`unknown type ${this._type}`);
                break;
        }
    }

    #convertToStandardEffectIfAppropriate(formulaTerms) {
        if (this._standardEffect) {
            for (let i = 0; i < formulaTerms.length; ++i) {
                if (formulaTerms[i] instanceof Die) {
                    for (let j = 0; j < formulaTerms[i].results.length; ++j) {
                        if (
                            formulaTerms[i].options._hrQualifier === "half die"
                        ) {
                            formulaTerms[i].results[j].result =
                                HeroRoller.STANDARD_EFFECT_HALF_DIE_ROLL;
                        } else {
                            // NOTE: 5e p. 104 & 6E1 p.133. Full die and (die - 1) count as 3.
                            formulaTerms[i].results[j].result =
                                HeroRoller.STANDARD_EFFECT_DIE_ROLL;
                        }
                    }
                }
            }
        }

        return formulaTerms;
    }

    #removeNHighestRankTerms(ranksToRemove) {
        // sort - highest first & lowest last.
        this._termsCluster.sort(function (a, b) {
            return b.base - a.base;
        });

        this.#removeFirstNTerms(ranksToRemove);
    }

    #removeFirstNTerms(ranksToRemove) {
        // Remove the first ranks
        const removed = this._termsCluster.splice(0, ranksToRemove);

        // Fixup the base and calculated metadata so that it reflects what remains. The base and calculated
        // values are correct as is.
        // NOTE: This will only work for dice term.
        // 1) If all the terms of a part of the equation were removed, there is nothing to fix up
        //    as that has already been removed from the metadata.
        // 2) For parts of the formula that have had terms removed, we need to fixup the expected
        //    number of dice and their indices.

        // Determine indices that have been modified ...
        const fixUp = new Map();
        removed.forEach((termCluster) => {
            const indexCount =
                fixUp.get(termCluster.baseMetadata.termIndex) || 0;
            fixUp.set(termCluster.baseMetadata.termIndex, indexCount + 1);
        });

        // ... and modify the metadata counts for them
        this._termsCluster.forEach((termCluster) => {
            const indexCount = fixUp.get(termCluster.baseMetadata.termIndex);
            if (indexCount != null) {
                termCluster.baseMetadata.baseNumber -= indexCount;
                termCluster.calculatedMetadata.baseNumber -= indexCount;
            }
        });
    }
}
