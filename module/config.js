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
            duration: "persistent",
            ignoreFor: ["vehicle", "base2", "computer", "ai"],
        },
        {},
    );
    addPower(undefined, {
        key: "COM",
        name: "Comeliness",
        type: ["characteristic"],
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
            duration: "persistent",
            onlyFor: ["base2"],
        },
        {},
    );

    addPower(
        {
            key: "DEF",
            name: "Defense",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["base2", "vehicle"],
        },
        {},
    );
    addPower(
        {
            key: "SIZE",
            name: "Vehicle Size",
            type: ["characteristic"],
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
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM2",
            name: "Custom Characteristic 2",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM3",
            name: "Custom Characteristic 3",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM4",
            name: "Custom Characteristic 4",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM5",
            name: "Custom Characteristic 5",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM6",
            name: "Custom Characteristic 6",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM7",
            name: "Custom Characteristic 7",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM8",
            name: "Custom Characteristic 8",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM9",
            name: "Custom Characteristic 9",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOM10",
            name: "Custom Characteristic 10",
            type: ["characteristic"],
            duration: "persistent",
            onlyFor: ["automaton", "vehicle", "base2"],
        },
        {},
    );
})();

(function addMovementToPowerList() {
    addPower(
        {
            key: "EXTRADIMENSIONALMOVEMENT",
            type: ["movement"],
            name: "Extra-Dimensional Movement",
            perceivability: "Inobvious",
            duration: "instant",
            target: "Self Only",
            range: "Self",
            costEnd: true,
            costPerLevel: 20,
            // "ignoreFor": [
            //     "base2",
            //     "computer",
            //     "ai"
            // ],
            onlyFor: ["none"], // TODO: Hmm.
        },
        {},
    );
    addPower(
        {
            key: "FLIGHT",
            type: ["movement"],
            costEnd: true,
            costPerLevel: 1,
            ignoreFor: ["base2", "computer", "ai"],
        },
        {
            key: "FLIGHT",
            costPerLevel: 2,
        },
    );
    addPower(undefined, {
        key: "GLIDING",
        type: ["movement"],
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
        },
        {},
    );
    addPower(
        {
            key: "ACTING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "ANALYZE",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "ANIMAL_HANDLER",
            type: ["skill"],
            categorized: true,
        },
        {},
    );
    addPower(
        {
            key: "AUTOFIRE_SKILLS",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "BREAKFALL",
            type: ["skill"],
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "BRIBERY",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "BUGGING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "BUREAUCRATICS",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "CHARM",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CLIMBING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_DRIVING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_PILOTING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_LEVELS",
            type: ["skill"],
            rollable: false, // TODO: Hmmm.
            xmlid: "COMBAT_LEVELS", // TODO: Do we need this?
        },
        {},
    );
    addPower(
        {
            key: "COMPUTER_PROGRAMMING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CONCEALMENT",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CONTORTIONIST",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CONVERSATION",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CRAMMING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CRIMINOLOGY",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CRYPTOGRAPHY",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMSKILL",
            type: ["skill"],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "DEDUCTION",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "DEFENSE_MANEUVER",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "DEMOLITIONS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "DISGUISE",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "ELECTRONICS",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "FAST_DRAW",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "FORENSIC_MEDICINE",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "FORGERY",
            type: ["skill"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "GAMBLING",
            type: ["skill"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "HIGH_SOCIETY",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "INTERROGATION",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "INVENTOR",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "KNOWLEDGE_SKILL",
            type: ["skill"],
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "LANGUAGES",
            type: ["skill"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "LIPREADING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "LOCKPICKING",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "MECHANICS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "MENTAL_COMBAT_LEVELS",
            type: ["skill"],
            rollable: false,
            xmlid: "MENTAL_COMBAT_LEVELS", // TODO: Hmmm.
        },
        {},
    );
    addPower(
        {
            key: "MIMICRY",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "NAVIGATION",
            type: ["skill"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "ORATORY",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "PARAMEDICS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "PENALTY_SKILL_LEVELS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "PERSUASION",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "POWERSKILL",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "PROFESSIONAL_SKILL",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "RAPID_ATTACK_HTH",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "RIDING",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "SCIENCE_SKILL",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "SECURITY_SYSTEMS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "SHADOWING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "SKILL_LEVELS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "SLEIGHT_OF_HAND",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "STEALTH",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "STREETWISE",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "SURVIVAL",
            type: ["skill"],
            categorized: true,
        },
        {},
    );
    addPower(
        {
            key: "SYSTEMS_OPERATION",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "TACTICS",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "TEAMWORK",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "TRACKING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "TRADING",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "TRANSPORT_FAMILIARITY",
            type: ["skill"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "TWO_WEAPON_FIGHTING_HTH",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "VENTRILOQUISM",
            type: ["skill"],
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_FAMILIARITY",
            type: ["skill"],
        },
        {},
    );
    addPower(
        {
            key: "WEAPONSMITH",
            type: ["skill"],
            categorized: true,
        },
        {},
    );

    addPower(
        {
            key: "JACK_OF_ALL_TRADES",
            type: ["skill", "enhancer"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "LINGUIST",
            type: ["skill", "enhancer"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "SCHOLAR",
            type: ["skill", "enhancer"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "SCIENTIST",
            type: ["skill", "enhancer"],
            rollable: false,
        },
        {},
    );
    addPower(
        {
            key: "TRAVELER",
            type: ["skill", "enhancer"],
            rollable: false,
        },
        {},
    );
})();

(function addFrameworksToPowerList() {
    addPower(
        {
            key: "LIST",
            type: ["framework"],
        },
        {},
    );
    addPower(
        {
            key: "VPP",
            type: ["framework"],
        },
        {},
    );
    addPower(
        {
            key: "ELEMENTAL_CONTROL",
            type: ["framework"],
        },
        {},
    );
    addPower(
        {
            key: "MULTIPOWER",
            type: ["framework"],
        },
        {},
    );
    addPower(
        {
            key: "COMPOUNDPOWER",
            type: ["compound"],
        },
        {},
    );
})();

(function addTalentsToPowerList() {
    addPower(
        {
            key: "ABSOLUTE_RANGE_SENSE",
            type: ["talent"],
            name: "Absolute Range Sense",
        },
        {},
    );
    addPower(
        {
            key: "ABSOLUTE_TIME_SENSE",
            type: ["talent"],
            name: "Absolute Time Sense",
        },
        {},
    );
    addPower(
        {
            key: "AMBIDEXTERITY",
            type: ["talent"],
            name: "Ambidexterity",
        },
        {},
    );
    addPower(
        {
            key: "ANIMALFRIENDSHIP",
            type: ["talent"],
            name: "Animal Friendship",
        },
        {},
    );

    addPower(
        {
            key: "BUMP_OF_DIRECTION",
            type: ["talent"],
            name: "Bump of Direction",
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "COMBAT_LUCK",
            type: ["talent", "defense"], // TODO: Not type defense but has enabled role perhaps...
            name: "Combat Luck",

            duration: "constant",
            costPerLevel: 6,
        },
        {},
    );
    addPower(
        {
            key: "COMBAT_SENSE",
            type: ["talent"],
            name: "Combat Sense",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMTALENT",
            type: ["talent"],
            name: "Custom Talent",
        },
        {},
    );

    addPower(
        {
            key: "DANGER_SENSE",
            type: ["talent"],
            name: "Danger Sense",
        },
        {},
    );
    addPower(
        {
            key: "DEADLYBLOW",
            type: ["talent"],
            name: "Deadly Blow",
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "DOUBLE_JOINTED",
            type: ["talent"],
            name: "Double Jointed",
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "EIDETIC_MEMORY",
            type: ["talent"],
            name: "Eidetic Memory",
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "ENVIRONMENTAL_MOVEMENT",
            type: ["talent"],
            name: "Environmental Movement",
            costPerLevel: 0,
        },
        {},
    );

    // TODO: Doesn't exist in 6e
    addPower(
        {
            key: "FOLLOWER",
            type: ["talent"],
            name: "Follower",
        },
        {},
    );

    addPower(
        {
            key: "LIGHTNING_CALCULATOR",
            type: ["talent"],
            name: "Lightning Calculator",
            costPerLevel: 0,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTNING_REFLEXES_ALL",
            type: ["talent"],
            name: "Lightning Reflexes",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTNING_REFLEXES_SINGLE", // TODO: Really? 2 entries?
            type: ["talent"],
            name: "Lightning Reflexes",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "LIGHTSLEEP",
            type: ["talent"],
            name: "Lightsleep",
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "PERFECT_PITCH",
            type: ["talent"],
            name: "Perfect Pitch",
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "OFFHANDDEFENSE",
            type: ["talent"],
            name: "Off-Hand Defense",
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "RESISTANCE",
            type: ["talent"],
            name: "Resistance",
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "SIMULATE_DEATH",
            type: ["talent"],
            name: "Simulate Death",
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "SPEED_READING",
            type: ["talent"],
            name: "Speed Reading",
            costPerLevel: 2,
        },
        {},
    );
    addPower(
        {
            key: "STRIKING_APPEARANCE",
            type: ["talent"],
            name: "Striking Appearance",
            costPerLevel: 3,
        },
        {},
    );

    addPower(
        {
            key: "UNIVERSAL_TRANSLATOR",
            type: ["talent"],
            name: "Universal Translator",
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "WEAPON_MASTER",
            type: ["talent"],
            name: "Weapon Master",
            costPerLevel: 0,
        },
        {},
    );
})();

(function addPerksToPowerList() {
    // TODO: Missing a few....
    addPower(
        {
            key: "CONTACT",
            type: ["perk"],
            name: "Contact",
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "REPUTATION",
            type: ["perk", "disadvantage"],
            name: "Positive Reputation",
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
            type: ["defense"],
            name: "Resistant Protection",
            duration: "Persistent",
            costPerLevel: 3 / 2,
        },
        {},
    );
    addPower(
        {
            key: "AUTOMATON", //CANNOT BE STUNNED
            type: ["automaton", "special"],
            name: "Automaton",
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
            perceivability: "Obvious",
            duration: "Constant",
            target: "Target’s DCV",
            range: "Standard",
            costEnd: true,
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "CLAIRSENTIENCE",
            type: ["sense"],
            range: "standard",
        },
        {},
    );
    addPower(
        {
            key: "CLINGING",
            name: "Clinging",
            type: ["standard"],
            costEnd: false,
            costPerLevel: 1 / 3,
        },
        {},
    );
    addPower(
        {
            key: "CUSTOMPOWER",
            type: ["custom"],
        },
        {},
    );

    addPower(
        {
            key: "DAMAGENEGATION",
            type: ["defense", "special"],
            name: "Damage Negation",
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
            key: "DAMAGEREDUCTION",
            type: ["defense", "standard"],
            name: "Damage Reduction",
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
            type: ["sense-affecting", "attack", "standard"],
            duration: "constant",
            range: "standard",
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "DEFLECTION",
            name: "Deflection",
            type: ["defense", "standard"],
            perceivability: "Inobvious",
            duration: "instant",
            target: "Target’s OCV (see text)",
            range: "Standard",
            costEnd: true,
            //"cost": 20,
        },
        {},
    );
    addPower(
        {
            key: "DENSITYINCREASE",
            name: "Density Increase",
            type: ["body-affecting", "standard", "defense"], // TODO: needs on off role
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
            type: ["body-affecting", "standard"], // TODO: Needs on off role
            name: "Desolidification",
        },
        {},
    );
    addPower(
        {
            key: "DISPEL",
            name: "Dispel",
            type: ["adjustment", "attack"],
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
            key: "DRAIN",
            name: "Drain",
            type: ["adjustment", "attack"],
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
            type: ["BodyAffecting", "special"],
            name: "Duplication",
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
            perceivability: "imperceptible",
            duration: "instant",
            target: "dmcv",
            range: "los",
            costEnd: true,
            costPerLevel: 10,
        },
        {},
    );
    addPower(
        {
            key: "ENDURANCERESERVE",
            name: "Endurance Reserve",
            type: ["special"],
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
            type: ["attack"],
            range: "standard",
            costPerLevel: 5,
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "ENTANGLE",
            type: ["attack", "standard"],
            range: "standard",
            costPerLevel: 10,
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "EXTRALIMBS",
            type: ["standard"],
            costPerLevel: 0,
        },
        {},
    );

    addPower(
        {
            key: "FINDWEAKNESS",
            type: ["sense", "special", "skill"],
        },
        {},
    );
    addPower(
        {
            key: "FLASH",
            type: ["attack", "sense-affecting", "standard"],
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
            type: ["defense"],
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
    addPower(undefined, {
        key: "FORCEWALL",
        type: ["defense"],
        name: "Barrier",
        duration: "instant",
        range: "standard",
        costEnd: true,
        costPerLevel: 1.5,
    });

    addPower(
        {
            key: "GROWTH",
            name: "Growth",
            type: ["body-affecting", "defense", "size"],
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
            type: ["attack"],
            range: "no range",
            costPerLevel: 5,
        },
        {},
    );
    addPower(
        {
            key: "HKA",
            type: ["attack"],
            range: "no range",
            costPerLevel: 15,
            costEnd: true,
        },
        {},
    );
    addPower(
        {
            key: "HEALING",
            type: ["adjustment", "attack"], // TODO: Not attack type ... but needs attack role
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
            key: "IMAGES",
            name: "Images",
            type: ["attack", "sense-affecting", "standard"],
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
            type: ["attack", "mental"], // TODO: Not attack but dice role
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
            type: ["attack", "mental"], // TODO: Not attack but dice role
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
            type: ["attack", "mental"], // TODO: Not attack but dice role
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
            key: "MULTIFORM",
            type: ["BodyAffecting", "special"], // TODO: Wrong type I think.
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
            //"duration": "instant",  // TODO: Not true, hack for isPerceivable
            costEnd: true,
            costPerLevel: 1,
        },
        {},
    );

    addPower(
        {
            key: "POWERDEFENSE",
            type: ["defense", "special"],
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
            key: "REGENERATION",
            type: ["special"],
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
            key: "RKA",
            type: ["attack"],
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
            key: "STRETCHING",
            type: ["body-affecting", "standard"],
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
            key: "SUMMON",
            type: ["standard"],
        },
        {},
    );
    addPower(
        undefined, // TODO: Ignore for 6e or is undefined a better way to do it?
        {
            key: "SUPPRESS",
            name: "Suppress",
            type: ["adjustment", "attack"],
            perceivability: "obvious",
            duration: "constant",
            target: "target’s DCV",
            range: "standard",
            costEnd: true,
            costPerLevel: 5,
        },
    );

    addPower(
        {
            key: "TELEKINESIS",
            type: ["attack"],
            range: "standard",
            costEnd: true,
            costPerLevel: 1.5,
        },
        {},
    );
    addPower(
        {
            key: "TELEPATHY",
            type: ["mental", "attack"],
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
            perceivability: "obvious",
            duration: "instant",
            target: "target's DCV",
            range: "Standard", // TODO: capital "Standard" doesn't match other powers.
            costEnd: true,
            //cost: See Transform Table
        },
        {},
    );
})();

(function addMartial() {
    addPower(
        {
            key: "EXTRADC",
            type: ["martial"],
            costPerLevel: 4,
        },
        {},
    );

    addPower(
        {
            // TODO: Needed?
            key: "MANEUVER",
            type: ["martial", "attack"],
        },
        {},
    );

    addPower(
        {
            key: "RANGEDDC",
            type: ["martial"],
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
            costPerLevel: 1,
        },
        {},
    );
    addPower(
        {
            key: "ENHANCEDPERCEPTION",
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "MENTALAWARENESS",
            type: ["sense"],
            senseGroup: "mental",
            senseType: "passive",
        },
        {},
    );
    addPower(
        {
            key: "NIGHTVISION",
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "PENETRATIVE",
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "TARGETINGSENSE",
            type: ["sense"],
        },
        {},
    );
    addPower(
        {
            key: "TRACKINGSENSE",
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
            name: "Accidental Change",
        },
        {},
    );

    addPower(
        {
            key: "GENERICDISADVANTAGE",
            type: ["disadvantage"],
            name: "Custom Disadvantage",
        },
        {},
    );

    addPower(
        {
            key: "DEPENDENCE",
            type: ["disadvantage"],
            name: "Dependence",
        },
        {},
    );
    addPower(
        {
            key: "DEPENDENTNPC",
            type: ["disadvantage"],
            name: "Dependent NPC",
        },
        {},
    );
    addPower(
        {
            key: "DISTINCTIVEFEATURES",
            type: ["disadvantage"],
            name: "Distinctive Features",
        },
        {},
    );

    addPower(
        {
            key: "ENRAGED",
            type: ["disadvantage"],
            name: "Enraged/Berserk",
        },
        {},
    );

    addPower(
        {
            key: "HUNTED",
            type: ["disadvantage"],
            name: "Hunted",
        },
        {},
    );

    addPower(
        {
            key: "HUNTED",
            type: ["disadvantage"],
            name: "Hunted",
        },
        {},
    );

    addPower(
        {
            key: "MONEYDISAD",
            type: ["disadvantage"],
            name: "Hunted",
        },
        {},
    );

    addPower(
        {
            key: "PHYSICALLIMITATION",
            type: ["disadvantage"],
            name: "Physical Limitation",
        },
        {},
    );
    addPower(
        {
            key: "PSYCHOLOGICALLIMITATION",
            type: ["disadvantage"],
            name: "Psychological Limitation",
        },
        {},
    );

    addPower(
        {
            key: "RIVALRY",
            type: ["disadvantage"],
            name: "Rivalry",
        },
        {},
    );

    addPower(
        {
            key: "SOCIALLIMITATION",
            type: ["disadvantage"],
            name: "Social Limitation",
        },
        {},
    );
    addPower(
        {
            key: "SUSCEPTIBILITY",
            type: ["disadvantage"],
            name: "Susceptibility",
        },
        {},
    );

    addPower(
        {
            key: "UNLUCK",
            type: ["disadvantage"],
            name: "Unluck",
            costPerLevel: 5,
        },
        {},
    );

    addPower(
        {
            key: "VULNERABILITY",
            type: ["disadvantage"],
            name: "Vulnerability",
        },
        {},
    );
})();

// Power Info
// Valid XMLIDs for powers
// HERO.powers6e = [
//     {
//         key: "STR",
//         name: "Strength",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         costEnd: true,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "DEX",
//         name: "Dexterity.",
//         base: 10,
//         cost: 2,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["base2"],
//     },
//     {
//         key: "CON",
//         name: "Constitution",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai"],
//     },
//     {
//         key: "INT",
//         name: "Intelligence",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2"],
//     },
//     {
//         key: "EGO",
//         name: "Ego",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["automaton", "vehicle", "base2", "computer"],
//     },
//     {
//         key: "PRE",
//         name: "Presence",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai"],
//     },
//     {
//         key: "COM",
//         name: "Comeliness",
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai", "6e"],
//     },
//     {
//         key: "OCV",
//         name: "Offensive Combat Value",
//         base: 3,
//         cost: 5,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["base2"],
//     },
//     {
//         key: "DCV",
//         name: "Defensive Combat Value",
//         base: 3,
//         cost: 5,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["base2"],
//     },
//     {
//         key: "OMCV",
//         name: "Offensive Mental Combat Value",
//         base: 3,
//         cost: 3,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["automaton", "vehicle", "base2"],
//     },
//     {
//         key: "DMCV",
//         name: "Defensive Mental Combat Value",
//         base: 3,
//         cost: 3,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["automaton", "vehicle", "base2"],
//     },
//     {
//         key: "SPD",
//         name: "Speed",
//         base: 2,
//         cost: 10,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["base2"],
//     },
//     {
//         key: "PD",
//         name: "Physical Defense",
//         base: 2,
//         cost: 1,
//         type: ["characteristic", "defense"],
//         duration: "persistent",
//         ignoreFor: ["computer", "ai"],
//     },
//     {
//         key: "ED",
//         name: "Energy Defense",
//         base: 2,
//         cost: 1,
//         type: ["characteristic", "defense"],
//         duration: "persistent",
//         ignoreFor: ["computer", "ai"],
//     },
//     {
//         key: "REC",
//         name: "Recovery",
//         base: 4,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai"],
//     },
//     {
//         key: "END",
//         name: "Endurance",
//         base: 20,
//         cost: 1 / 5,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai"],
//     },
//     {
//         key: "BODY",
//         name: "Body",
//         base: 10,
//         cost: 1,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "STUN",
//         name: "Stun",
//         base: 20,
//         cost: 1 / 2,
//         type: ["characteristic"],
//         duration: "persistent",
//         ignoreFor: ["vehicle", "base2", "computer", "ai"],
//     },
//     {
//         key: "RUNNING",
//         name: "Running",
//         base: 12,
//         cost: 1,
//         type: ["movement"],
//         costEnd: true,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "SWIMMING",
//         name: "Swimming",
//         base: 4,
//         cost: 1 / 2,
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 1 / 2,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "LEAPING",
//         name: "Leaping",
//         base: 4,
//         cost: 1 / 2,
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 0.5,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "BASESIZE",
//         name: "Base Size",
//         type: ["characteristic"],
//         duration: "persistent",
//         onlyFor: ["automaton", "vehicle", "base2"],
//     },
//     {
//         key: "CLINGING",
//         name: "Clinging",
//         type: ["standard"],
//         costEnd: false,
//         costPerLevel: 1 / 3,
//     },
//     {
//         key: "EXTRALIMBS",
//         type: ["standard"],
//         costPerLevel: 0,
//     },
//     {
//         key: "SUMMON",
//         type: ["standard"],
//     },
//     {
//         key: "DESOLIDIFICATION",
//         type: ["body-affecting", "standard"],
//         name: "Desolidification",
//     },
//     {
//         key: "REGENERATION",
//         type: ["special"],
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//     },
//     {
//         key: "HEALING",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target's dcv",
//         range: "no range",
//         costEnd: true,
//         costPerLevel: 10,
//     },
//     {
//         key: "STRETCHING",
//         type: ["body-affecting", "standard"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "LIFESUPPORT",
//         name: "Life Support",
//         type: ["standard"],
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//     },
//     {
//         key: "ABSORPTION",
//         name: "Absorption",
//         type: ["adjustment", "standard", "defense"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1,
//     },
//     {
//         key: "AID",
//         name: "Aid",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target’s DCV",
//         range: "no range",
//         costEnd: true,
//         costPerLevel: 6,
//     },
//     {
//         key: "DRAIN",
//         name: "Drain",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target’s DCV",
//         range: "standard",
//         costEnd: true,
//         costPerLevel: 10,
//     },
//     {
//         key: "DISPEL",
//         name: "Dispel",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target’s DCV",
//         range: "standard",
//         costEnd: true,
//         costPerLevel: 3,
//     },
//     {
//         key: "TRANSFER",
//         name: "Transfer",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target’s DCV",
//         range: "no range",
//         costEnd: true,
//         costPerLevel: 15,
//     },
//     {
//         key: "SHAPESHIFT",
//         name: "Shape Shift",
//         type: ["body-affecting"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: true,
//     },
//     {
//         key: "DENSITYINCREASE",
//         name: "Density Increase",
//         type: ["body-affecting", "standard", "defense"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: true,
//         costPerLevel: 4,
//     },
//     {
//         key: "DEFLECTION",
//         name: "Deflection",
//         type: ["defense", "standard"],
//         perceivability: "Inobvious",
//         duration: "instant",
//         target: "Target’s OCV (see text)",
//         range: "Standard",
//         costEnd: true,
//         //"cost": 20,
//     },
//     {
//         key: "NAKEDMODIFIER",
//         type: ["special"],
//         //"duration": "instant",  // Not true, hack for isPercievable
//         costEnd: true,
//         costPerLevel: 1,
//     },
//     {
//         key: "GROWTH",
//         name: "Growth",
//         type: ["body-affecting", "defense", "size"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "LUCK",
//         name: "Luck",
//         type: ["special"],
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 5,
//     },
//     {
//         key: "ENDURANCERESERVE",
//         name: "Endurance Reserve",
//         type: ["special"],
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 0.25,
//     },
//     {
//         key: "MINDSCAN",
//         type: ["attack", "mental"],
//         perceivability: "imperceptible",
//         duration: "constant",
//         target: "dmcv",
//         range: "special",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "TELEPATHY",
//         type: ["mental", "attack"],
//         perceivability: "imperceptible",
//         duration: "instant",
//         target: "dmcv",
//         range: "los",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "EGOATTACK",
//         name: "Mental Blast",
//         type: ["attack", "mental"],
//         perceivability: "imperceptible",
//         duration: "instant",
//         target: "dmcv",
//         range: "los",
//         costEnd: true,
//         costPerLevel: 10,
//     },
//     {
//         key: "MENTALILLUSIONS",
//         name: "Mental Illusions",
//         type: ["attack", "mental"],
//         perceivability: "imperceptible",
//         duration: "instant",
//         target: "dmcv",
//         range: "los",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "MINDCONTROL",
//         name: "Mind Control",
//         type: ["attack", "mental"],
//         perceivability: "imperceptible",
//         duration: "instant",
//         target: "dmcv",
//         range: "los",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "MINDLINK",
//         name: "Mind Link",
//         type: ["mental"],
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "dmcv",
//         range: "los",
//         costEnd: false,
//         costPerLevel: 5,
//     },
//     {
//         key: "CLAIRSENTIENCE",
//         type: ["sense"],
//         range: "standard",
//     },
//     {
//         key: "NIGHTVISION",
//         type: ["sense"],
//     },
//     {
//         key: "ENHANCEDPERCEPTION",
//         type: ["sense"],
//     },
//     {
//         key: "MENTALAWARENESS",
//         type: ["sense"],
//         senseGroup: "mental",
//         senseType: "passive",
//     },
//     {
//         key: "PENETRATIVE",
//         type: ["sense"],
//     },
//     {
//         key: "DETECT",
//         type: ["sense"],
//         costPerLevel: 1,
//     },
//     {
//         key: "TARGETINGSENSE",
//         type: ["sense"],
//     },
//     {
//         key: "TRACKINGSENSE",
//         type: ["sense"],
//     },
//     {
//         key: "FINDWEAKNESS",
//         type: ["sense", "special", "skill"],
//     },
//     {
//         key: "HANDTOHANDATTACK",
//         type: ["attack"],
//         range: "no range",
//         costPerLevel: 5,
//     },
//     {
//         key: "HKA",
//         type: ["attack"],
//         range: "no range",
//         costPerLevel: 15,
//         costEnd: true,
//     },
//     {
//         key: "TELEKINESIS",
//         type: ["attack"],
//         range: "standard",
//         costEnd: true,
//         costPerLevel: 1.5,
//     },
//     {
//         key: "RKA",
//         type: ["attack"],
//         range: "standard",
//         costPerLevel: 15,
//         costEnd: true,
//         sheet: {
//             INPUT: {
//                 label: "Vs.",
//                 selectOptions: {
//                     ED: "ED",
//                     PD: "PD",
//                 },
//             },
//         },
//     },
//     {
//         key: "ENERGYBLAST",
//         type: ["attack"],
//         range: "standard",
//         costPerLevel: 5,
//         costEnd: true,
//     },
//     {
//         key: "DARKNESS",
//         type: ["sense-affecting", "attack", "standard"],
//         duration: "constant",
//         range: "standard",
//         costEnd: true,
//     },
//     {
//         // Duplicate
//         key: "DISPEL",
//         type: ["attack", "standard"],
//         range: "standard",
//         costPerLevel: 3,
//     },
//     {
//         key: "ENTANGLE",
//         type: ["attack", "standard"],
//         range: "standard",
//         costPerLevel: 10,
//         costEnd: true,
//     },
//     {
//         key: "FLASH",
//         type: ["attack", "sense-affecting", "standard"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "Target’s DCV",
//         range: "standard",
//         costEnd: true,
//     },
//     {
//         key: "IMAGES",
//         name: "Images",
//         type: ["attack", "sense-affecting", "standard"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "area (see text)",
//         range: "standard",
//         costEnd: true,
//     },
//     {
//         key: "EXTRADC",
//         type: ["martial"],
//         costPerLevel: 4,
//     },
//     {
//         key: "RANGEDDC",
//         type: ["martial"],
//         costPerLevel: 4,
//     },
//     {
//         key: "MANEUVER",
//         type: ["martial", "attack"],
//     },
//     {
//         key: "CHANGEENVIRONMENT",
//         name: "Change Environment",
//         type: ["attack"],
//         perceivability: "Obvious",
//         duration: "Constant",
//         target: "Target’s DCV",
//         range: "Standard",
//         costEnd: true,
//         costPerLevel: 1,
//     },
//     {
//         key: "INVISIBILITY",
//         name: "Invisibility",
//         type: ["sense-affecting", "defense"],
//         perceivability: "Special",
//         duration: "Constant",
//         target: "Self Only",
//         range: "Self",
//         costEnd: true,
//     },
//     {
//         key: "FORCEWALL",
//         type: ["defense"],
//         name: "Barrier",
//         duration: "instant",
//         range: "standard",
//         costEnd: true,
//         costPerLevel: 1.5,
//     },
//     {
//         key: "FORCEFIELD",
//         type: ["defense"],
//         name: "Resistant Protection",
//         duration: "Persistent",
//         perceivability: "inobvious",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1.5,
//     },
//     {
//         key: "FLASHDEFENSE",
//         type: ["defense", "special"],
//         name: "Flash Defense",
//         perceivability: "inobvious",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1,
//     },
//     {
//         key: "MENTALDEFENSE",
//         type: ["defense", "special"],
//         name: "Mental Defense",
//         perceivability: "Imperceptible",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         duration: "Persistent",
//         costPerLevel: 1,
//     },
//     {
//         key: "POWERDEFENSE",
//         type: ["defense", "special"],
//         name: "Power Defense",
//         perceivability: "inobvious",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1,
//     },
//     {
//         key: "DAMAGENEGATION",
//         type: ["defense", "special"],
//         name: "Damage Negation",
//         perceivability: "inobvious",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//     },
//     {
//         key: "DAMAGEREDUCTION",
//         type: ["defense", "standard"],
//         name: "Damage Reduction",
//         perceivability: "inobvious",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//     },
//     {
//         key: "KBRESISTANCE",
//         type: ["defense", "standard"],
//         name: "Knockback Resistance",
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1,
//     },
//     {
//         key: "LACKOFWEAKNESS",
//         type: ["defense", "special"],
//         name: "Knockback Resistance",
//         perceivability: "imperceptible",
//         duration: "persistent",
//         target: "self only",
//         range: "self",
//         costEnd: false,
//         costPerLevel: 1,
//     },

//     {
//         key: "FLIGHT",
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 1,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "TELEPORTATION",
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 1,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "SWINGING",
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 0.5,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "TUNNELING",
//         type: ["movement"],
//         costEnd: true,
//         costPerLevel: 1,
//         ignoreFor: ["base2", "computer", "ai"],
//     },

//     {
//         key: "EXTRADIMENSIONALMOVEMENT",
//         type: ["movement"],
//         name: "Extra-Dimensional Movement",
//         perceivability: "Inobvious",
//         duration: "instant",
//         target: "Self Only",
//         range: "Self",
//         costEnd: true,
//         costPerLevel: 20,
//         // "ignoreFor": [
//         //     "base2",
//         //     "computer",
//         //     "ai"
//         // ],
//         onlyFor: ["none"],
//     },
//     {
//         key: "ENVIRONMENTAL_MOVEMENT",
//         type: ["talent"],
//         name: "Environmental Movement",
//         costPerLevel: 0,
//     },
//     {
//         key: "REPUTATION",
//         type: ["perk", "skill"],
//         name: "Positive Reputation",
//         costPerLevel: 0,
//     },
//     {
//         key: "FOLLOWER",
//         type: ["talent"],
//         name: "Follower",
//     },

//     {
//         key: "CONTACT",
//         type: ["perk"],
//         name: "Contact",
//         costPerLevel: 1,
//     },
//     {
//         key: "COMBAT_LUCK",
//         type: ["talent", "defense"],
//         duration: "constant",
//         costPerLevel: 6,
//     },
//     {
//         key: "LIGHTNING_REFLEXES_ALL",
//         type: ["talent"],
//         name: "Lightning Reflexes",
//         costPerLevel: 1,
//     },
//     {
//         key: "LIGHTNING_REFLEXES_SINGLE",
//         type: ["talent"],
//         name: "Lightning Reflexes",
//         costPerLevel: 1,
//     },
//     {
//         key: "COMBAT_SENSE",
//         type: ["talent"],
//         name: "Combat Sense",
//         costPerLevel: 1,
//     },
//     {
//         key: "RESISTANCE",
//         type: ["talent"],
//         name: "Resistance",
//         costPerLevel: 1,
//     },
//     {
//         key: "ACROBATICS",
//         type: ["skill"],
//     },
//     {
//         key: "ACTING",
//         type: ["skill"],
//     },
//     {
//         key: "ANALYZE",
//         type: ["skill"],
//     },
//     {
//         key: "ANIMAL_HANDLER",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "AUTOFIRE_SKILLS",
//         type: ["skill"],
//     },
//     {
//         key: "BREAKFALL",
//         type: ["skill"],
//         costPerLevel: 1,
//     },
//     {
//         key: "BRIBERY",
//         type: ["skill"],
//     },
//     {
//         key: "BUGGING",
//         type: ["skill"],
//     },
//     {
//         key: "BUREAUCRATICS",
//         type: ["skill"],
//     },
//     {
//         key: "CHARM",
//         type: ["skill"],
//     },
//     {
//         key: "CLIMBING",
//         type: ["skill"],
//     },
//     {
//         key: "COMBAT_DRIVING",
//         type: ["skill"],
//     },
//     {
//         key: "COMBAT_PILOTING",
//         type: ["skill"],
//     },
//     {
//         key: "COMBAT_LEVELS",
//         type: ["skill"],
//         rollable: false,
//         xmlid: "COMBAT_LEVELS",
//     },
//     {
//         key: "COMPUTER_PROGRAMMING",
//         type: ["skill"],
//     },
//     {
//         key: "CONCEALMENT",
//         type: ["skill"],
//     },
//     {
//         key: "CONTORTIONIST",
//         type: ["skill"],
//     },
//     {
//         key: "CONVERSATION",
//         type: ["skill"],
//     },
//     {
//         key: "CRAMMING",
//         type: ["skill"],
//     },
//     {
//         key: "CRIMINOLOGY",
//         type: ["skill"],
//     },
//     {
//         key: "CRYPTOGRAPHY",
//         type: ["skill"],
//     },
//     {
//         key: "CUSTOMSKILL",
//         type: ["skill"],
//         costPerLevel: 1,
//     },
//     {
//         key: "DEDUCTION",
//         type: ["skill"],
//     },
//     {
//         key: "DEFENSE_MANEUVER",
//         type: ["skill"],
//     },
//     {
//         key: "DEMOLITIONS",
//         type: ["skill"],
//     },
//     {
//         key: "DISGUISE",
//         type: ["skill"],
//     },
//     {
//         key: "ELECTRONICS",
//         type: ["skill"],
//     },
//     {
//         key: "FAST_DRAW",
//         type: ["skill"],
//     },
//     {
//         key: "FORENSIC_MEDICINE",
//         type: ["skill"],
//     },
//     {
//         key: "FORGERY",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "GAMBLING",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "HIGH_SOCIETY",
//         type: ["skill"],
//     },
//     {
//         key: "INTERROGATION",
//         type: ["skill"],
//     },
//     {
//         key: "INVENTOR",
//         type: ["skill"],
//     },
//     {
//         key: "KNOWLEDGE_SKILL",
//         type: ["skill"],
//         costPerLevel: 1,
//     },
//     {
//         key: "LANGUAGES",
//         type: ["skill"],
//         rollable: false,
//     },
//     {
//         key: "LIPREADING",
//         type: ["skill"],
//     },
//     {
//         key: "LOCKPICKING",
//         type: ["skill"],
//     },
//     {
//         key: "MECHANICS",
//         type: ["skill"],
//     },
//     {
//         key: "MENTAL_COMBAT_LEVELS",
//         type: ["skill"],
//         rollable: false,
//         xmlid: "MENTAL_COMBAT_LEVELS",
//     },
//     {
//         key: "MIMICRY",
//         type: ["skill"],
//     },
//     {
//         key: "NAVIGATION",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "ORATORY",
//         type: ["skill"],
//     },
//     {
//         key: "PARAMEDICS",
//         type: ["skill"],
//     },
//     {
//         key: "PENALTY_SKILL_LEVELS",
//         type: ["skill"],
//     },
//     {
//         key: "PERSUASION",
//         type: ["skill"],
//     },
//     {
//         key: "POWERSKILL",
//         type: ["skill"],
//     },
//     {
//         key: "PROFESSIONAL_SKILL",
//         type: ["skill"],
//     },
//     {
//         key: "RAPID_ATTACK_HTH",
//         type: ["skill"],
//     },
//     {
//         key: "RIDING",
//         type: ["skill"],
//     },
//     {
//         key: "SCIENCE_SKILL",
//         type: ["skill"],
//     },
//     {
//         key: "SECURITY_SYSTEMS",
//         type: ["skill"],
//     },
//     {
//         key: "SHADOWING",
//         type: ["skill"],
//     },
//     {
//         key: "SKILL_LEVELS",
//         type: ["skill"],
//     },
//     {
//         key: "SLEIGHT_OF_HAND",
//         type: ["skill"],
//     },
//     {
//         key: "STEALTH",
//         type: ["skill"],
//     },
//     {
//         key: "STREETWISE",
//         type: ["skill"],
//     },
//     {
//         key: "SURVIVAL",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "SYSTEMS_OPERATION",
//         type: ["skill"],
//     },
//     {
//         key: "TACTICS",
//         type: ["skill"],
//     },
//     {
//         key: "TEAMWORK",
//         type: ["skill"],
//     },
//     {
//         key: "TRACKING",
//         type: ["skill"],
//     },
//     {
//         key: "TRADING",
//         type: ["skill"],
//     },
//     {
//         key: "TRANSPORT_FAMILIARITY",
//         type: ["skill"],
//         rollable: false,
//     },
//     {
//         key: "TWO_WEAPON_FIGHTING_HTH",
//         type: ["skill"],
//     },
//     {
//         key: "VENTRILOQUISM",
//         type: ["skill"],
//     },
//     {
//         key: "WEAPON_FAMILIARITY",
//         type: ["skill"],
//     },
//     {
//         key: "WEAPONSMITH",
//         type: ["skill"],
//         categorized: true,
//     },
//     {
//         key: "JACK_OF_ALL_TRADES",
//         type: ["skill", "enhancer"],
//         rollable: false,
//     },
//     {
//         key: "LINGUIST",
//         type: ["skill", "enhancer"],
//         rollable: false,
//     },
//     {
//         key: "SCIENTIST",
//         type: ["skill", "enhancer"],
//         rollable: false,
//     },
//     {
//         key: "SCHOLAR",
//         type: ["skill", "enhancer"],
//         rollable: false,
//     },
//     {
//         key: "TRAVELER",
//         type: ["skill", "enhancer"],
//         rollable: false,
//     },
//     {
//         key: "LIST",
//         type: ["framework"],
//     },
//     {
//         key: "VPP",
//         type: ["framework"],
//     },
//     {
//         key: "ELEMENTAL_CONTROL",
//         type: ["framework"],
//     },
//     {
//         key: "MULTIPOWER",
//         type: ["framework"],
//     },
//     {
//         key: "COMPOUNDPOWER",
//         type: ["compound"],
//     },
//     {
//         key: "DUPLICATION",
//         type: ["BodyAffecting", "special"],
//         name: "Duplication",
//         perceivability: "Obvious",
//         duration: "persistent",
//         target: "Self Only",
//         range: "Self",
//         costEnd: false,
//         costPerLevel: 0.2,
//     },
//     {
//         key: "MULTIFORM",
//         type: ["BodyAffecting", "special"],
//         name: "Multiform",
//         perceivability: "Obvious",
//         duration: "persistent",
//         target: "Self Only",
//         range: "Self",
//         costEnd: false,
//         costPerLevel: 0.2,
//     },

//     {
//         key: "CUSTOMPOWER",
//         type: ["custom"],
//     },
//     {
//         // TODO: Do we need it in the system or not?
//         key: "naturalBodyHealing",
//     },

//     {
//         key: "AUTOMATON", //CANNOT BE STUNNED
//         type: ["automaton", "special"],
//         name: "Automaton",
//         perceivability: "Inobvious",
//         duration: "Persistent",
//         target: "Self Only",
//         range: "Self",
//         costEnd: false,
//     },
// ];

// HERO.powers5e = [
//     {
//         key: "DEX",
//         cost: 3,
//     },
//     {
//         key: "CON",
//         cost: 2,
//     },
//     {
//         key: "EGO",
//         cost: 2,
//     },
//     {
//         key: "BODY",
//         cost: 2,
//     },
//     {
//         key: "PD",
//         base: 0,
//         cost: 1,
//     },
//     {
//         key: "ED",
//         base: 0,
//         cost: 1,
//     },
//     {
//         key: "SPD",
//         base: 0,
//         cost: 10,
//     },
//     {
//         key: "REC",
//         base: 0,
//         cost: 2,
//     },
//     {
//         key: "END",
//         base: 0,
//         cost: 1 / 2,
//     },
//     {
//         key: "STUN",
//         base: 0,
//         cost: 1,
//     },
//     {
//         key: "COM",
//         base: 10,
//         cost: 1 / 2,
//     },
//     {
//         key: "OCV",
//         cost: 0,
//     },
//     {
//         key: "DCV",
//         cost: 0,
//     },
//     {
//         key: "OMCV",
//         cost: 0,
//     },
//     {
//         key: "DMCV",
//         cost: 0,
//     },
//     {
//         key: "ABSORPTION",
//         type: ["adjustment", "attack", "defense"],
//         costPerLevel: 5,
//     },
//     {
//         key: "AID",
//         costEnd: false,
//         costPerLevel: 10,
//     },
//     {
//         key: "SUPPRESS",
//         name: "Suppress",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "target’s DCV",
//         range: "standard",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "TRANSFER",
//         name: "Transfer",
//         type: ["adjustment", "attack"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target's DCV",
//         range: "no range",
//         costEnd: true,
//         costPerLevel: 15,
//     },
//     {
//         key: "TRANSFORM",
//         name: "Transform",
//         type: ["attack", "standard"],
//         perceivability: "obvious",
//         duration: "instant",
//         target: "target's DCV",
//         range: "Standard",
//         costEnd: true,
//         //cost: See Transform Table
//     },
//     {
//         key: "ARMOR",
//         type: ["defense"],
//         name: "Resistant Protection",
//         duration: "Persistent",
//         costPerLevel: 3 / 2,
//     }, // AKA RESISTANT PROTECTION
//     {
//         key: "DAMAGERESISTANCE",
//         name: "Damage Resistance",
//         type: ["defense"],
//         //perceivability: "obvious",
//         duration: "instant",
//         target: "Self Only",
//         range: "Self",
//         costEnd: false,
//         costPerLevel: 1 / 2,
//     },
//     {
//         key: "FORCEFIELD",
//         type: ["defense"],
//         name: "Force Field",
//         duration: "Constant",
//         costEnd: true,
//         costPerLevel: 1,
//     },
//     {
//         key: "UNLUCK",
//         type: ["disadvantage"],
//         name: "Unluck",
//         costPerLevel: 5,
//     },
//     {
//         key: "DENSITYINCREASE",
//         name: "Density Increase",
//         type: ["body-affecting", "standard", "defense"],
//         perceivability: "obvious",
//         duration: "constant",
//         target: "self only",
//         range: "self",
//         costEnd: true,
//         costPerLevel: 5,
//     },
//     {
//         key: "FLIGHT",
//         costPerLevel: 2,
//     },
//     {
//         key: "GLIDING",
//         type: ["movement"],
//         costEnd: false,
//         costPerLevel: 1,
//         ignoreFor: ["base2", "computer", "ai"],
//     },
//     {
//         key: "LEAPING",
//         base: 2,
//         cost: 1,
//         costPerLevel: 1,
//     },
//     {
//         key: "RUNNING",
//         base: 6,
//         cost: 2,
//     },
//     {
//         key: "SWIMMING",
//         base: 2,
//         cost: 1,
//         costPerLevel: 1,
//     },
//     {
//         key: "SWINGING",
//         costPerLevel: 1,
//     },
//     {
//         key: "TELEPORTATION",
//         costPerLevel: 2,
//     },
//     {
//         key: "TUNNELING",
//         costPerLevel: 5,
//     },
//     {
//         key: "KBRESISTANCE",
//         costPerLevel: 2,
//     },
// ];

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
