export const HERO = {};

HERO.bool = {
    true: "True",
    false: "False",
};

HERO.extraDice = {
    zero: "+0",
    pip: "+1",
    half: "+½D6",
    "one-pip": "+1D6-1",
};

HERO.attacksWith = {
    ocv: "OCV",
    omcv: "OMCV",
};

HERO.defendsWith = {
    dcv: "DCV",
    dmcv: "DMCV",
};

HERO.defenseTypes = {
    pd: "Physical Defense",
    ed: "Energy Defense",
    md: "Mental Defense",
    rpd: "Resistant PD",
    red: "Resistant ED",
    rmd: "Resistant MD",
    drp: "Damage Reduction Physical",
    dre: "Damage Reduction Energy",
    drm: "Damage Reduction Mental",
    dnp: "Damage Negation Physical",
    dne: "Damage Negation Energy",
    dnm: "Damage Negation Mental",
    powd: "Power Defense",
    kbr: "Knockback Resistance",
    fd: "Flash Defense",
    br: "Barrier",
    df: "Deflection",
};

HERO.defenseTypes5e = {
    pd: "Physical Defense",
    ed: "Energy Defense",
    md: "Mental Defense",
    rpd: "Resistant PD",
    red: "Resistant ED",
    rmd: "Resistant MD",
    drp: "Damage Reduction Physical",
    dre: "Damage Reduction Energy",
    drm: "Damage Reduction Mental",
    dnp: "Damage Negation Physical",
    dne: "Damage Negation Energy",
    dnm: "Damage Negation Mental",
    powd: "Power Defense",
    kbr: "Knockback Resistance",
    fd: "Flash Defense",
    br: "Barrier",
    df: "Deflection",
    low: "Lack of Weakness",
};

HERO.attackClasses = {
    physical: "Physical",
    energy: "Energy",
    mental: "Mental",
};

HERO.skillCharacteristics = {
    GENERAL: "GENERAL",
    STR: "STR",
    DEX: "DEX",
    CON: "CON",
    INT: "INT",
    EGO: "EGO",
    PRE: "PRE",
};

HERO.skillCharacteristics5e = {
    GENERAL: "GENERAL",
    STR: "STR",
    DEX: "DEX",
    CON: "CON",
    INT: "INT",
    EGO: "EGO",
    PRE: "PRE",
    COM: "COM",
};

HERO.skillTraining = {
    untrained: "Untrained",
    familiar: "Familiar",
    everyman: "Everyman",
    proficient: "Proficient",
    trained: "Trained",
};

HERO.hitLocationsToHit = {
    3: "Head",
    4: "Head",
    5: "Head",
    6: "Hand",
    7: "Arm",
    8: "Arm",
    9: "Shoulder",
    10: "Chest",
    11: "Chest",
    12: "Stomach",
    13: "Vitals",
    14: "Thigh",
    15: "Leg",
    16: "Leg",
    17: "Foot",
    18: "Foot",
};

HERO.sidedLocations = new Set([
    "Hand",
    "Shoulder",
    "Arm",
    "Thigh",
    "Leg",
    "Foot",
]);

HERO.hitLocations = {
    // Location : [x Stun, x N Stun, x Body, OCV modifier]
    Head: [5, 2, 2, -8],
    Hand: [1, 0.5, 0.5, -6],
    Arm: [2, 0.5, 0.5, -5],
    Shoulder: [3, 1, 1, -5],
    Chest: [3, 1, 1, -5],
    Stomach: [4, 1.5, 1, -7],
    Vitals: [4, 1.5, 2, -8],
    Thigh: [2, 1, 1, -4],
    Leg: [2, 0.5, 0.5, -6],
    Foot: [1, 0.5, 0.5, -8],
};

// TODO: This could be created from powers.
HERO.movementPowers = {
    extradimensionalmovement: "Extra Dimensional Movement",
    flight: "Flight",
    ftl: "Faster Than Light",
    leaping: "Leaping",
    running: "Running",
    swimming: "Swimming",
    swinging: "Swinging",
    teleportation: "Teleportation",
    tunneling: "Tunneling",
};

HERO.movementPowers5e = {
    ...HERO.movementPowers,
    gliding: "Gliding",
};

function validatePowers() {
    // Has behaviors field
    const powersWithoutBehaviors = this.filter((power) => !power.behaviors);
    if (powersWithoutBehaviors.length > 0) {
        console.log(`Powers without behaviors field: `, powersWithoutBehaviors);
    }

    // Has range field
    const powersWithoutRange = this.filter((power) => !power.range);
    if (powersWithoutRange.length > 0) {
        console.log(`Powers without range field: `, powersWithoutRange);
    }

    // A power without duration field?
    const powersWithoutDuration = this.filter(
        (power) =>
            !power.duration &&
            (power.type.includes("adjustment ") ||
                (power.type.includes("attack") &&
                    !power.type.includes("martial")) ||
                power.type.includes("defense") ||
                power.type.includes("movement") ||
                power.type.includes("body-affecting") ||
                power.type.includes("standard") ||
                power.type.includes("skills")),
    );
    if (powersWithoutDuration.length > 0) {
        console.log(`Powers without duration field: `, powersWithoutDuration);
    }

    if (
        powersWithoutBehaviors.length === 0 &&
        powersWithoutDuration.length === 0
    ) {
        console.log(`Powers look valid`);
    }
}

HERO.powers6e = [];
HERO.powers6e.validate = validatePowers;
HERO.powers5e = [];
HERO.powers5e.validate = validatePowers;

/**
 * @typedef {Object} PowerDescription
 * @param {string} key - Hero Designer XMLID of the power
 * @param {string} name - Human readable name of the power
 * @param {string} base - Base cost in character points
 * @param {string} cost - Cost in character points per additional level
 * @param {Array<string>} type - A list of types associated with this power
 * @param {Array<"success">} behaviors - A list of the behavior types this power exhibits in the code
 *                                       "non-hd" - this is not an XMLID that comes from Hero Designer
 *                                       "optional-maneuver" - this is an optional combat maneuver
 *                                       "success" - can roll some kind of success roll for this power
 *                                       "dice" - a damage/effect dice roll is associated with this power
 *                                       "attack" - a to-hit dice roll is associated with this power
 *                                       "activatable" - this power can be turned on/off/activated/deactivated
 *
 * @param {"constant"|"instant"|"persistent"} duration - The lower case duration of the power
 * @param {"standard"|"self"|"no range"|"los"|"special"|"limited range"|"range based on str"} range - The range of the power
 * @param {boolean} [costEnd] - If the power costs endurance to use. true if it does, false or undefined if it doesn't
 */

/**
 *
 * @param {PowerDescription} powerDescription6e
 * @param {PowerDescription} [powerOverrideFor5e]
 */
function addPower(powerDescription6e, powerOverrideFor5e) {
    if (powerDescription6e) {
        HERO.powers6e.push(foundry.utils.deepClone(powerDescription6e));
    }

    if (powerOverrideFor5e) {
        HERO.powers5e.push(
            Object.assign(
                powerDescription6e ? powerDescription6e : {},
                powerOverrideFor5e,
            ),
        );
    }
}

(function addCharacteristicsToPowerList() {
    addPower(
        {
            key: "STR",
            name: "Strength",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: true,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {},
    );
    addPower(
        {
            key: "DEX",
            name: "Dexterity",
            base: 10,
            cost: 2,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["base2"],
        },
        {
            cost: 3,
        },
    );
    addPower(
        {
            key: "CON",
            name: "Constitution",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {
            cost: 2,
        },
    );
    addPower(
        {
            key: "INT",
            name: "Intelligence",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "EGO",
            name: "Ego",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["automaton", "vehicle", "base2", "computer"],
        },
        {
            cost: 2,
        },
    );
    addPower(
        {
            key: "PRE",
            name: "Presence",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: ["success"],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {},
    );
    addPower(undefined, {
        key: "COM",
        name: "Comeliness",
        type: ["characteristic"],
        behaviors: ["success"],
        duration: "persistent",
        range: "self",
        costEnd: false,
        ignoreFor: ["vehicle", "base2", "computer", "ai", "6e"], // TODO: Remove the 6e here.
        base: 10,
        cost: 1 / 2,
    });
    addPower(
        {
            key: "OCV",
            name: "Offensive Combat Value",
            base: 3,
            cost: 5,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["base2"],
        },
        {
            cost: 0,
        },
    );
    addPower(
        {
            key: "DCV",
            name: "Defensive Combat Value",
            base: 3,
            cost: 5,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["base2"],
        },
        {
            cost: 0,
        },
    );
    addPower(
        {
            key: "OMCV",
            name: "Offensive Mental Combat Value",
            base: 3,
            cost: 3,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["automaton", "vehicle", "base2"],
        },
        {
            cost: 0,
        },
    );
    addPower(
        {
            key: "DMCV",
            name: "Defensive Mental Combat Value",
            base: 3,
            cost: 3,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["automaton", "vehicle", "base2"],
        },
        {
            cost: 0,
        },
    );
    addPower(
        {
            key: "SPD",
            name: "Speed",
            base: 2,
            cost: 10,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["base2"],
        },
        {
            base: 0,
        },
    );
    addPower(
        {
            key: "PD",
            name: "Physical Defense",
            base: 2,
            cost: 1,
            type: ["characteristic", "defense"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["computer", "ai"],
        },
        {
            base: 0,
            cost: 1,
        },
    );
    addPower(
        {
            key: "ED",
            name: "Energy Defense",
            base: 2,
            cost: 1,
            type: ["characteristic", "defense"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["computer", "ai"],
        },
        {
            base: 0,
            cost: 1,
        },
    );
    addPower(
        {
            key: "REC",
            name: "Recovery",
            base: 4,
            cost: 1,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {
            base: 0,
            cost: 2,
        },
    );
    addPower(
        {
            key: "END",
            name: "Endurance",
            base: 20,
            cost: 1 / 5,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {
            base: 0,
            cost: 1 / 2,
        },
    );
    addPower(
        {
            key: "BODY",
            name: "Body",
            base: 10,
            cost: 1,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            cost: 2,
        },
    );
    addPower(
        {
            key: "STUN",
            name: "Stun",
            base: 20,
            cost: 1 / 2,
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {
            base: 0,
            cost: 1,
        },
    );

    addPower(
        {
            key: "BASESIZE",
            name: "Base Size",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            onlyFor: ["base2"],
        },
        {},
    );

    addPower(undefined, {
        key: "DEF",
        name: "Defense",
        type: ["characteristic"],
        behaviors: [],
        duration: "persistent",
        range: "self",
        costEnd: false,
        onlyFor: ["base2", "vehicle"],
    });

    addPower(
        {
            key: "SIZE",
            name: "Vehicle Size",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
            onlyFor: ["vehicle"],
        },
        {},
    );

    // HD extendable characteristics
    addPower(
        {
            key: "CUSTOM1",
            name: "Custom Characteristic 1",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM2",
            name: "Custom Characteristic 2",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM3",
            name: "Custom Characteristic 3",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM4",
            name: "Custom Characteristic 4",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM5",
            name: "Custom Characteristic 5",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM6",
            name: "Custom Characteristic 6",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM7",
            name: "Custom Characteristic 7",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM8",
            name: "Custom Characteristic 8",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM9",
            name: "Custom Characteristic 9",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM10",
            name: "Custom Characteristic 10",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
            range: "self",
            costEnd: false,
        },
        {},
    );
})();

(function addManeuversToPowerList() {
    addPower(undefined, {
        key: "BLAZINGAWAY",
        type: ["maneuver"],
        behaviors: ["non-hd", "optional-maneuver"],
        name: "Blazing Away",
        perceivability: "obvious",
        duration: "instant",
        range: "standard",
        costEnd: false,
        target: "target's dcv",
        ignoreFor: ["base2", "computer", "ai"],
        maneuverDesc: {
            phase: "1/2",
            ocv: "+0",
            dcv: "+0",
            effects: "Make as many attacks as desired, only hit on a 3",
            attack: true, // TODO: Do we want this property? Should likely be part of the behaviors. Same comment for all maneuvers.
        },
    });
    addPower(
        {
            key: "BLOCK",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Block",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "Blocks HTH attacks, Abort",
                attack: true, // TODO: Should be false as it's not an attack. It does, however, require dice.
            },
        },
        {},
    );
    addPower(
        {
            key: "BRACE",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Brace",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "0",
                ocv: "+2",
                dcv: "1/2",
                effects: "+2 OCV only to offset the Range Modifier",
                attack: false,
            },
        },
        {},
    );

    addPower(
        {
            key: "CHOKE",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Choke",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "-2",
                effects: "NND 1d6, Grab One Limb",
                attack: true,
            },
        },
        undefined,
    );
    addPower(
        {
            key: "CLUBWEAPON",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Club Weapon",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "Killing weapon does equivalent Normal Damage",
                attack: true,
            },
        },
        {},
    );
    addPower(
        {
            key: "COVER",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Cover",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "+0",
                effects: "Target held at gunpoint",
                attack: true,
            },
        },
        {},
    );

    addPower(
        {
            key: "DISARM",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Disarm",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "+0",
                effects: "Disarm target, requires STR vs. STR Roll",
                attack: true,
            },
        },
        {},
    );
    addPower(
        {
            key: "DIVEFORCOVER",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Dive For Cover",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "Character avoids attack; Abort",
                attack: true,
            },
        },
        {},
    );
    addPower(
        {
            key: "DODGE",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Dodge",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "--",
                dcv: "+3",
                effects: "Dodge all attacks, Abort",
                attack: true,
            },
        },
        {},
    );

    addPower(
        {
            key: "GRAB",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Grab",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1",
                dcv: "-2",
                effects: "Grab Two Limbs; can Squeeze, Slam, or Throw",
                attack: true,
            },
        },
        {
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1",
                dcv: "-2",
                effects: "Grab Two Limbs; can Squeeze or Throw",
                attack: true,
            },
        },
    );
    addPower(
        {
            key: "GRABBY",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Grab By",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-3",
                dcv: "-4",
                effects: "Move and Grab object, +(v/10) to STR",
                attack: true,
            },
        },
        {
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-3",
                dcv: "-4",
                effects: "Move and Grab object, +(v/5) to STR",
                attack: true,
            },
        },
    );

    addPower(
        {
            key: "HAYMAKER",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Haymaker",
            duration: "instant",
            range: "no range",
            costEnd: false,
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2 *",
                ocv: "+0",
                dcv: "-5",
                effects: "+4 Damage Classes to any attack",
                attack: false,
            },
        },
        {},
    );
    addPower(
        {
            key: "HIPSHOT",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Hipshot",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1",
                dcv: "+0",
                effects: "+1 DEX only for purposes of initiative",
                attack: true,
            },
        },
        {},
    );
    addPower(undefined, {
        key: "HURRY",
        type: ["maneuver"],
        behaviors: ["non-hd", "optional-maneuver"],
        name: "Hurry",
        perceivability: "obvious",
        duration: "instant",
        range: "self",
        costEnd: false,
        target: "target's dcv",
        ignoreFor: ["base2", "computer", "ai"],
        maneuverDesc: {
            phase: "1/2",
            ocv: "-2",
            dcv: "-2",
            effects: "+1d6 DEX only for purposes of initiative",
            attack: false,
        },
    });

    addPower(
        {
            key: "MOVEBY",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Move By",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-2",
                dcv: "-2",
                effects: "((STR/2) + (v/10))d6; attacker takes ⅓ damage",
                attack: true,
            },
        },
        {
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-2",
                dcv: "-2",
                effects: "((STR/2) + (v/5))d6; attacker takes ⅓ damage",
                attack: true,
            },
        },
    );
    addPower(
        {
            key: "MOVETHROUGH",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Move Through",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-v/10",
                dcv: "-3",
                effects: "(STR + (v/6))d6; attacker takes ½ or full damage",
                attack: true,
            },
        },
        {
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-v/5",
                dcv: "-3",
                effects: "(STR + (v/3))d6; attacker takes ½ or full damage",
                attack: true,
            },
        },
    );
    addPower(
        {
            key: "MULTIPLEATTACK",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Multiple Attack",
            perceivability: "obvious",
            duration: "instant",
            range: "no range", // TODO: Not correct for all possible
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1",
                ocv: "var",
                dcv: "1/2",
                effects: "Attack one or more targets multiple times",
                attack: true,
            },
        },
        undefined,
    );

    addPower(
        {
            key: "OTHERATTACKS",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Other Attacks",
            perceivability: "obvious",
            duration: "instant",
            range: "no range", // TODO: Not correct for all possible.
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "For unlisted attacks",
                attack: true,
            },
        },
        undefined,
    );

    addPower(
        {
            key: "PULLINGAPUNCH",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Pulling A Punch",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1/5d6",
                dcv: "+0",
                effects: "Strike, normal STUN damage, ½ BODY damage",
                attack: true,
            },
        },
        {},
    );

    addPower(undefined, {
        key: "RAPIDFIRE",
        type: ["maneuver"],
        behaviors: ["non-hd", "optional-maneuver"],
        name: "Rapid Fire",
        perceivability: "obvious",
        duration: "instant",
        range: "no range", // TODO: Not correct for all
        costEnd: false,
        target: "target's dcv",
        ignoreFor: ["base2", "computer", "ai"],
        maneuverDesc: {
            phase: "1",
            ocv: "-1/x",
            dcv: "+x1/2",
            effects: "Strike, normal STUN damage, ½ BODY damage",
            attack: true,
        },
    });
    addPower(
        {
            key: "ROLLWITHAPUNCH",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Roll With A Punch",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "-2",
                effects: "Block after being hit, take ½ damage; Abort",
                attack: true,
            },
        },
        {},
    );

    addPower(
        {
            key: "SET",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Set",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1",
                ocv: "+1",
                dcv: "+0",
                effects: "Take extra time to aim a Ranged attack at a target",
                attack: false,
            },
        },
        {},
    );
    addPower(
        {
            key: "SETANDBRACE",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Set And Brace",
            perceivability: "obvious",
            duration: "instant",
            range: "self",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1",
                ocv: "+3",
                dcv: "1/2",
                effects:
                    "Take extra time to aim a Ranged attack at a target, +2 OCV only to offset the Range Modifier",
                attack: false,
            },
        },
        {},
    );
    addPower(
        {
            key: "SHOVE",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Shove",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1",
                dcv: "-1",
                effects: "Push target back 1m per 5 STR used",
                attack: true,
            },
        },
        undefined,
    );
    addPower(
        {
            key: "SNAPSHOT",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Snap Shot",
            perceivability: "obvious",
            duration: "instant",
            range: "standard",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1",
                ocv: "-1",
                dcv: "+0",
                effects: "Lets character duck back behind cover",
                attack: true,
            },
        },
        {},
    );
    addPower(
        {
            key: "STRAFE",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Strafe",
            perceivability: "obvious",
            duration: "instant",
            range: "standard",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2 †",
                ocv: "-v/6",
                dcv: "-2",
                effects: "Make Ranged attack while moving",
                attack: true,
            },
        },
        undefined,
    );
    addPower(
        {
            key: "STRIKE",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Strike",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "STR damage or by weapon type",
                attack: true,
            },
        },
        {},
    );
    addPower(
        {
            key: "SUPPRESSIONFIRE",
            type: ["maneuver"],
            behaviors: ["non-hd", "optional-maneuver"],
            name: "Suppression Fire",
            perceivability: "obvious",
            duration: "instant",
            range: "standard",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "+0",
                effects: "Continuous fire through an area, must be Autofire",
                attack: true,
            },
        },
        {
            maneuverDesc: {
                phase: "1/2",
                ocv: "-2",
                dcv: "+0",
                effects: "Continuous fire on hex(es), must be Autofire",
                attack: true,
            },
        },
    );
    addPower(undefined, {
        key: "SWEEP",
        type: ["maneuver"],
        behaviors: ["non-hd", "optional-maneuver"],
        name: "Sweep",
        perceivability: "obvious",
        duration: "instant",
        range: "no range",
        costEnd: false,
        target: "target's dcv",
        ignoreFor: ["base2", "computer", "ai"],
        maneuverDesc: {
            phase: "1",
            ocv: "-2/x",
            dcv: "x1/2",
            effects: "Make multiple HTH attacks",
            attack: true,
        },
    });

    addPower(
        {
            key: "THROW",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Throw",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "+0",
                dcv: "+0",
                effects: "Throw object or character, does STR damage",
                attack: true,
            },
        },
        undefined,
    );
    addPower(
        {
            key: "TRIP",
            type: ["maneuver"],
            behaviors: ["non-hd"],
            name: "Trip",
            perceivability: "obvious",
            duration: "instant",
            range: "no range",
            costEnd: false,
            target: "target's dcv",
            ignoreFor: ["base2", "computer", "ai"],
            maneuverDesc: {
                phase: "1/2",
                ocv: "-1",
                dcv: "-2",
                effects: "Knock a target to the ground, making him Prone",
                attack: true,
            },
        },
        undefined,
    );
})();

(function addMovementToPowerList() {
    addPower(
        {
            key: "EXTRADIMENSIONALMOVEMENT",
            type: ["movement"],
            behaviors: ["activatable"],
            name: "Extra-Dimensional Movement",
            perceivability: "inobvious",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 20,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {},
    );

    addPower(
        {
            key: "FLIGHT",
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            costPerLevel: 2,
        },
    );
    addPower(
        {
            key: "FTL",
            name: "Faster-Than-Light Travel",
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 2,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {},
    );

    addPower(undefined, {
        key: "GLIDING",
        type: ["movement"],
        behaviors: ["activatable"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 1,
        ignoreFor: ["base2", "computer", "ai"],
    });

    addPower(
        {
            key: "LEAPING",
            name: "Leaping",
            base: 4,
            cost: 1 / 2,
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 0.5,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            base: 2,
            cost: 1,
            costPerLevel: 1,
        },
    );

    addPower(
        {
            key: "RUNNING",
            name: "Running",
            base: 12,
            cost: 1,
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            base: 6,
            cost: 2,
        },
    );

    addPower(
        {
            key: "SWIMMING",
            name: "Swimming",
            base: 4,
            cost: 1 / 2,
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1 / 2,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            base: 2,
            cost: 1,
            costPerLevel: 1,
        },
    );
    addPower(
        {
            key: "SWINGING",
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 0.5,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            costPerLevel: 1,
        },
    );

    addPower(
        {
            key: "TELEPORTATION",
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            costPerLevel: 2,
        },
    );
    addPower(
        {
            key: "TUNNELING",
            type: ["movement"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            costPerLevel: 5,
        },
    );
})();

(function addSkillsToPowerList() {
    addPower(
        {
            key: "ACROBATICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "ACTING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "ANALYZE",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "ANIMAL_HANDLER",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "ARMORSMITH",
        type: ["skill"],
        behaviors: ["success"],
        categorized: true,
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "AUTOFIRE_SKILLS",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "BREAKFALL",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costPerLevel: 1,
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "BRIBERY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "BUGGING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "BUREAUCRATICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "CHARM",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        undefined,
    );
    addPower(
        {
            key: "CLIMBING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_DRIVING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_LEVELS",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            costEnd: false,
            range: "self",
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_PILOTING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "COMPUTER_PROGRAMMING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CONCEALMENT",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CONTORTIONIST",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CONVERSATION",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CRAMMING",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CRIMINOLOGY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CRYPTOGRAPHY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMSKILL",
            type: ["skill"],
            behaviors: [],
            costPerLevel: 1,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "DEDUCTION",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "DEFENSE_MANEUVER",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "DEMOLITIONS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "DISGUISE",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "ELECTRONICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "FAST_DRAW",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "FEINT",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "FORENSIC_MEDICINE",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "FORGERY",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "GAMBLING",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "HIGH_SOCIETY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "HOIST",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });

    addPower(undefined, {
        key: "INSTRUCTOR",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "INTERROGATION",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "INVENTOR",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "KNOWLEDGE_SKILL",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "LANGUAGES",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "LIPREADING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "LOCKPICKING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "MECHANICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "MENTAL_COMBAT_LEVELS",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        undefined,
    );
    addPower(
        {
            key: "MIMICRY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "MIF",
            type: ["skill"],
            behaviors: [],
            name: "Musical Instrument Familiarity",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "NAVIGATION",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "NEGATIVECOMBATSKILLLEVELS",
        type: ["skill"],
        behaviors: [],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(undefined, {
        key: "NEGATIVEPENALTYSKILLLEVELS",
        type: ["skill"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
        behaviors: [],
    });
    addPower(undefined, {
        key: "NEGATIVESKILLLEVELS",
        type: ["skill"],
        behaviors: [],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });

    addPower(
        {
            key: "ORATORY",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(undefined, {
        key: "PARACHUTING",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "PARAMEDICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "PENALTY_SKILL_LEVELS",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "PERCEPTION",
            type: ["skill"],
            behaviors: ["success", "non-hd"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "PERSUASION",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "POISONING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "POWERSKILL",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "PROFESSIONAL_SKILL",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "RAPID_ATTACK_HTH",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "RAPID_ATTACK_RANGED",
        type: ["skill"],
        behaviors: [],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(undefined, {
        key: "RESEARCH",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "RIDING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "SCIENCE_SKILL",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "SECURITY_SYSTEMS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "SEDUCTION",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "SHADOWING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SKILL_LEVELS",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SLEIGHT_OF_HAND",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "SPELL",
        type: ["skill"],
        behaviors: ["success"],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(
        {
            key: "STEALTH",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "STREETWISE",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SURVIVAL",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SYSTEMS_OPERATION",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "TACTICS",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TEAMWORK",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TRACKING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TRADING",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TRANSPORT_FAMILIARITY",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TWO_WEAPON_FIGHTING_HTH",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(undefined, {
        key: "TWO_WEAPON_FIGHTING_RANGED",
        type: ["skill"],
        behaviors: [],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });

    addPower(
        {
            key: "VENTRILOQUISM",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_FAMILIARITY",
            type: ["skill"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "WEAPONSMITH",
            type: ["skill"],
            behaviors: ["success"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "JACK_OF_ALL_TRADES",
            type: ["skill", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "LINGUIST",
            type: ["skill", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SCHOLAR",
            type: ["skill", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "SCIENTIST",
            type: ["skill", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "TRAVELER",
            type: ["skill", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
})();

(function addFrameworksToPowerList() {
    addPower(
        {
            key: "COMPOUNDPOWER",
            type: ["compound"],
            behaviors: [],
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "DIFFERINGMODIFIER",
            name: "Differing Modifier",
            type: ["framework"],
            behaviors: [],
            costEnd: false,
        },
        {},
    );

    addPower(undefined, {
        key: "ELEMENTAL_CONTROL",
        type: ["framework"],
        behaviors: [],
        costEnd: false,
    });

    addPower(
        {
            key: "LIST",
            type: ["framework"],
            behaviors: [],
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "MULTIPOWER",
            type: ["framework"],
            behaviors: [],
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "VPP",
            type: ["framework"],
            behaviors: [],
            costEnd: false,
        },
        {},
    );
})();

(function addPerksToPowerList() {
    addPower(
        {
            key: "ACCESS",
            type: ["perk"],
            behaviors: [],
            name: "Access",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "Advanced Tech",
        type: ["perk"],
        behaviors: [],
        name: "Advanced Tech",
        costEnd: false,
    });
    addPower(
        {
            key: "ANONYMITY",
            type: ["perk"],
            behaviors: [],
            name: "Anonymity",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "COMPUTER_LINK",
            type: ["perk"],
            behaviors: [],
            name: "Computer Link",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "CONTACT",
            type: ["perk"],
            behaviors: ["success"],
            name: "Contact",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMPERK",
            type: ["perk"],
            behaviors: [],
            name: "Custom Perk",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "DEEP_COVER",
            type: ["perk"],
            behaviors: [],
            name: "Deep Cover",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(undefined, {
        key: "FALSEIDENTITY",
        type: ["perk"],
        behaviors: [],
        name: "False Identity",
        costEnd: false,
        costPerLevel: 1,
    });
    addPower(
        {
            key: "FAVOR",
            type: ["perk"],
            behaviors: [],
            name: "Favor",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "FOLLOWER",
            type: ["perk"],
            behaviors: [],
            name: "Follower",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "FRINGE_BENEFIT",
            type: ["perk"],
            behaviors: [],
            name: "Fringe Benefit",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "MONEY",
            type: ["perk"],
            behaviors: [],
            name: "Money",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "REPUTATION",
            type: ["perk", "disadvantage"],
            behaviors: ["success"],
            name: "Positive Reputation",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "RESOURCE_POOL",
            type: ["perk"],
            behaviors: [],
            name: "Resource Points",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "VEHICLE_BASE",
            type: ["perk"],
            behaviors: [],
            name: "Vehicles & Bases",
            costEnd: false,
        },
        {},
    );
})();

(function addTalentsToPowerList() {
    addPower(
        {
            key: "ABSOLUTE_RANGE_SENSE",
            type: ["talent"],
            behaviors: [],
            name: "Absolute Range Sense",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "ABSOLUTE_TIME_SENSE",
            type: ["talent"],
            behaviors: [],
            name: "Absolute Time Sense",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "AMBIDEXTERITY",
            type: ["talent"],
            behaviors: [],
            name: "Ambidexterity",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "ANIMALFRIENDSHIP",
            type: ["talent"],
            behaviors: [],
            name: "Animal Friendship",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "BEASTSPEECH",
            type: ["talent"],
            behaviors: [],
            name: "Beast Speech",
            duration: "instant",
            target: "dmcv",
            range: "no range",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "BERSERKFURY",
            type: ["talent"],
            behaviors: [],
            name: "Berserk Fury",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "BUMP_OF_DIRECTION",
            type: ["talent"],
            behaviors: [],
            name: "Bump of Direction",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "COMBATARCHERY",
        type: ["talent"],
        behaviors: [],
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
        name: "Combat Archery",
    });
    addPower(
        {
            key: "COMBAT_LUCK",
            type: ["talent"],
            behaviors: ["activatable"],
            name: "Combat Luck",
            duration: "constant",
            costEnd: false,
            costPerLevel: 6,
        },
        {},
    );
    addPower(undefined, {
        key: "COMBATREADY",
        type: ["talent"],
        behaviors: [],
        name: "Combat Ready",
        costEnd: false,
    });
    addPower(
        {
            key: "COMBAT_SENSE",
            type: ["talent"],
            behaviors: ["success"],
            name: "Combat Sense",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "COMBATSHOOTING",
        type: ["talent"],
        behaviors: [],
        name: "Combat Shooting",
        costEnd: false,
    });
    addPower(undefined, {
        key: "COMBATSPELLCASTING",
        type: ["talent"],
        behaviors: [],
        name: "Combat Spellcasting",
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
    });
    addPower(undefined, {
        key: "CRIPPLINGBLOW",
        type: ["talent"],
        behaviors: [],
        name: "Crippling Blow",
        duration: "instant",
        target: "target's dcv",
        range: "no range",
        costEnd: false,
    });
    addPower(
        {
            key: "CUSTOMTALENT",
            type: ["talent"],
            behaviors: [],
            name: "Custom Talent",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "DANGER_SENSE",
            type: ["talent"],
            behaviors: ["success"],
            name: "Danger Sense",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "DEADLYBLOW",
            type: ["talent"],
            behaviors: [],
            name: "Deadly Blow",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "DIVINEFAVOR",
            type: ["talent"],
            behaviors: [],
            name: "Divine Favor",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,

            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "DOUBLE_JOINTED",
            type: ["talent"],
            behaviors: [],
            name: "Double Jointed",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "EIDETIC_MEMORY",
            type: ["talent"],
            behaviors: [],
            name: "Eidetic Memory",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "ENVIRONMENTAL_MOVEMENT",
            type: ["talent"],
            behaviors: [],
            name: "Environmental Movement",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(undefined, {
        key: "EVASIVE",
        type: ["talent"],
        behaviors: [],
        name: "Evasive",
        duration: "instant",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 0,
    });

    addPower(undefined, {
        key: "FTLPILOT",
        type: ["talent"],
        behaviors: [],
        name: "FTL Pilot",
        costEnd: false,
        costPerLevel: 0,
    });
    addPower(
        {
            key: "FASCINATION",
            type: ["talent"],
            behaviors: [],
            name: "Fascination",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "FEARLESS",
            type: ["talent"],
            behaviors: [],
            name: "Fearless",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "FOLLOWTHROUGHATTACK",
            type: ["talent"],
            behaviors: [],
            name: "Follow Through Attack",
            duration: "instant",
            target: "target's dcv",
            range: "no range",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "HOTSHOTPILOT",
        type: ["talent"],
        behaviors: [],
        name: "Hotshot Pilot",
        costEnd: false,
        costPerLevel: 0,
    });

    addPower(undefined, {
        key: "INSPIRE",
        type: ["talent"],
        behaviors: [],
        name: "Inspire",
        costEnd: false,
        costPerLevel: 0,
    });

    addPower(
        {
            key: "LATENTPSIONIC",
            type: ["talent"],
            behaviors: [],
            name: "Latent Psionic",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTNING_CALCULATOR",
            type: ["talent"],
            behaviors: [],
            name: "Lightning Calculator",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTNING_REFLEXES_ALL",
            type: ["talent"],
            behaviors: [],
            name: "Lightning Reflexes",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTNING_REFLEXES_SINGLE",
            type: ["talent"],
            behaviors: [],
            name: "Lightning Reflexes",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTSLEEP",
            type: ["talent"],
            behaviors: [],
            name: "Lightsleep",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "MAGESIGHT",
        type: ["talent"],
        behaviors: [],
        name: "Mage Sight",
        duration: "persistent",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "MOUNTEDWARRIOR",
        type: ["talent"],
        behaviors: [],
        name: "Mounted Warrior",
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 0,
    });

    addPower(
        {
            key: "PERFECT_PITCH",
            type: ["talent"],
            behaviors: [],
            name: "Perfect Pitch",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "OFFHANDDEFENSE",
            type: ["talent"],
            behaviors: [],
            name: "Off-Hand Defense",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "RAPIDARCHERY",
        type: ["talent"],
        behaviors: [],
        name: "Rapid Archery",
        duration: "instant",
        target: "self only",
        range: "standard",
        costEnd: false,
        costPerLevel: 1,
    });
    addPower(undefined, {
        key: "RAPIDHEALING",
        type: ["talent"],
        behaviors: [],
        name: "Rapid Healing",
        duration: "persistent",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 1,
    });
    addPower(
        {
            key: "RESISTANCE",
            type: ["talent"],
            behaviors: [],
            name: "Resistance",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(undefined, {
        key: "SHAPECHANGING",
        type: ["talent"],
        behaviors: [],
        name: "Shapechanging",
        duration: "instant",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 0,
    });
    addPower(
        {
            key: "SIMULATE_DEATH",
            type: ["talent"],
            behaviors: ["activatable"],
            name: "Simulate Death",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "SKILLMASTER",
        type: ["talent"],
        behaviors: [],
        name: "Skill Master",
        costEnd: false,
        costPerLevel: 1,
    });
    addPower(
        {
            key: "SPEED_READING",
            type: ["talent"],
            behaviors: [],
            name: "Speed Reading",
            costEnd: false,
            costPerLevel: 2,
        },
        {},
    );
    addPower(undefined, {
        key: "SPELLAUGMENTATION",
        type: ["talent"],
        behaviors: [],
        name: "Spell Augmentation",
        costEnd: false,
        costPerLevel: 2,
    });
    addPower(
        {
            key: "STRIKING_APPEARANCE",
            type: ["talent"],
            behaviors: [],
            name: "Striking Appearance",
            costEnd: false,
            costPerLevel: 3,
        },
        undefined,
    );

    addPower(undefined, {
        key: "TRACKLESSSTRIDE",
        type: ["talent"],
        behaviors: ["activatable"],
        name: "Trackless Stride",
        duration: "constant",
        target: "self only",
        range: "self",
        costEnd: true,
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "TURNUNDEAD",
        type: ["talent"],
        behaviors: ["activatable"],
        name: "Turn Undead",
        duration: "persistent",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 0,
    });

    addPower(
        {
            key: "UNIVERSAL_TRANSLATOR",
            type: ["talent"],
            behaviors: [],
            name: "Universal Translator",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_MASTER",
            type: ["talent"],
            behaviors: [],
            name: "Weapon Master",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );
})();

(function addPowersToPowerList() {
    addPower(
        {
            key: "ABSORPTION",
            name: "Absorption",
            type: ["adjustment", "standard"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {
            type: ["adjustment", "attack"],
            behaviors: ["activatable", "dice"],
            costPerLevel: 5,
        },
    );
    addPower(
        {
            key: "AID",
            name: "Aid",
            type: ["adjustment", "attack"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 6,
        },
        {
            costEnd: false,
            costPerLevel: 10,
        },
    );
    addPower(
        undefined,
        {
            key: "ARMOR",
            name: "Resistant Protection",
            type: ["defense"],
            behaviors: ["activatable"],
            duration: "persistent",
            costPerLevel: 3 / 2,
        },
        {
            name: "Armor",
        },
    );
    addPower(
        {
            key: "AUTOMATON",
            name: "Takes No Stun",
            type: ["automaton", "special"],
            behaviors: [],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "CHANGEENVIRONMENT",
            name: "Change Environment",
            type: ["attack"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "constant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "CLAIRSENTIENCE",
            name: "Clairsentience",
            type: ["sense"],
            behaviors: [],
            duration: "constant",
            range: "standard",
        },
        {},
    );
    addPower(
        {
            key: "CLINGING",
            name: "Clinging",
            type: ["standard"],
            behaviors: ["activatable"],
            duration: "constant",
            costEnd: false,
            costPerLevel: 1 / 3,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMPOWER",
            name: "Custom Power",
            type: ["custom", "activatable"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "DAMAGENEGATION",
            name: "Damage Negation",
            type: ["defense", "special"],
            behaviors: ["activatable"],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        undefined,
    );
    addPower(
        {
            key: "DAMAGEREDUCTION",
            name: "Damage Reduction",
            type: ["defense", "standard"],
            behaviors: ["activatable"],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        undefined,
        {
            key: "DAMAGERESISTANCE",
            name: "Damage Resistance",
            type: ["defense"],
            behaviors: ["activatable"],
            //perceivability: "obvious",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1 / 2,
        },
        {},
    );
    addPower(
        {
            key: "DARKNESS",
            name: "Darkness",
            type: ["sense-affecting", "attack", "standard"],
            behaviors: ["attack"],
            duration: "constant",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "DENSITYINCREASE",
            name: "Density Increase",
            type: ["body-affecting", "standard"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 4,
        },
        {
            costPerLevel: 5,
        },
    );
    addPower(
        {
            key: "DESOLIDIFICATION",
            name: "Desolidification",
            type: ["body-affecting", "standard"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "DISPEL",
            name: "Dispel",
            type: ["adjustment", "attack"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 3,
        },
        {},
    );
    addPower(
        {
            key: "DOESNOTBLEED",
            name: "Does Not Bleed",
            type: ["automaton", "special"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "persistent",
        },
        {},
    );
    addPower(
        {
            key: "DRAIN",
            name: "Drain",
            type: ["adjustment", "attack"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 10,
        },
        {},
    );
    addPower(
        {
            key: "DUPLICATION",
            name: "Duplication",
            type: ["body-affecting", "special"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0.2,
        },
        {},
    );

    addPower(
        {
            key: "EGOATTACK",
            name: "Mental Blast",
            type: ["attack", "mental"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 10,
        },
        {
            name: "Ego Attack",
        },
    );
    addPower(
        {
            key: "ENDURANCERESERVE",
            name: "Endurance Reserve",
            type: ["special"],
            behaviors: [],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1 / 4,
        },
        {},
    );
    addPower(
        {
            key: "ENERGYBLAST",
            name: "Blast",
            type: ["attack"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "standard",
            costPerLevel: 5,
            costEnd: true,
        },
        {
            name: "Energy Blast",
        },
    );
    addPower(
        {
            key: "ENTANGLE",
            name: "Entangle",
            type: ["attack", "standard"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "standard",
            costPerLevel: 10,
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "EXTRALIMBS",
            name: "Extra Limbs",
            type: ["standard"],
            behaviors: [],
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "FINDWEAKNESS",
        type: ["sense", "special", "skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "FIXEDLOCATION",
            name: "Teleportation: Fixed Location",
            type: ["attack", "sense-affecting", "standard"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "FLOATINGLOCATION",
            name: "Teleportation: Floating Fixed Location",
            type: ["attack", "sense-affecting", "standard"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "FLASH",
            type: ["attack", "sense-affecting", "standard"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "FLASHDEFENSE",
            type: ["defense", "special"],
            behaviors: ["activatable"],
            name: "Flash Defense",
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "FORCEFIELD",
            type: ["defense", "standard"],
            behaviors: ["activatable"],
            name: "Resistant Protection",
            duration: "persistent",
            perceivability: "inobvious",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1.5,
        },
        {
            name: "Force Field",
            duration: "constant",
            costEnd: true,
            costPerLevel: 1,
        },
    );
    addPower(
        {
            key: "FORCEWALL",
            type: ["defense", "standard"],
            behaviors: ["activatable"],
            name: "Barrier",
            duration: "instant",
            range: "standard",
            costEnd: true,
            costPerLevel: 3,
        },
        {
            name: "Force Wall",
            duration: "constant",
            costPerLevel: 2.5,
        },
    );

    addPower(
        {
            key: "GROWTH",
            name: "Growth",
            type: ["body-affecting", "size"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );

    addPower(
        {
            key: "HANDTOHANDATTACK",
            name: "Hand-To-Hand Attack",
            type: ["attack"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "no range",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "HEALING",
            type: ["adjustment"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target's dcv",
            range: "no range",
            costEnd: true,
            costPerLevel: 10,
        },
        {},
    );
    addPower(
        {
            key: "HKA",
            name: "Hand-To-Hand Killing Attack",
            type: ["attack"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "no range",
            costPerLevel: 15,
            costEnd: true,
        },
        {},
    );

    addPower(
        {
            key: "IMAGES",
            name: "Images",
            type: ["attack", "sense-affecting", "standard"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "constant",
            target: "area (see text)",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "INVISIBILITY",
            name: "Invisibility",
            type: ["sense-affecting", "standard"],
            behaviors: ["activatable"],
            perceivability: "Special",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
        },
        {},
    );

    addPower(
        {
            key: "KBRESISTANCE",
            type: ["defense", "standard"],
            behaviors: ["activatable"],
            name: "Knockback Resistance",
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {
            costPerLevel: 2,
        },
    );

    addPower(undefined, {
        key: "LACKOFWEAKNESS",
        type: ["defense", "special"],
        behaviors: ["activatable"],
        name: "Knockback Resistance",
        perceivability: "imperceptible",
        duration: "persistent",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 1,
    });
    addPower(
        {
            key: "LIFESUPPORT",
            name: "Life Support",
            type: ["standard"],
            behaviors: ["activatable"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
    addPower(
        {
            key: "LUCK",
            name: "Luck",
            type: ["special"],
            behaviors: ["dice"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 5,
        },
        {},
    );

    addPower(
        {
            key: "MENTALDEFENSE",
            type: ["defense", "special"],
            behaviors: ["activatable"],
            name: "Mental Defense",
            perceivability: "imperceptible",
            target: "self only",
            range: "self",
            costEnd: false,
            duration: "persistent",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "MENTALILLUSIONS",
            name: "Mental Illusions",
            type: ["attack", "mental"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "MINDCONTROL",
            name: "Mind Control",
            type: ["attack", "mental"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "MINDLINK",
            name: "Mind Link",
            type: ["mental"],
            behaviors: ["attack", "activatable", "dice"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "dmcv",
            range: "los",
            costEnd: false,
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "MINDSCAN",
            type: ["mental", "sense"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "constant",
            target: "dmcv",
            range: "special",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "MISSILEDEFLECTION",
            name: "Deflection",
            type: ["defense", "standard"],
            behaviors: ["attack", "activatable"],
            perceivability: "inobvious",
            duration: "instant",
            target: "target’s OCV",
            range: "standard",
            costEnd: true,
        },
        {
            name: "Missile Deflection and Reflection",
            duration: "constant",
        },
    );
    addPower(
        {
            key: "MULTIFORM",
            type: ["body-affecting", "standard"],
            behaviors: ["activatable"],
            name: "Multiform",
            perceivability: "obvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0.2,
        },
        {},
    );

    addPower(
        {
            key: "NAKEDMODIFIER",
            type: ["special"],
            behaviors: [],
            costEnd: true,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "NOHITLOCATIONS",
            name: "No Hit Locations",
            type: ["automaton"],
            behaviors: [],
            costEnd: true,
            costPerLevel: 0,
        },
        undefined,
    );

    addPower(
        {
            key: "POSSESSION",
            type: ["attack", "mental"],
            behaviors: ["attack", "dice"],
            name: "Possession",
            perceivability: "obvious",
            duration: "constant",
            target: "DMCV",
            range: "los",
            costEnd: true,
            costPerLevel: 0.5,
        },
        undefined,
    );
    addPower(
        {
            key: "POWERDEFENSE",
            type: ["defense", "special"],
            behaviors: ["activatable"],
            name: "Power Defense",
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "REFLECTION",
            type: ["attack", "standard"],
            behaviors: ["attack", "activatable"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 3 / 2,
        },
        undefined,
    );
    addPower(
        {
            key: "REGENERATION",
            type: ["special"],
            behaviors: ["activatable"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        undefined,
    );
    addPower(
        {
            key: "RKA",
            name: "Ranged Killing Attack",
            type: ["attack"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "standard",
            costPerLevel: 15,
            costEnd: true,
            sheet: {
                INPUT: {
                    label: "Vs.",
                    selectOptions: {
                        ED: "ED",
                        PD: "PD",
                    },
                },
            },
        },
        {},
    );

    addPower(
        {
            key: "SHAPESHIFT",
            name: "Shape Shift",
            type: ["body-affecting"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "SHRINKING",
            name: "Shrinking",
            type: ["body-affecting", "size"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 6,
        },
        { costPerLevel: 10 },
    );
    addPower(
        {
            key: "STRETCHING",
            type: ["body-affecting", "standard"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1,
        },
        { costPerLevel: 5 },
    );
    addPower(
        {
            key: "SUCCOR",
            name: "Boost",
            type: ["adjustment"],
            behaviors: ["attack", "dice"],
            duration: "constant",
            target: "target's DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 5,
        },
        {
            name: "Succor",
        },
    );
    addPower(
        {
            key: "SUMMON",
            name: "Summon",
            type: ["standard"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            target: "n/a",
            range: "self",
            costPerLevel: 1 / 5,
        },
        {},
    );
    addPower(undefined, {
        key: "SUPPRESS",
        name: "Suppress",
        type: ["adjustment", "attack"],
        behaviors: ["attack", "dice"],
        perceivability: "obvious",
        duration: "constant",
        target: "target’s DCV",
        range: "standard",
        costEnd: true,
        costPerLevel: 5,
    });

    addPower(
        {
            key: "TELEKINESIS",
            name: "Telekinesis",
            type: ["attack", "standard"],
            behaviors: ["attack", "dice", "activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 1.5,
        },
        {},
    );
    addPower(
        {
            key: "TELEPATHY",
            type: ["mental"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 5,
        },
        {},
    );
    addPower(undefined, {
        key: "TRANSFER",
        name: "Transfer",
        type: ["adjustment", "attack", "dice"],
        behaviors: ["attack"],
        perceivability: "obvious",
        duration: "instant",
        target: "target's DCV",
        range: "no range",
        costEnd: true,
        costPerLevel: 15,
    });
    addPower(
        {
            key: "TRANSFORM",
            name: "Transform",
            type: ["attack", "standard"],
            behaviors: ["attack"],
            perceivability: "obvious",
            duration: "instant",
            target: "target's DCV",
            range: "standard",
            costEnd: true,
        },
        {},
    );
})();

(function addMartialToPowerList() {
    addPower(
        {
            key: "EXTRADC",
            type: ["martial"],
            behaviors: [],
            costPerLevel: 4,
        },
        {},
    );

    addPower(
        {
            key: "MANEUVER",
            type: ["martial", "attack"], // TODO: Not all of these are attacks
            behaviors: ["dice"],
        },
        {},
    );

    addPower(
        {
            key: "RANGEDDC",
            type: ["martial"],
            behaviors: [],
            costPerLevel: 4,
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_ELEMENT",
            type: ["martial"],
            behaviors: [],
            categorized: true,
        },
        {},
    );
})();

(function addSensesToPowerList() {
    addPower(
        {
            key: "ACTIVESONAR",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "ADJACENTFIXED",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        undefined,
    );
    addPower(
        {
            key: "ADJACENT",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        undefined,
    );
    addPower(
        {
            key: "ANALYZESENSE",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "CONCEALED",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "DETECT",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "DIMENSIONALSINGLE",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "DIMENSIONALGROUP",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "DIMENSIONALALL",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "DISCRIMINATORY",
            type: ["sense"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "ENHANCEDPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "HRRP",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "INCREASEDARC240",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "INCREASEDARC360",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "INFRAREDPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "MAKEASENSE",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "MENTALAWARENESS",
            type: ["sense"],
            behaviors: [],
            senseGroup: "mental",
            senseType: "passive",
        },
        {},
    );
    addPower(
        {
            key: "MICROSCOPIC",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "NIGHTVISION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "NRAYPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "PARTIALLYPENETRATIVE",
            type: ["sense"],
            behaviors: [],
        },
        undefined,
    );
    addPower(
        {
            key: "PENETRATIVE",
            type: ["sense"],
            behaviors: [],
        },
        undefined,
    );

    addPower(
        {
            key: "RADAR",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "RADIOPERCEIVETRANSMIT",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "RADIOPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "RANGE",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "RAPID",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "SPATIALAWARENESS",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "TARGETINGSENSE",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "TELESCOPIC",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "TRACKINGSENSE",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "TRANSMIT",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "ULTRASONICPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "ULTRAVIOLETPERCEPTION",
            type: ["sense"],
            behaviors: [],
        },
        {},
    );
})();

(function addComplicationsToPowerList() {
    addPower(
        {
            key: "ACCIDENTALCHANGE",
            type: ["disadvantage"],
            behaviors: ["success"],
            name: "Accidental Change",
        },
        {},
    );

    addPower(
        {
            key: "GENERICDISADVANTAGE",
            type: ["disadvantage"],
            behaviors: [],
            name: "Custom Disadvantage",
        },
        {},
    );

    addPower(
        {
            key: "DEPENDENCE",
            type: ["disadvantage"],
            behaviors: ["roll"],
            name: "Dependence",
        },
        {},
    );
    addPower(
        {
            key: "DEPENDENTNPC",
            type: ["disadvantage"],
            behaviors: ["success"],
            name: "Dependent NPC",
        },
        {},
    );
    addPower(
        {
            key: "DISTINCTIVEFEATURES",
            type: ["disadvantage"],
            behaviors: [],
            name: "Distinctive Features",
        },
        {},
    );

    addPower(
        {
            key: "ENRAGED",
            type: ["disadvantage"],
            behaviors: ["success"],
            name: "Enraged/Berserk",
        },
        {},
    );

    addPower(
        {
            key: "HUNTED",
            type: ["disadvantage"],
            behaviors: ["success"],
            name: "Hunted",
        },
        {},
    );

    addPower(
        {
            key: "MONEYDISAD",
            type: ["disadvantage"],
            behaviors: [],
            name: "Hunted",
        },
        {},
    );

    addPower(
        {
            key: "PHYSICALLIMITATION",
            type: ["disadvantage"],
            behaviors: [],
            name: "Physical Limitation",
        },
        {},
    );
    addPower(
        {
            key: "PSYCHOLOGICALLIMITATION",
            type: ["disadvantage"],
            behaviors: [],
            name: "Psychological Limitation",
        },
        {},
    );

    addPower(
        {
            key: "RIVALRY",
            type: ["disadvantage"],
            behaviors: [],
            name: "Rivalry",
        },
        {},
    );

    addPower(
        {
            key: "SOCIALLIMITATION",
            type: ["disadvantage"],
            behaviors: ["success"],
            name: "Social Limitation",
        },
        {},
    );
    addPower(
        {
            key: "SUSCEPTIBILITY",
            type: ["disadvantage"],
            behaviors: ["dice"],
            name: "Susceptibility",
        },
        {},
    );

    addPower(
        {
            key: "UNLUCK",
            type: ["disadvantage"],
            behaviors: ["dice"],
            name: "Unluck",
            costPerLevel: 5,
        },
        {},
    );

    addPower(
        {
            key: "VULNERABILITY",
            type: ["disadvantage"],
            behaviors: [],
            name: "Vulnerability",
        },
        {},
    );
})();

// For some reason the BASECOST of some modifiers/adder are 0, some are just wrong
HERO.ModifierOverride = {
    ADDITIONALED: { BASECOST: 5 / 2 },
    ADDITIONALPD: { BASECOST: 5 / 2 },
    ALWAYSOCCURS: { BASECOST: 0, MULTIPLIER: 2 },
    AOE: { dc: true },
    ARMORPIERCING: { BASECOST: 0.25, dc: true },
    AUTOFIRE: { dc: true },
    AVAD: { dc: true },
    BOOSTABLE: { dc: true },
    CONTINUOUS: { dc: true },
    CONTINUOUSCONCENTRATION: { BASECOST: -0.25 },
    DAMAGEOVERTIME: { dc: true },
    DEFBONUS: { BASECOST: 2 },
    DIFFICULTTODISPEL: { BASECOST: 0.25 },
    DIMENSIONS: { BASECOST: 5 },
    DOESBODY: { dc: true },
    DOUBLEKB: { dc: true },
    ENDURANCERESERVEREC: { BASECOST: 2 / 3 },
    ENERGY: { BASECOST: 5 }, // DAMAGENEGATION
    HARDENED: { BASECOST: 0.25 },
    IMPENETRABLE: { BASECOST: 0.25 },
    IMPROVEDNONCOMBAT: { BASECOST: 5 },
    MENTAL: { BASECOST: 5 }, // DAMAGENEGATION
    PENETRATING: { BASECOST: 0.5, dc: true },
    PHYSICAL: { BASECOST: 5 }, // DAMAGENEGATION
    STICKY: { dc: true },
    TIMELIMIT: { dc: true },
    TRANSDIMENSIONAL: { dc: true },
    TRIGGER: { dc: true },
    UNCONTROLLED: { dc: true },
    VARIABLEADVANTAGE: { dc: true },
    VARIABLESFX: { dc: true },
};

HERO.ModifierOverride5e = {
    ARMORPIERCING: {
        BASECOST: 0.5,
    },
};

// Valid Power Options (found these in Custom Power)
HERO.ValidPowerOptions = {
    Range: {
        SelfOnly: "Self Only",
        None: "None",
        Ranged: "Ranged",
        LineOfSight: "Line of Sight",
    },
    Duration: {
        // TODO: should these be capitalized?
        Instant: "Instant",
        Constant: "Constant",
        Persistent: "Persistent",
        Inherent: "Inherent",
    },
    Target: {
        NA: "N/A",
        SelfOnly: "Self Only",
        DCV: "DCV",
        DMCV: "DMCV",
        HEX: "HEX",
    },
    Defense: {
        None: "None",
        Normal: "Normal",
        Mental: "Mental",
        Power: "Power",
        Flash: "Flash",
    },
    Adders: {
        Adjustment: "Adjustment Power",
        Attack: "Attack Power",
        BodyAffecting: "Body-Affecting Power",
        Defense: "Defense Power",
        Mental: "Mental Power",
        Movement: "Movement Power",
        SenseAffecting: "Sense-Affecting Power",
        Sensory: "Sensory Power",
        Size: "Size Power",
        Special: "Special Power",
    },
};

HERO.areaOfEffect = {
    types: {
        none: "None",
        radius: "Radius",
        cone: "Cone",
        line: "Line",
        surface: "Surface",
        any: "Any Area",
    },
};

HERO.csl = {
    options: {
        SINGLE: "with any single attack",
        TIGHT: "with a small group of attacks",
        BROAD: "with a large group of attacks",
        HTH: "with HTH Combat",
        RANGED: "with Ranged Combat",
        ALL: "with All Attacks",
    },
};

HERO.mcsl = {
    options: {
        SINGLE: "with a single Mental Power",
        TIGHT: "with a group of Mental Powers",
        BROAD: "with all Mental Powers",
    },
};

HERO.stunBodyDamages = {
    stunbody: "Stun and Body",
    stunonly: "Stun only",
    bodyonly: "Body only",
    effectonly: "Effect only",
};

HERO.knockbackMultiplier = {
    0: "No Knockback",
    1: "Knockback",
    2: "Double Knockback",
};

HERO.SFX = [
    "Default",
    "Acid",
    "Alien",
    "Air/Wind",
    "Animal",
    "Body Control",
    "Chi",
    "Cosmic Energy",
    "Cyberkinesis",
    "Darkness",
    "Density Alteration",
    "Dimensional Manipulation",
    "Earth/Stone",
    "Electricity",
    "Emotion Control",
    "Fire/Heat",
    "Force",
    "Gravity",
    "Ice/Cold",
    "Illusion",
    "Kinetic Energy",
    "Light",
    "Luck",
    "Magic/Mystic",
    "Magnetism",
    "Martial Arts",
    "Matter Manipulation",
    "Mental/Psionic",
    "Metamorphic",
    "Precognition",
    "Radiation",
    "Serum Based",
    "Shape Alteration",
    "Size Alteration",
    "Sleep/Dream",
    "Solar/Celestial",
    "Sonic",
    "Speedster",
    "Strength/Toughness",
    "Stretching",
    "Telekinetic",
    "Teleportation",
    "Time",
    "Vibration",
    "Water",
    "Weather",
    "Wood/Plant",
    "Miscellaneous",
];
