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

HERO.hitLocationSide = {
    Left: "Left",
    Right: "Right",
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
            xml: `<SKILL XMLID="ACROBATICS" BASECOST="3.0" LEVELS="0" ALIAS="Acrobatics" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="ACTING" ID="1709161468976" BASECOST="3.0" LEVELS="0" ALIAS="Acting" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="ANALYZE" ID="1709161469684" BASECOST="3.0" LEVELS="0" ALIAS="Analyze" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Agility Skills" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="ANIMAL_HANDLER" ID="1709161473096" BASECOST="0.0" LEVELS="0" ALIAS="Animal Handler" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="AUTOFIRE_SKILLS" ID="1709161475889" BASECOST="5.0" LEVELS="0" ALIAS="Autofire Skills" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ACCURATE" OPTIONID="ACCURATE" OPTION_ALIAS="Accurate Sprayfire" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="BREAKFALL" ID="1709161478362" BASECOST="3.0" LEVELS="0" ALIAS="Breakfall" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="BRIBERY" ID="1709161479206" BASECOST="3.0" LEVELS="0" ALIAS="Bribery" POSITION="6" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="BUGGING" ID="1709161479965" BASECOST="3.0" LEVELS="0" ALIAS="Bugging" POSITION="7" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="BUREAUCRATICS" ID="1709161480723" BASECOST="3.0" LEVELS="0" ALIAS="Bureaucratics" POSITION="8" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CHARM" ID="1709161481624" BASECOST="3.0" LEVELS="0" ALIAS="Charm" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CLIMBING" ID="1709161482605" BASECOST="3.0" LEVELS="0" ALIAS="Climbing" POSITION="10" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="COMBAT_DRIVING" ID="1709161483399" BASECOST="3.0" LEVELS="0" ALIAS="Combat Driving" POSITION="11" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="COMBAT_LEVELS" ID="1709161485197" BASECOST="0.0" LEVELS="1" ALIAS="Combat Skill Levels" POSITION="13" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="COMBAT_PILOTING" ID="1709161484209" BASECOST="3.0" LEVELS="0" ALIAS="Combat Piloting" POSITION="12" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="COMPUTER_PROGRAMMING" ID="1709161488163" BASECOST="3.0" LEVELS="0" ALIAS="Computer Programming" POSITION="14" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CONCEALMENT" ID="1709161490757" BASECOST="3.0" LEVELS="0" ALIAS="Concealment" POSITION="15" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CONTORTIONIST" ID="1709161491534" BASECOST="3.0" LEVELS="0" ALIAS="Contortionist" POSITION="16" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CONVERSATION" ID="1709161492343" BASECOST="3.0" LEVELS="0" ALIAS="Conversation" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CRAMMING" ID="1709161493162" BASECOST="5.0" LEVELS="0" ALIAS="Cramming" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="CRIMINOLOGY" ID="1709161494054" BASECOST="3.0" LEVELS="0" ALIAS="Criminology" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CRYPTOGRAPHY" ID="1709161496416" BASECOST="3.0" LEVELS="0" ALIAS="Cryptography" POSITION="20" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="CUSTOMSKILL" ID="1709161497972" BASECOST="0.0" LEVELS="1" ALIAS="Custom Skill" POSITION="21" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No" ROLL="0">`,
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
            xml: `<SKILL XMLID="DEDUCTION" ID="1709161500786" BASECOST="3.0" LEVELS="0" ALIAS="Deduction" POSITION="22" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="DEFENSE_MANEUVER" ID="1709161501659" BASECOST="3.0" LEVELS="0" ALIAS="Defense Maneuver" POSITION="23" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ONE" OPTIONID="ONE" OPTION_ALIAS="I" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="DEMOLITIONS" ID="1709161503996" BASECOST="3.0" LEVELS="0" ALIAS="Demolitions" POSITION="24" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="DISGUISE" ID="1709161504988" BASECOST="3.0" LEVELS="0" ALIAS="Disguise" POSITION="25" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="ELECTRONICS" ID="1709161505775" BASECOST="3.0" LEVELS="0" ALIAS="Electronics" POSITION="26" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="FAST_DRAW" ID="1709161506592" BASECOST="3.0" LEVELS="0" ALIAS="Fast Draw" POSITION="27" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="FORENSIC_MEDICINE" ID="1709161509009" BASECOST="3.0" LEVELS="0" ALIAS="Forensic Medicine" POSITION="28" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="FORGERY" ID="1709161509923" BASECOST="0.0" LEVELS="0" ALIAS="Forgery" POSITION="29" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="GAMBLING" ID="1709161511974" BASECOST="0.0" LEVELS="0" ALIAS="Gambling" POSITION="30" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="HIGH_SOCIETY" ID="1709161513798" BASECOST="3.0" LEVELS="0" ALIAS="High Society" POSITION="31" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="INTERROGATION" ID="1709161516272" BASECOST="3.0" LEVELS="0" ALIAS="Interrogation" POSITION="32" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="INVENTOR" ID="1709161517097" BASECOST="3.0" LEVELS="0" ALIAS="Inventor" POSITION="33" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="KNOWLEDGE_SKILL" ID="1709161518105" BASECOST="2.0" LEVELS="0" ALIAS="KS" POSITION="34" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No" TYPE="General">`,
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
            xml: `<SKILL XMLID="LANGUAGES" ID="1709161520791" BASECOST="1.0" LEVELS="0" ALIAS="Language" POSITION="35" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="BASIC" OPTIONID="BASIC" OPTION_ALIAS="basic conversation" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" FAMILIARITY="No" PROFICIENCY="No" NATIVE_TONGUE="No">`,
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
            xml: `<SKILL XMLID="LIPREADING" ID="1709161523279" BASECOST="3.0" LEVELS="0" ALIAS="Lipreading" POSITION="36" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="LOCKPICKING" ID="1709161524481" BASECOST="3.0" LEVELS="0" ALIAS="Lockpicking" POSITION="37" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="MECHANICS" ID="1709161525362" BASECOST="3.0" LEVELS="0" ALIAS="Mechanics" POSITION="38" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="MENTAL_COMBAT_LEVELS" ID="1709161526214" BASECOST="0.0" LEVELS="1" ALIAS="Mental Combat Skill Levels" POSITION="39" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="with a single Mental Power" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="MIMICRY" ID="1709161528926" BASECOST="3.0" LEVELS="0" ALIAS="Mimicry" POSITION="40" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="NAVIGATION" ID="1709161529843" BASECOST="0.0" LEVELS="0" ALIAS="Navigation" POSITION="41" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="ORATORY" ID="1709161532182" BASECOST="3.0" LEVELS="0" ALIAS="Oratory" POSITION="42" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="PARAMEDICS" ID="1709161533283" BASECOST="3.0" LEVELS="0" ALIAS="Paramedics" POSITION="43" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="PENALTY_SKILL_LEVELS" ID="1709161534055" BASECOST="0.0" LEVELS="1" ALIAS="Penalty Skill Levels" POSITION="44" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="to offset a specific negative OCV modifier with any single attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="POWERSKILL" ID="1709161537007" BASECOST="3.0" LEVELS="0" ALIAS="Power" POSITION="45" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="PROFESSIONAL_SKILL" ID="1709161539381" BASECOST="2.0" LEVELS="0" ALIAS="PS" POSITION="46" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="RAPID_ATTACK_HTH" ID="1709161541446" BASECOST="10.0" LEVELS="0" ALIAS="Rapid Attack" POSITION="47" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="RIDING" ID="1709161542264" BASECOST="3.0" LEVELS="0" ALIAS="Riding" POSITION="48" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SCIENCE_SKILL" ID="1709161543124" BASECOST="2.0" LEVELS="0" ALIAS="Science Skill" POSITION="49" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SECURITY_SYSTEMS" ID="1709161545330" BASECOST="3.0" LEVELS="0" ALIAS="Security Systems" POSITION="50" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SHADOWING" ID="1709161547363" BASECOST="3.0" LEVELS="0" ALIAS="Shadowing" POSITION="51" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SKILL_LEVELS" ID="1709161548219" BASECOST="0.0" LEVELS="1" ALIAS="Skill Levels" POSITION="52" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="CHARACTERISTIC" OPTIONID="CHARACTERISTIC" OPTION_ALIAS="with single Skill or Characteristic Roll" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="SLEIGHT_OF_HAND" ID="1709161550467" BASECOST="3.0" LEVELS="0" ALIAS="Sleight Of Hand" POSITION="53" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="STEALTH" ID="1709161551292" BASECOST="3.0" LEVELS="0" ALIAS="Stealth" POSITION="54" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="STREETWISE" ID="1709161552070" BASECOST="3.0" LEVELS="0" ALIAS="Streetwise" POSITION="55" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SURVIVAL" ID="1709161552845" BASECOST="0.0" LEVELS="0" ALIAS="Survival" POSITION="56" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="SYSTEMS_OPERATION" ID="1709161555044" BASECOST="3.0" LEVELS="0" ALIAS="Systems Operation" POSITION="57" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="TACTICS" ID="1709161557125" BASECOST="3.0" LEVELS="0" ALIAS="Tactics" POSITION="58" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="TEAMWORK" ID="1709161558462" BASECOST="3.0" LEVELS="0" ALIAS="Teamwork" POSITION="59" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="DEX" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="TRACKING" ID="1709161559355" BASECOST="3.0" LEVELS="0" ALIAS="Tracking" POSITION="60" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="TRADING" ID="1709161560240" BASECOST="3.0" LEVELS="0" ALIAS="Trading" POSITION="61" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="PRE" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="TWO_WEAPON_FIGHTING_HTH" ID="1709161562189" BASECOST="10.0" LEVELS="0" ALIAS="Two-Weapon Fighting" POSITION="62" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">
            <NOTES />`,
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
            xml: `<SKILL XMLID="VENTRILOQUISM" ID="1709161563244" BASECOST="3.0" LEVELS="0" ALIAS="Ventriloquism" POSITION="63" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            xml: `<SKILL XMLID="WEAPON_FAMILIARITY" ID="1709161564246" BASECOST="0.0" LEVELS="0" ALIAS="WF" POSITION="64" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="GENERAL" FAMILIARITY="No" PROFICIENCY="No">`,
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
            xml: `<SKILL XMLID="WEAPONSMITH" ID="1709161565889" BASECOST="0.0" LEVELS="0" ALIAS="Weaponsmith" POSITION="65" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" CHARACTERISTIC="INT" FAMILIARITY="No" PROFICIENCY="No" LEVELSONLY="No">`,
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
            costPerLevel: 1,
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

    addPower(
        {
            key: "WELL_CONNECTED",
            type: ["perk", "enhancer"],
            behaviors: [],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
        },
        {},
    );
})();

(function addPowersToPowerList() {
    addPower(
        {
            key: "ABSORPTION",
            name: "Absorption",
            type: ["adjustment", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
            xml: ` <POWER XMLID="ABSORPTION" ID="1709333775419" BASECOST="0.0" LEVELS="1" ALIAS="Absorption" POSITION="0" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ENERGY" OPTIONID="ENERGY" OPTION_ALIAS="energy" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
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
            type: ["adjustment", "attack", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 6,
            xml: `<POWER XMLID="AID" BASECOST="0.0" LEVELS="1" ALIAS="Aid" POSITION="1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" USE_END_RESERVE="Yes" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="STR" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
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
            type: ["automaton", "special", "power"],
            behaviors: [],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            xml: `<POWER XMLID="AUTOMATON" ID="1709333784244" BASECOST="15.0" LEVELS="0" ALIAS="Automaton" POSITION="2" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="CANNOTBESTUNNED" OPTIONID="CANNOTBESTUNNED" OPTION_ALIAS="Cannot Be Stunned" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "CHANGEENVIRONMENT",
            name: "Change Environment",
            type: ["attack", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "constant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 1,
            xml: `<POWER XMLID="CHANGEENVIRONMENT" ID="1711932803443" BASECOST="0.0" LEVELS="0" ALIAS="Change Environment" POSITION="5" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "CLAIRSENTIENCE",
            name: "Clairsentience",
            type: ["sense", "power"],
            behaviors: [],
            duration: "constant",
            range: "standard",
            xml: `<POWER XMLID="CLAIRSENTIENCE" ID="1711932894754" BASECOST="20.0" LEVELS="0" ALIAS="Clairsentience" POSITION="23" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="HEARINGGROUP" OPTIONID="HEARINGGROUP" OPTION_ALIAS="Hearing Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
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
            xml: `<POWER XMLID="CLINGING" ID="1709333852130" BASECOST="10.0" LEVELS="5" ALIAS="Clinging" POSITION="24" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMPOWER",
            name: "Custom Power",
            type: ["custom", "activatable"],
            behaviors: [],
            xml: `<POWER XMLID="CUSTOMPOWER" ID="1711932960992" BASECOST="1.0" LEVELS="1" ALIAS="Custom Power" POSITION="26" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" DOESBODY="No" DOESDAMAGE="No" DOESKNOCKBACK="No" KILLING="No" DEFENSE="NONE" END="Yes" VISIBLE="Yes" RANGE="SELF" DURATION="INSTANT" TARGET="SELFONLY" ENDCOLUMNOUTPUT="" USECUSTOMENDCOLUMN="No"`,
        },
        {},
    );

    addPower(
        {
            key: "DAMAGENEGATION",
            name: "Damage Negation",
            type: ["defense", "special", "power"],
            behaviors: ["activatable"],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            xml: `<POWER XMLID="DAMAGENEGATION" ID="1711933005926" BASECOST="0.0" LEVELS="0" ALIAS="Damage Negation" POSITION="27" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            <NOTES />
            <ADDER XMLID="PHYSICAL" ID="1711933106772" BASECOST="0.0" LEVELS="0" ALIAS="Physical DCs" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="5.0" LVLVAL="1.0" SELECTED="YES">
              <NOTES />
            </ADDER>
            <ADDER XMLID="ENERGY" ID="1711933106773" BASECOST="0.0" LEVELS="0" ALIAS="Energy DCs" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="5.0" LVLVAL="1.0" SELECTED="YES">
              <NOTES />
            </ADDER>
            <ADDER XMLID="MENTAL" ID="1711933106774" BASECOST="0.0" LEVELS="0" ALIAS="Mental DCs" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="5.0" LVLVAL="1.0" SELECTED="YES">
              <NOTES />
            </ADDER>
          </POWER>`,
        },
        undefined,
    );
    addPower(
        {
            key: "DAMAGEREDUCTION",
            name: "Damage Reduction",
            type: ["defense", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            xml: `<POWER XMLID="DAMAGEREDUCTION" ID="1709333866040" BASECOST="10.0" LEVELS="0" ALIAS="Damage Reduction" POSITION="28" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="LVL25NORMAL" OPTIONID="LVL25NORMAL" OPTION_ALIAS="Damage Reduction, 25%" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Energy" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        undefined,
        {
            key: "DAMAGERESISTANCE",
            name: "Damage Resistance",
            type: ["defense", "power"],
            behaviors: ["activatable"],
            //perceivability: "obvious",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1 / 2,
            xml: `<POWER XMLID="DAMAGERESISTANCE" ID="1709342567780" BASECOST="0.0" LEVELS="0" ALIAS="Damage Resistance" POSITION="9" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="0" EDLEVELS="0" MDLEVELS="0" FDLEVELS="0" POWDLEVELS="0">`,
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
            xml: `<POWER XMLID="DARKNESS" ID="1709333868971" BASECOST="0.0" LEVELS="1" ALIAS="Darkness" POSITION="29" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
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
            xml: `<POWER XMLID="DENSITYINCREASE" ID="1709333874268" BASECOST="0.0" LEVELS="1" ALIAS="Density Increase" POSITION="31" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {
            costPerLevel: 5,
        },
    );
    addPower(
        {
            key: "DESOLIDIFICATION",
            name: "Desolidification",
            type: ["body-affecting", "standard", "power"],
            behaviors: ["activatable"],
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            xml: `<POWER XMLID="DESOLIDIFICATION" ID="1709333876708" BASECOST="40.0" LEVELS="0" ALIAS="Desolidification" POSITION="32" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "DISPEL",
            name: "Dispel",
            type: ["adjustment", "attack", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 3,
            xml: `<POWER XMLID="DISPEL" ID="1711933464095" BASECOST="0.0" LEVELS="1" ALIAS="Dispel" POSITION="34" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "DOESNOTBLEED",
            name: "Does Not Bleed",
            type: ["automaton", "special", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "persistent",
            xml: `<POWER XMLID="DOESNOTBLEED" ID="1709333885275" BASECOST="15.0" LEVELS="0" ALIAS="Does Not Bleed" POSITION="35" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "DRAIN",
            name: "Drain",
            type: ["adjustment", "attack", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 10,
            xml: `<POWER XMLID="DRAIN" ID="1711933555522" BASECOST="0.0" LEVELS="1" ALIAS="Drain" POSITION="36" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "DUPLICATION",
            name: "Duplication",
            type: ["body-affecting", "special", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0.2,
            xml: `<POWER XMLID="DUPLICATION" ID="1711933622430" BASECOST="0.0" LEVELS="0" ALIAS="Duplication" POSITION="37" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" NUMBER="1" POINTS="0">`,
        },
        {},
    );

    addPower(
        {
            key: "EGOATTACK",
            //name: "Mental Blast",
            type: ["attack", "mental", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 10,
            xml: `<POWER XMLID="EGOATTACK" ID="1709333954550" BASECOST="0.0" LEVELS="1" ALIAS="Mental Blast" POSITION="58" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {
            //name: "Ego Attack",
            xml: `<POWER XMLID="EGOATTACK" ID="1709342586861" BASECOST="0.0" LEVELS="1" ALIAS="Ego Attack" POSITION="17" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
    );
    addPower(
        {
            key: "ENDURANCERESERVE",
            name: "Endurance Reserve",
            type: ["special", "power"],
            behaviors: [],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1 / 4,
            xml: `<POWER XMLID="ENDURANCERESERVE" ID="1709342596431" BASECOST="0.0" LEVELS="0" ALIAS="Endurance Reserve" POSITION="18" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            <NOTES />
            <POWER XMLID="ENDURANCERESERVEREC" ID="1709343272177" BASECOST="0.0" LEVELS="1" ALIAS="Recovery" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
              <NOTES />
            </POWER>`,
        },
        {},
    );
    addPower(
        {
            key: "ENERGYBLAST",
            //name: "Blast",
            type: ["attack", "power"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "standard",
            costPerLevel: 5,
            costEnd: true,
            xml: `<POWER XMLID="ENERGYBLAST" ID="1709333792635" BASECOST="0.0" LEVELS="1" ALIAS="Blast" POSITION="4" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {
            //name: "Energy Blast",
            xml: `<POWER XMLID="ENERGYBLAST" ID="1709342600684" BASECOST="0.0" LEVELS="1" ALIAS="Energy Blast" POSITION="19" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
    );
    addPower(
        {
            key: "ENTANGLE",
            name: "Entangle",
            type: ["attack", "standard", "power"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "standard",
            costPerLevel: 10,
            costEnd: true,
            xml: `<POWER XMLID="ENTANGLE" ID="1709342612255" BASECOST="0.0" LEVELS="1" ALIAS="Entangle" POSITION="21" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "EXTRALIMBS",
            name: "Extra Limbs",
            type: ["standard", "power"],
            behaviors: [],
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0,
            xml: `<POWER XMLID="EXTRALIMBS" ID="1709342614933" BASECOST="5.0" LEVELS="1" ALIAS="Extra Limbs" POSITION="22" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(undefined, {
        key: "FINDWEAKNESS",
        type: ["sense", "special", "skill", "power"],
        behaviors: ["success"],
        costPerLevel: 5,
        xml: `<POWER XMLID="FINDWEAKNESS" ID="1709342622694" BASECOST="10.0" LEVELS="0" ALIAS="Find Weakness" POSITION="25" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SINGLE" OPTIONID="SINGLE" OPTION_ALIAS="Single Attack" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
    });
    addPower(
        {
            key: "FIXEDLOCATION",
            name: "Teleportation: Fixed Location",
            type: ["attack", "sense-affecting", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
            xml: `<POWER XMLID="FIXEDLOCATION" ID="1709334034085" BASECOST="0.0" LEVELS="1" ALIAS="Teleportation: Fixed Location" POSITION="82" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "FLOATINGLOCATION",
            name: "Teleportation: Floating Fixed Location",
            type: ["attack", "sense-affecting", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
            xml: `<POWER XMLID="FLOATINGLOCATION" ID="1709334037026" BASECOST="0.0" LEVELS="1" ALIAS="Teleportation: Floating Fixed Location" POSITION="83" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "FLASH",
            type: ["attack", "sense-affecting", "standard", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "Target’s DCV",
            range: "standard",
            costEnd: true,
            xml: `<POWER XMLID="FLASH" ID="1711933970815" BASECOST="0.0" LEVELS="1" ALIAS="Flash" POSITION="44" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "FLASHDEFENSE",
            type: ["defense", "special", "power"],
            behaviors: ["activatable"],
            name: "Flash Defense",
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
            xml: `<POWER XMLID="FLASHDEFENSE" ID="1711933981614" BASECOST="0.0" LEVELS="1" ALIAS="Flash Defense" POSITION="45" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "FORCEFIELD",
            type: ["defense", "standard", "power"],
            behaviors: ["activatable"],
            name: "Resistant Protection",
            duration: "persistent",
            perceivability: "inobvious",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1.5,
            xml: `<POWER XMLID="FORCEFIELD" ID="1709334003070" BASECOST="0.0" LEVELS="0" ALIAS="Resistant Protection" POSITION="71" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="0" EDLEVELS="0" MDLEVELS="0" POWDLEVELS="0">`,
        },
        {
            //name: "Force Field",
            duration: "constant",
            costEnd: true,
            costPerLevel: 1,
            xml: `<POWER XMLID="FORCEFIELD" ID="1709342634480" BASECOST="0.0" LEVELS="0" ALIAS="Force Field" POSITION="29" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="0" EDLEVELS="0" MDLEVELS="0" POWDLEVELS="0">`,
        },
    );
    addPower(
        {
            key: "FORCEWALL",
            type: ["defense", "standard", "power"],
            behaviors: ["activatable"],
            //name: "Barrier",
            duration: "instant",
            range: "standard",
            costEnd: true,
            costPerLevel: 3,
            xml: `<POWER XMLID="FORCEWALL" ID="1711932416775" BASECOST="3.0" LEVELS="0" ALIAS="Barrier" POSITION="3" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="0" EDLEVELS="0" MDLEVELS="0" POWDLEVELS="0" LENGTHLEVELS="0" HEIGHTLEVELS="0" BODYLEVELS="0" WIDTHLEVELS="0.0">`,
        },
        {
            //name: "Force Wall",
            duration: "constant",
            costPerLevel: 2.5,
            xml: `<POWER XMLID="FORCEWALL" ID="1709342637180" BASECOST="0.0" LEVELS="0" ALIAS="Force Wall" POSITION="30" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes" PDLEVELS="0" EDLEVELS="0" MDLEVELS="0" POWDLEVELS="0" LENGTHLEVELS="0" HEIGHTLEVELS="0" BODYLEVELS="0" WIDTHLEVELS="0.0">`,
        },
    );

    addPower(
        {
            key: "GROWTH",
            name: "Growth",
            type: ["body-affecting", "size", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="GROWTH" ID="1711934263926" BASECOST="25.0" LEVELS="0" ALIAS="Growth" POSITION="47" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="LARGE" OPTIONID="LARGE" OPTION_ALIAS="Large" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "HANDTOHANDATTACK",
            name: "Hand-To-Hand Attack",
            type: ["attack", "power"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "no range",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="HANDTOHANDATTACK" ID="1711934318209" BASECOST="0.0" LEVELS="1" ALIAS="Hand-To-Hand Attack" POSITION="48" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            <NOTES />
            <MODIFIER XMLID="HANDTOHANDATTACK" ID="1711934557552" BASECOST="-0.25" LEVELS="0" ALIAS="Hand-To-Hand Attack" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" COMMENTS="" PRIVATE="No" FORCEALLOW="No">
              <NOTES />
            </MODIFIER>
          </POWER>`,
        },
        {},
    );
    addPower(
        {
            key: "HEALING",
            type: ["adjustment", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "instant",
            target: "target's dcv",
            range: "no range",
            costEnd: true,
            costPerLevel: 10,
            xml: `<POWER XMLID="HEALING" ID="1711934391072" BASECOST="0.0" LEVELS="1" ALIAS="Healing" POSITION="49" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="BODY" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "HKA",
            name: "Hand-To-Hand Killing Attack",
            type: ["attack", "power"],
            behaviors: ["attack", "dice"],
            duration: "instant",
            range: "no range",
            costPerLevel: 15,
            costEnd: true,
            xml: `<POWER XMLID="HKA" ID="1711934431692" BASECOST="0.0" LEVELS="1" ALIAS="Killing Attack - Hand-To-Hand" POSITION="52" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "IMAGES",
            name: "Images",
            type: ["attack", "sense-affecting", "standard", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "obvious",
            duration: "constant",
            target: "area (see text)",
            range: "standard",
            costEnd: true,
            xml: `<POWER XMLID="IMAGES" ID="1711934509070" BASECOST="10.0" LEVELS="0" ALIAS="Images" POSITION="50" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "INVISIBILITY",
            name: "Invisibility",
            type: ["sense-affecting", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "Special",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            xml: `<POWER XMLID="INVISIBILITY" ID="1711934550291" BASECOST="20.0" LEVELS="0" ALIAS="Invisibility" POSITION="51" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "KBRESISTANCE",
            type: ["defense", "standard", "power"],
            behaviors: ["activatable"],
            name: "Knockback Resistance",
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
            xml: `<POWER XMLID="KBRESISTANCE" ID="1709333943639" BASECOST="0.0" LEVELS="1" ALIAS="Knockback Resistance" POSITION="54" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {
            costPerLevel: 2,
        },
    );

    addPower(undefined, {
        key: "LACKOFWEAKNESS",
        type: ["defense", "special", "power"],
        behaviors: ["activatable"],
        name: "Knockback Resistance",
        perceivability: "imperceptible",
        duration: "persistent",
        target: "self only",
        range: "self",
        costEnd: false,
        costPerLevel: 1,
        xml: `<POWER XMLID="LACKOFWEAKNESS" ID="1709342664430" BASECOST="0.0" LEVELS="1" ALIAS="Lack Of Weakness" POSITION="40" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Mental Defense" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
    });
    addPower(
        {
            key: "LIFESUPPORT",
            name: "Life Support",
            type: ["standard", "power"],
            behaviors: ["activatable"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            xml: `<POWER XMLID="LIFESUPPORT" ID="1711934628815" BASECOST="0.0" LEVELS="0" ALIAS="Life Support" POSITION="56" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "LUCK",
            name: "Luck",
            type: ["special", "power"],
            behaviors: ["dice"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 5,
            xml: `<POWER XMLID="LUCK" ID="1709333951260" BASECOST="0.0" LEVELS="1" ALIAS="Luck" POSITION="57" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "MENTALDEFENSE",
            type: ["defense", "special", "power"],
            behaviors: ["activatable"],
            name: "Mental Defense",
            perceivability: "imperceptible",
            target: "self only",
            range: "self",
            costEnd: false,
            duration: "persistent",
            costPerLevel: 1,
            xml: `<POWER XMLID="MENTALDEFENSE" ID="1709333957464" BASECOST="0.0" LEVELS="1" ALIAS="Mental Defense" POSITION="59" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "MENTALILLUSIONS",
            name: "Mental Illusions",
            type: ["attack", "mental", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="MENTALILLUSIONS" ID="1709333959742" BASECOST="0.0" LEVELS="1" ALIAS="Mental Illusions" POSITION="60" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "MINDCONTROL",
            name: "Mind Control",
            type: ["attack", "mental", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="MINDCONTROL" ID="1709333962182" BASECOST="0.0" LEVELS="1" ALIAS="Mind Control" POSITION="61" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "MINDLINK",
            name: "Mind Link",
            type: ["mental", "power"],
            behaviors: ["attack", "activatable", "dice"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "dmcv",
            range: "los",
            costEnd: false,
            costPerLevel: 5,
            xml: `<POWER XMLID="MINDLINK" ID="1709333964463" BASECOST="5.0" LEVELS="0" ALIAS="Mind Link" POSITION="62" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="ONE" OPTIONID="ONE" OPTION_ALIAS="One Specific Mind" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "MINDSCAN",
            type: ["mental", "sense", "power"],
            behaviors: ["attack", "dice"],
            perceivability: "imperceptible",
            duration: "constant",
            target: "dmcv",
            range: "special",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="MINDSCAN" ID="1709333966801" BASECOST="0.0" LEVELS="1" ALIAS="Mind Scan" POSITION="63" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "MISSILEDEFLECTION",
            //name: "Deflection",
            type: ["defense", "standard", "power"],
            behaviors: ["attack", "activatable"],
            perceivability: "inobvious",
            duration: "instant",
            target: "target’s OCV",
            range: "standard",
            costEnd: true,
            xml: `<POWER XMLID="MISSILEDEFLECTION" ID="1709333871556" BASECOST="20.0" LEVELS="0" ALIAS="Deflection" POSITION="30" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {
            //name: "Missile Deflection and Reflection",
            duration: "constant",
            xml: `<POWER XMLID="MISSILEDEFLECTION" ID="1709342687977" BASECOST="5.0" LEVELS="0" ALIAS="Missile Deflection" POSITION="49" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="THROWN" OPTIONID="THROWN" OPTION_ALIAS="Thrown Objects" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
    );
    addPower(
        {
            key: "MULTIFORM",
            type: ["body-affecting", "standard", "power"],
            behaviors: ["activatable"],
            name: "Multiform",
            perceivability: "obvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 0.2,
            xml: `<POWER XMLID="MULTIFORM" ID="1709333969596" BASECOST="0.0" LEVELS="50" ALIAS="Multiform" POSITION="64" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "NAKEDMODIFIER",
            type: ["special", "power"],
            behaviors: [],
            costEnd: true,
            costPerLevel: 1,
            xml: `<POWER XMLID="NAKEDMODIFIER" ID="1709333972540" BASECOST="0.0" LEVELS="1" ALIAS="Naked Advantage" POSITION="65" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "NOHITLOCATIONS",
            name: "No Hit Locations",
            type: ["automaton", "power"],
            behaviors: [],
            costEnd: true,
            costPerLevel: 0,
            xml: `<POWER XMLID="NOHITLOCATIONS" ID="1709333986337" BASECOST="10.0" LEVELS="0" ALIAS="No Hit Locations" POSITION="66" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        undefined,
    );

    addPower(
        {
            key: "POSSESSION",
            type: ["attack", "mental", "power"],
            behaviors: ["attack", "dice"],
            name: "Possession",
            perceivability: "obvious",
            duration: "constant",
            target: "DMCV",
            range: "los",
            costEnd: true,
            costPerLevel: 0.5,
            xml: `<POWER XMLID="POSSESSION" ID="1711934925655" BASECOST="60.0" LEVELS="0" ALIAS="Possession" POSITION="67" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="Human" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">
            <NOTES />
            <ADDER XMLID="MINDCONTROLEFFECT" ID="1711935222251" BASECOST="0.0" LEVELS="0" ALIAS="+0 Points of Mind Control effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="1.0" LVLVAL="2.0" SELECTED="YES">
              <NOTES />
            </ADDER>
            <ADDER XMLID="TELEPATHYEFFECT" ID="1711935222252" BASECOST="0.0" LEVELS="0" ALIAS="+0 Points of Telepathy effect" POSITION="-1" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" SHOWALIAS="Yes" PRIVATE="No" REQUIRED="Yes" INCLUDEINBASE="Yes" DISPLAYINSTRING="No" GROUP="No" LVLCOST="1.0" LVLVAL="2.0" SELECTED="YES">
              <NOTES />
            </ADDER>
          </POWER>`,
        },
        undefined,
    );
    addPower(
        {
            key: "POWERDEFENSE",
            type: ["defense", "special", "power"],
            behaviors: ["activatable"],
            name: "Power Defense",
            perceivability: "inobvious",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
            xml: `<POWER XMLID="POWERDEFENSE" ID="1709333995936" BASECOST="0.0" LEVELS="1" ALIAS="Power Defense" POSITION="68" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "REFLECTION",
            type: ["attack", "standard", "power"],
            behaviors: ["attack", "activatable"],
            perceivability: "imperceptible",
            duration: "instant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 3 / 2,
            xml: `<POWER XMLID="REFLECTION" ID="1709333998486" BASECOST="0.0" LEVELS="1" ALIAS="Reflection" POSITION="69" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        undefined,
    );
    addPower(
        {
            key: "REGENERATION",
            type: ["special", "power"],
            behaviors: ["activatable"],
            perceivability: "imperceptible",
            duration: "persistent",
            target: "self only",
            range: "self",
            costEnd: false,
            xml: `<POWER XMLID="REGENERATION" ID="1709334000761" BASECOST="0.0" LEVELS="1" ALIAS="Regeneration" POSITION="70" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="WEEK" OPTIONID="WEEK" OPTION_ALIAS="Week" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        undefined,
    );
    addPower(
        {
            key: "RKA",
            name: "Ranged Killing Attack",
            type: ["attack", "power"],
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
            xml: `POWER XMLID="RKA" ID="1711934450257" BASECOST="0.0" LEVELS="1" ALIAS="Killing Attack - Ranged" POSITION="53" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="ED" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );

    addPower(
        {
            key: "SHAPESHIFT",
            name: "Shape Shift",
            type: ["body-affecting", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            xml: `<POWER XMLID="SHAPESHIFT" ID="1711935061472" BASECOST="8.0" LEVELS="0" ALIAS="Shape Shift" POSITION="73" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" OPTION="SIGHTGROUP" OPTIONID="SIGHTGROUP" OPTION_ALIAS="Sight Group" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        {},
    );
    addPower(
        {
            key: "SHRINKING",
            name: "Shrinking",
            type: ["body-affecting", "size", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 6,
            xml: `<POWER XMLID="SHRINKING" ID="1709334010424" BASECOST="0.0" LEVELS="1" ALIAS="Shrinking" POSITION="74" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        { costPerLevel: 10 },
    );
    addPower(
        {
            key: "STRETCHING",
            type: ["body-affecting", "standard", "power"],
            behaviors: ["activatable"],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: true,
            costPerLevel: 1,
            xml: `<POWER XMLID="STRETCHING" ID="1709334014434" BASECOST="0.0" LEVELS="1" ALIAS="Stretching" POSITION="75" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
        },
        { costPerLevel: 5 },
    );
    addPower(
        undefined, //BOOST is not a valid 6e XMLID (it is now AID)
        {
            key: "SUCCOR",
            type: ["adjustment", "power"],
            behaviors: ["attack", "dice"],
            duration: "constant",
            target: "target's DCV",
            range: "no range",
            costEnd: true,
            costPerLevel: 5,
            xml: `<POWER XMLID="SUCCOR" ID="1709342717305" BASECOST="0.0" LEVELS="5" ALIAS="Succor" POSITION="60" MULTIPLIER="1.0" GRAPHIC="Burst" COLOR="255 255 255" SFX="Default" SHOW_ACTIVE_COST="Yes" INCLUDE_NOTES_IN_PRINTOUT="Yes" NAME="" INPUT="END" USESTANDARDEFFECT="No" QUANTITY="1" AFFECTS_PRIMARY="No" AFFECTS_TOTAL="Yes">`,
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
