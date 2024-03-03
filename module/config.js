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

HERO.combatManeuvers = {
    // Maneuver : [phase, OCV, DCV, Effects, Attack]
    Block: ["1/2", "+0", "+0", "Blocks HTH attacks, Abort", true],
    Brace: ["0", "+2", "1/2", "+2 OCV only to offset the Range Modifier"],
    Disarm: [
        "1/2",
        "-2",
        "+0",
        "Disarm target, requires STR vs. STR Roll",
        true,
    ],
    Dodge: ["1/2", "--", "+3", "Dodge all attacks, Abort", true],
    Grab: [
        "1/2",
        "-1",
        "-2",
        "Grab Two Limbs; can Squeeze, Slam, or Throw",
        true,
    ],
    "Grab By": [
        "1/2 †",
        "-3",
        "-4",
        "Move and Grab object, +(v/10) to STR",
        true,
    ],
    Haymaker: ["1/2*", "+0", "-5", "+4 Damage Classes to any attack"],
    "Move By": [
        "1/2 †",
        "-2",
        "-2",
        "((STR/2) + (v/10))d6; attacker takes 1/3 damage",
        true,
    ],
    "Move Through": [
        "1/2 †",
        "-v/10",
        "-3",
        "(STR + (v/6))d6; attacker takes 1/2 or full damage",
        true,
    ],
    //"Multiple Attack": ["1", "var", "1/2", "Attack one or more targets multiple times"],
    Set: [
        "1",
        "+1",
        "+0",
        "Take extra time to aim a Ranged attack at a target",
    ],
    Shove: ["1/2", "-1", "-1", "Push target back 1m per 5 STR used", true],
    Strike: ["1/2", "+0", "+0", "STR damage or by weapon type", true],
    Throw: [
        "1/2",
        "+0",
        "+0",
        "Throw object or character, does STR damage",
        true,
    ],
    Trip: [
        "1/2",
        "-1",
        "-2",
        "Knock a target to the ground, making him Prone",
        true,
    ],
    //"Other Attacks": ["1/2", "+0", "+0", ""],
};

HERO.combatManeuversOptional = {
    // Maneuver : [phase, OCV, DCV, Effects]
    Choke: ["1/2", "-2", "-2", "NND 1d6, Grab One Limb"],
    "Club Weapon": [
        "1/2",
        "+0",
        "+0",
        "Killing weapon does equivalent Normal Damage",
    ],
    Cover: ["1/2", "-2", "+0", "Target held at gunpoint"],
    "Dive For Cover": ["1/2", "+0", "+0", "Character avoids attack; Abort"],
    Hipshot: ["1/2", "-1", "+0", "+1", "DEX only for purposes of initiative"],
    "Pulling A Punch": [
        "1/2",
        "-1/5d6",
        "+0",
        "Strike, normal STUN damage, 1/2 BODY damage",
    ],
    "Roll With A Punch": [
        "1/2",
        "-2",
        "-2",
        "Block after being hit, take 1/2 damage; Abort",
    ],
    "Snap Shot": ["1", "-1", "+0", "Lets character duck back behind cover"],
    Strafe: ["1/2 †", "-v/6", "-2", "Make Ranged attack while moving"],
    "Suppression Fire": [
        "1/2",
        "-2",
        "+0",
        "Continuous fire through an area, must be Autofire",
    ],
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

HERO.powers6e = [];
HERO.powers5e = [];

/**
 * @typedef {Object} PowerDescription
 * @param {string} key - Hero Designer XMLID of the power
 * @param {string} name - Human readable name of the power
 * @param {string} base - Base cost in character points
 * @param {string} cost - Cost in character points per additional level
 * @param {Array<string>} type - A list of types associated with this power
 *
 * @param {"constant"|"instant"|"persistent"} duration - The lower case duration of the power
 * @param {boolean} [costEnd] - If the power costs endurance to use. true if it does, false or undefined if it doesn't
 * @param {}
 */

/**
 *
 * @param {PowerDescription} powerDescription6e
 * @param {PowerDescription} [powerOverrideFor5e]
 */
function addPower(powerDescription6e, powerOverrideFor5e) {
    if (powerDescription6e) {
        HERO.powers6e.push(powerDescription6e);
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
        ignoreFor: ["vehicle", "base2", "computer", "ai", "6e"],
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
        onlyFor: ["base2", "vehicle"],
    });

    addPower(
        {
            key: "SIZE",
            name: "Vehicle Size",
            type: ["characteristic"],
            behaviors: [],
            duration: "persistent",
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
        },
        {},
    );
})();

(function addMovementToPowerList() {
    addPower(
        {
            key: "EXTRADIMENSIONALMOVEMENT",
            type: ["movement"],
            behaviors: [],
            name: "Extra-Dimensional Movement",
            perceivability: "Inobvious",
            duration: "instant",
            target: "Self Only",
            range: "Self",
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
            behaviors: [],
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
            behaviors: [],
            costEnd: false,
            costPerLevel: 2,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {},
    );

    addPower(undefined, {
        key: "GLIDING",
        type: ["movement"],
        behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
        },
        {},
    );
    addPower(
        {
            key: "ACTING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "ANALYZE",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "ANIMAL_HANDLER",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );
    addPower(undefined, {
        key: "ARMORSMITH",
        type: ["skill"],
        behaviors: ["success"],
        categorized: true,
    });
    addPower(
        {
            key: "AUTOFIRE_SKILLS",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "BREAKFALL",
            type: ["skill"],
            behaviors: ["success"],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "BRIBERY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "BUGGING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "BUREAUCRATICS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "CHARM",
            type: ["skill"],
            behaviors: ["success"],
        },
        undefined,
    );
    addPower(
        {
            key: "CLIMBING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_DRIVING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_LEVELS",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_PILOTING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "COMPUTER_PROGRAMMING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CONCEALMENT",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CONTORTIONIST",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CONVERSATION",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CRAMMING",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "CRIMINOLOGY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CRYPTOGRAPHY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMSKILL",
            type: ["skill"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "DEDUCTION",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "DEFENSE_MANEUVER",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "DEMOLITIONS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "DISGUISE",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "ELECTRONICS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "FAST_DRAW",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(undefined, {
        key: "FEINT",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "FORENSIC_MEDICINE",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "FORGERY",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "GAMBLING",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "HIGH_SOCIETY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(undefined, {
        key: "HOIST",
        type: ["skill"],
        behaviors: ["success"],
    });

    addPower(undefined, {
        key: "INSTRUCTOR",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "INTERROGATION",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "INVENTOR",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "KNOWLEDGE_SKILL",
            type: ["skill"],
            behaviors: [],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "LANGUAGES",
            type: ["skill"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "LIPREADING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "LOCKPICKING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    // TODO: Martial arts?
    addPower(
        {
            key: "MECHANICS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "MENTAL_COMBAT_LEVELS",
            type: ["skill"],
            behaviors: [],
        },
        undefined,
    );
    addPower(
        {
            key: "MIMICRY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "MIF",
            type: ["skill"],
            behaviors: [],
            name: "Musical Instrument Familiarity",
        },
        {},
    );

    addPower(
        {
            key: "NAVIGATION",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "ORATORY",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(undefined, {
        key: "PARACHUTING",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "PARAMEDICS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "PENALTY_SKILL_LEVELS",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "PERSUASION",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "POISONING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "POWERSKILL",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "PROFESSIONAL_SKILL",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "RAPID_ATTACK_HTH",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(undefined, {
        key: "RAPID_ATTACK_RANGED",
        type: ["skill"],
        behaviors: [],
    });
    addPower(undefined, {
        key: "RESEARCH",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "RIDING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "SCIENCE_SKILL",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "SECURITY_SYSTEMS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(undefined, {
        key: "SEDUCTION",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "SHADOWING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "SKILL_LEVELS",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "SLEIGHT_OF_HAND",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(undefined, {
        key: "SPELL",
        type: ["skill"],
        behaviors: ["success"],
    });
    addPower(
        {
            key: "STEALTH",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "STREETWISE",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "SURVIVAL",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );
    addPower(
        {
            key: "SYSTEMS_OPERATION",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "TACTICS",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "TEAMWORK",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "TRACKING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "TRADING",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );
    addPower(
        {
            key: "TRANSPORT_FAMILIARITY",
            type: ["skill"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "TWO_WEAPON_FIGHTING_HTH",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(undefined, {
        key: "TWO_WEAPON_FIGHTING_RANGED",
        type: ["skill"],
        behaviors: [],
    });

    addPower(
        {
            key: "VENTRILOQUISM",
            type: ["skill"],
            behaviors: ["success"],
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_FAMILIARITY",
            type: ["skill"],
            behaviors: [],
        },
        {},
    );
    addPower(
        {
            key: "WEAPONSMITH",
            type: ["skill"],
            behaviors: ["success"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "JACK_OF_ALL_TRADES",
            type: ["skill", "enhancer"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "LINGUIST",
            type: ["skill", "enhancer"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "SCHOLAR",
            type: ["skill", "enhancer"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "SCIENTIST",
            type: ["skill", "enhancer"],
            behaviors: [],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "TRAVELER",
            type: ["skill", "enhancer"],
            behaviors: [],
            rollable: false,
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
        },
        {},
    );

    addPower(
        {
            key: "DIFFERINGMODIFIER",
            name: "Differing Modifier",
            type: ["framework"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "ELEMENTAL_CONTROL",
            type: ["framework"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "LIST",
            type: ["framework"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "MULTIPOWER",
            type: ["framework"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "VPP",
            type: ["framework"],
            behaviors: [],
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
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "Advanced Tech",
        type: ["perk"],
        behaviors: [],
        name: "Advanced Tech",
    });
    addPower(
        {
            key: "ANONYMITY",
            type: ["perk"],
            behaviors: [],
            name: "Anonymity",
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
            costPerLevel: 1,
        },
        {},
    );

    addPower(undefined, {
        key: "FALSEIDENTITY",
        type: ["perk"],
        behaviors: [],
        name: "False Identity",
        costPerLevel: 1,
    });
    addPower(
        {
            key: "FAVOR",
            type: ["perk"],
            behaviors: [],
            name: "Favor",
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
        },
        {},
    );
    addPower(
        {
            key: "FRINGE_BENEFIT",
            type: ["perk"],
            behaviors: [],
            name: "Fringe Benefit",
        },
        {},
    );

    addPower(
        {
            key: "MONEY",
            type: ["perk"],
            behaviors: [],
            name: "Money",
        },
        {},
    );

    addPower(
        {
            key: "REPUTATION",
            type: ["perk", "disadvantage"],
            behaviors: ["success"],
            name: "Positive Reputation",
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
        },
        {},
    );

    addPower(
        {
            key: "VEHICLE_BASE",
            type: ["perk"],
            behaviors: [],
            name: "Vehicles & Bases",
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
        },
        {},
    );
    addPower(
        {
            key: "ABSOLUTE_TIME_SENSE",
            type: ["talent"],
            behaviors: [],
            name: "Absolute Time Sense",
        },
        {},
    );
    addPower(
        {
            key: "AMBIDEXTERITY",
            type: ["talent"],
            behaviors: [],
            name: "Ambidexterity",
        },
        {},
    );
    addPower(
        {
            key: "ANIMALFRIENDSHIP",
            type: ["talent"],
            behaviors: [],
            name: "Animal Friendship",
        },
        {},
    );

    addPower(undefined, {
        key: "BEASTSPEECH",
        type: ["talent"],
        behaviors: [],
        name: "Beast Speech",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "BERSERKFURY",
        type: ["talent"],
        behaviors: [],
        name: "Berserk Fury",
        costPerLevel: 0,
    });
    addPower(
        {
            key: "BUMP_OF_DIRECTION",
            type: ["talent"],
            behaviors: [],
            name: "Bump of Direction",
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "COMBATARCHERY",
        type: ["talent"],
        behaviors: [],
        name: "Combat Archery",
    });
    addPower(
        {
            key: "COMBAT_LUCK",
            type: ["talent", "defense"], // TODO: Not type defense but has enabled role perhaps...
            behaviors: [],
            name: "Combat Luck",

            duration: "constant",
            costPerLevel: 6,
        },
        {},
    );
    addPower(undefined, {
        key: "COMBATREADY",
        type: ["talent"],
        behaviors: [],
        name: "Combat Ready",
    });
    addPower(
        {
            key: "COMBAT_SENSE",
            type: ["talent"],
            behaviors: ["success"],
            name: "Combat Sense",
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "COMBATSHOOTING",
        type: ["talent"],
        behaviors: [],
        name: "Combat Shooting",
    });
    addPower(undefined, {
        key: "COMBATSPELLCASTING",
        type: ["talent"],
        behaviors: [],
        name: "Combat Spellcasting",
    });
    addPower(undefined, {
        key: "CRIPPLINGBLOW",
        type: ["talent"],
        behaviors: [],
        name: "Crippling Blow",
    });
    addPower(
        {
            key: "CUSTOMTALENT",
            type: ["talent"],
            behaviors: [],
            name: "Custom Talent",
        },
        {},
    );

    addPower(
        {
            key: "DANGER_SENSE",
            type: ["talent"],
            behaviors: ["success"],
            name: "Danger Sense",
        },
        {},
    );
    addPower(
        {
            key: "DEADLYBLOW",
            type: ["talent"],
            behaviors: [],
            name: "Deadly Blow",
        },
        {},
    );
    addPower(
        {
            key: "DIVINEFAVOR",
            type: ["talent"],
            behaviors: [],
            name: "Divine Favor",
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
            costPerLevel: 0,
        },
        {},
    );
    addPower(undefined, {
        key: "EVASIVE",
        type: ["talent"],
        behaviors: [],
        name: "Evasive",
        costPerLevel: 0,
    });

    addPower(undefined, {
        key: "FTLPILOT",
        type: ["talent"],
        behaviors: [],
        name: "FTL Pilot",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "FASCINATION",
        type: ["talent"],
        behaviors: [],
        name: "Fascination",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "FEARLESS",
        type: ["talent"],
        behaviors: [],
        name: "Fearless",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "FOLLOWTHROUGHATTACK",
        type: ["talent"],
        behaviors: [],
        name: "Follow Through Attack",
        costPerLevel: 0,
    });

    addPower(undefined, {
        key: "HOTSHOTPILOT",
        type: ["talent"],
        behaviors: [],
        name: "Hotshot Pilot",
        costPerLevel: 0,
    });

    addPower(undefined, {
        key: "INSPIRE",
        type: ["talent"],
        behaviors: [],
        name: "Inspire",
        costPerLevel: 0,
    });

    addPower(
        {
            key: "LATENTPSIONIC",
            type: ["talent"],
            behaviors: [],
            name: "Latent Psionic",
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
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "MAGESIGHT",
        type: ["talent"],
        behaviors: [],
        name: "Mage Sight",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "MOUNTEDWARRIOR",
        type: ["talent"],
        behaviors: [],
        name: "Mounted Warrior",
        costPerLevel: 0,
    });

    addPower(
        {
            key: "PERFECT_PITCH",
            type: ["talent"],
            behaviors: [],
            name: "Perfect Pitch",
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
            costPerLevel: 0,
        },
        {},
    );

    addPower(undefined, {
        key: "RAPIDARCHERY",
        type: ["talent"],
        behaviors: [],
        name: "Rapid Archery",
        costPerLevel: 1,
    });
    addPower(undefined, {
        key: "RAPIDHEALING",
        type: ["talent"],
        behaviors: [],
        name: "Rapid Healing",
        costPerLevel: 1,
    });
    addPower(
        {
            key: "RESISTANCE",
            type: ["talent"],
            behaviors: [],
            name: "Resistance",
            costPerLevel: 1,
        },
        {},
    );

    addPower(undefined, {
        key: "SHAPECHANGING",
        type: ["talent"],
        behaviors: [],
        name: "Shapechanging",
        costPerLevel: 0,
    });
    addPower(
        {
            key: "SIMULATE_DEATH",
            type: ["talent"],
            behaviors: [],
            name: "Simulate Death",
            costPerLevel: 1,
        },
        {},
    );
    addPower(undefined, {
        key: "SKILLMASTER",
        type: ["talent"],
        behaviors: [],
        name: "Skill Master",
        costPerLevel: 1,
    });
    addPower(
        {
            key: "SPEED_READING",
            type: ["talent"],
            behaviors: [],
            name: "Speed Reading",
            costPerLevel: 2,
        },
        {},
    );
    addPower(undefined, {
        key: "SPELLAUGMENTATION",
        type: ["talent"],
        behaviors: [],
        name: "Spell Augmentation",
        costPerLevel: 2,
    });
    addPower(
        {
            key: "STRIKING_APPEARANCE",
            type: ["talent"],
            behaviors: [],
            name: "Striking Appearance",
            costPerLevel: 3,
        },
        undefined,
    );

    addPower(undefined, {
        key: "TRACKLESSSTRIDE",
        type: ["talent"],
        behaviors: [],
        name: "Trackless Stride",
        costPerLevel: 0,
    });
    addPower(undefined, {
        key: "TURNUNDEAD",
        type: ["talent"],
        behaviors: [],
        name: "Turn Undead",
        costPerLevel: 0,
    });

    addPower(
        {
            key: "UNIVERSAL_TRANSLATOR",
            type: ["talent"],
            behaviors: [],
            name: "Universal Translator",
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
            type: ["adjustment", "standard", "defense"], // TODO: Not defense type but needs can be enabled role
            behaviors: [],
            perceivability: "obvious",
            duration: "constant",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1,
        },
        {
            type: ["adjustment", "attack", "defense"], // TODO: Not defense type but needs can be enabled role
            costPerLevel: 5,
        },
    );
    addPower(
        {
            key: "AID",
            name: "Aid",
            type: ["adjustment", "attack"],
            behaviors: ["attack"],
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
            behaviors: [],
            duration: "Persistent",
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
            perceivability: "Inobvious",
            duration: "Persistent",
            target: "Self Only",
            range: "Self",
            costEnd: false,
        },
        {},
    );

    addPower(
        {
            key: "CHANGEENVIRONMENT",
            name: "Change Environment",
            type: ["attack"],
            behaviors: ["attack"],
            perceivability: "Obvious",
            duration: "Constant",
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
            range: "standard",
        },
        {},
    );
    addPower(
        {
            key: "CLINGING",
            name: "Clinging",
            type: ["standard"],
            behaviors: [],
            costEnd: false,
            costPerLevel: 1 / 3,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMPOWER",
            name: "Custom Power",
            type: ["custom"],
            behaviors: [],
        },
        {},
    );

    addPower(
        {
            key: "DAMAGENEGATION",
            name: "Damage Negation",
            type: ["defense", "special"],
            behaviors: [],
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
        undefined,
        {
            key: "DAMAGERESISTANCE",
            name: "Damage Resistance",
            type: ["defense"],
            behaviors: [],
            //perceivability: "obvious",
            duration: "instant",
            target: "Self Only",
            range: "Self",
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
            type: ["body-affecting", "standard", "defense"], // TODO: needs on off role
            behaviors: [],
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
            type: ["body-affecting", "standard"], // TODO: Needs on off role
            behaviors: [],
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "DISPEL",
            name: "Dispel",
            type: ["adjustment", "attack"],
            behaviors: ["attack"],
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
            behaviors: [],
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
            behaviors: ["attack"],
            perceivability: "obvious",
            duration: "instant",
            target: "target’s DCV",
            range: "standard",
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
            behaviors: [],
            perceivability: "Obvious",
            duration: "persistent",
            target: "Self Only",
            range: "Self",
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
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: ["attack"],
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
            behaviors: [],
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
            behaviors: [],
            name: "Resistant Protection",
            duration: "Persistent",
            perceivability: "inobvious",
            target: "self only",
            range: "self",
            costEnd: false,
            costPerLevel: 1.5,
        },
        {
            name: "Force Field",
            duration: "Constant",
            costEnd: true,
            costPerLevel: 1,
        },
    );
    addPower(
        {
            key: "FORCEWALL",
            type: ["defense", "standard"],
            behaviors: [],
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
            type: ["body-affecting", "defense", "size"], // TODO: Not defense type
            behaviors: [],
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
            behaviors: ["attack"],
            range: "no range",
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "HEALING",
            type: ["adjustment", "attack"], // TODO: Not attack type ... but needs attack role
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            type: ["sense-affecting", "defense"],
            behaviors: [],
            perceivability: "Special",
            duration: "Constant",
            target: "Self Only",
            range: "Self",
            costEnd: true,
        },
        {},
    );

    addPower(
        {
            key: "KBRESISTANCE",
            type: ["defense", "standard"],
            behaviors: [],
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
        behaviors: [],
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
            behaviors: [],
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
            behaviors: ["roll"],
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
            behaviors: [],
            name: "Mental Defense",
            perceivability: "Imperceptible",
            target: "self only",
            range: "self",
            costEnd: false,
            duration: "Persistent",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "MENTALILLUSIONS",
            name: "Mental Illusions",
            type: ["attack", "mental"],
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            type: ["attack", "mental", "sense"], // TODO: Not attack but dice role
            behaviors: ["attack"],
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
            behaviors: ["attack"],
            perceivability: "Inobvious",
            duration: "instant",
            target: "Target’s OCV", // TODO: Do we need to repeat "Target's..."?
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
            behaviors: [],
            name: "Multiform",
            perceivability: "Obvious",
            duration: "persistent",
            target: "Self Only",
            range: "Self",
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
            //"duration": "instant",  // TODO: Not true, hack for isPerceivable
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
            behaviors: ["attack"],
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
            behaviors: [],
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

    // {
    // TODO: Do we need it in the system or not?
    //     key: "naturalBodyHealing",
    // },

    addPower(
        {
            key: "REFLECTION",
            type: ["attack", "standard"],
            behaviors: ["attack"],
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
            behaviors: [],
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
            behaviors: ["attack"],
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
            behaviors: [],
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
            behaviors: [],
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
            behaviors: [],
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
            type: ["adjustment", "attack"], // TODO: Should not be attack type
            behaviors: [],
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
            behaviors: [],
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
        behaviors: ["attack"],
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
            behaviors: ["attack"],
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
            behaviors: ["attack"],
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
        type: ["adjustment", "attack"],
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

(function addMartial() {
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
            // TODO: Needed?
            key: "MANEUVER",
            type: ["martial", "attack"],
            behaviors: ["attack"],
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
})();

// TODO: Not sure if these should be added as powers. They are something else.
(function addSenseStuff() {
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
            key: "ENHANCEDPERCEPTION",
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
            key: "NIGHTVISION",
            behaviors: [],
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "PENETRATIVE",
            behaviors: [],
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "TARGETINGSENSE",
            behaviors: [],
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "TRACKINGSENSE",
            behaviors: [],
            type: ["sense"],
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
            behaviors: [],
            name: "Susceptibility",
        },
        {},
    );

    addPower(
        {
            key: "UNLUCK",
            type: ["disadvantage"],
            behaviors: ["roll"],
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
