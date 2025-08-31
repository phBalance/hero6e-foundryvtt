const { StringField, ObjectField, ArrayField, EmbeddedDataField } = foundry.data.fields;

class HeroItemAdderModCommonModel extends foundry.abstract.DataModel {
    /** @inheritdoc */
    static defineSchema() {
        return {
            XMLID: new StringField(),
            ID: new StringField(),
            // BASECOST: new StringField(),
            // LEVELS: new StringField(),
            // ALIAS: new StringField(),
            // POSITION: new StringField(),
            // MULTIPLIER: new StringField(),
            // GRAPHIC: new StringField(),
            // COLOR: new StringField(),
            // SFX: new StringField(),
            // SHOW_ACTIVE_COST: new StringField(),
            // OPTION: new StringField(),
            // OPTIONID: new StringField(),
            // OPTION_ALIAS: new StringField(),
            // INCLUDE_NOTES_IN_PRINTOUT: new StringField(),
            // NAME: new StringField(),
            // SHOWALIAS: new StringField(),
            // PRIVATE: new StringField(),
            // REQUIRED: new StringField(),
            // INCLUDEINBASE: new StringField(),
            // DISPLAYINSTRING: new StringField(),
            // GROUP: new StringField(),
            // SELECTED: new StringField(),
        };
    }
}

class HeroAdderModel extends HeroItemAdderModCommonModel {}

class HeroModifierModel extends HeroItemAdderModCommonModel {}

class HeroPowerModel extends HeroItemAdderModCommonModel {}

export class HeroSystem6eItemTypeDataModel extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        return {
            ADDER: new ArrayField(new EmbeddedDataField(HeroAdderModel)),
            ALIAS: new StringField(),
            BASECOST: new StringField(),
            COLOR: new StringField(),
            GRAPHIC: new StringField(),
            ID: new StringField(),
            INPUT: new StringField(),
            LEVELS: new StringField(),
            MODIFIER: new ArrayField(new EmbeddedDataField(HeroModifierModel)),
            MULTIPLIER: new StringField(),
            NAME: new StringField(),
            NOTES: new StringField(),
            PARENTID: new StringField(),
            POSITION: new StringField(),
            POWER: new ArrayField(new EmbeddedDataField(HeroPowerModel)),
            SFX: new StringField(),
            XMLID: new StringField(),
            _hdc: new ObjectField({}),
        };
    }
}

export class HeroSystem6eItemPower extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            ACTIVE: new StringField(),
            BODYLEVELS: new StringField(),
            DEFENSE: new StringField(),
            DOESBODY: new StringField(),
            DOESDAMAGE: new StringField(),
            DOESKNOCKBACK: new StringField(),
            DURATION: new StringField(),
            ED: new StringField(),
            EDLEVELS: new StringField(),
            END: new StringField(),
            ENDCOLUMNOUTPUT: new StringField(),
            FDLEVELS: new StringField(),
            GROUP: new StringField(),
            HEIGHTLEVELS: new StringField(),
            INT: new StringField(),
            KILLING: new StringField(),
            LENGTHLEVELS: new StringField(),
            MDLEVELS: new StringField(),
            NUMBER: new StringField(),
            OCV: new StringField(),
            OPTION: new StringField(),
            OPTIONID: new StringField(),
            PD: new StringField(),
            PDLEVELS: new StringField(),
            POINTS: new StringField(),
            POWDLEVELS: new StringField(),
            PRE: new StringField(),
            QUANTITY: new StringField(),
            RANGE: new StringField(),
            STR: new StringField(),
            TARGET: new StringField(),
            USECUSTOMENDCOLUMN: new StringField(),
            USESTANDARDEFFECT: new StringField(),
            VISIBLE: new StringField(),
            WIDTHLEVELS: new StringField(),

            // Skill
            CHARACTERISTIC: new StringField(),
            EVERYMAN: new StringField(),
            FAMILIARITY: new StringField(),
            INTBASED: new StringField(),
            LEVELSONLY: new StringField(),
            PROFICIENCY: new StringField(),
            ROLL: new StringField(),
            TEXT: new StringField(),
            TYPE: new StringField(),

            // Perk
            BASEPOINTS: new StringField(),
            DISADPOINTS: new StringField(),

            // Talent
            //CHARACTERISTIC: new StringField(),
            //GROUP: new StringField(),
            //OPTIONID: new StringField(),
            //POWER: new StringField(),
            //QUANTITY: new StringField(),
            //ROLL: new StringField(),
            //TEXT: new StringField(),
        };
    }
}

export class HeroSystem6eItemEquipment extends HeroSystem6eItemPower {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            CARRIED: new StringField(),
            EVER: new StringField(),
            PRICE: new StringField(),
            SKILL: new StringField(),
            WEIGHT: new StringField(),
        };
    }
}

export class HeroSystem6eItemSkill extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            CHARACTERISTIC: new StringField(),
            EVERYMAN: new StringField(),
            FAMILIARITY: new StringField(),
            INTBASED: new StringField(),
            LEVELSONLY: new StringField(),
            OPTION: new StringField(),
            OPTIONID: new StringField(),
            POWER: new StringField(),
            PROFICIENCY: new StringField(),
            ROLL: new StringField(),
            TEXT: new StringField(),
            TYPE: new StringField(),
        };
    }
}

export class HeroSystem6eItemPerk extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        //const { ObjectField, StringField, ArrayField, EmbeddedDataField } = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            BASEPOINTS: new StringField(),
            DISADPOINTS: new StringField(),
            INTBASED: new StringField(),
            NUMBER: new StringField(),
            OPTION: new StringField(),
            OPTIONID: new StringField(),
            POWER: new StringField(),
            ROLL: new StringField(),
            TEXT: new StringField(),
        };
    }
}
export class HeroSystem6eItemManeuver extends foundry.abstract.TypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        const { StringField } = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            ADDSTR: new StringField(),
            DC: new StringField(),
            DCV: new StringField(),
            DISPLAY: new StringField(),
            EFFECT: new StringField(),
            OCV: new StringField(),
            PHASE: new StringField(),
            USEWEAPON: new StringField(),
            WEAPONEFFECT: new StringField(),
            XMLID: new StringField(),
        };
    }
}

export class HeroSystem6eItemMartialArt extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        //const { ObjectField, StringField, ArrayField, EmbeddedDataField } = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            ACTIVECOST: new StringField(),
            ADDSTR: new StringField(),
            CATEGORY: new StringField(),
            CUSTOM: new StringField(),
            DAMAGETYPE: new StringField(),
            DC: new StringField(),
            DCV: new StringField(),
            DISPLAY: new StringField(),
            EFFECT: new StringField(),
            MAXSTR: new StringField(),
            OCV: new StringField(),
            PHASE: new StringField(),
            RANGE: new StringField(),
            STRMULT: new StringField(),
            USEWEAPON: new StringField(),
            WEAPONEFFECT: new StringField(),
        };
    }
}

export class HeroSystem6eItemDisadvantage extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        //const { ObjectField, StringField, ArrayField, EmbeddedDataField } = foundry.data.fields;
        // Note that the return is just a simple object
        return { ...super.defineSchema() };
    }
}

export class HeroSystem6eItemTalent extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        //const { ObjectField, StringField, ArrayField, EmbeddedDataField } = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            ...super.defineSchema(),
            CHARACTERISTIC: new StringField(),
            GROUP: new StringField(),
            OPTION: new StringField(),
            OPTIONID: new StringField(),
            //POWER: new StringField(),
            QUANTITY: new StringField(),
            ROLL: new StringField(),
            TEXT: new StringField(),
        };
    }
}

export class HeroSystem6eItemMisc extends HeroSystem6eItemTypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        //const { ObjectField, StringField, ArrayField, EmbeddedDataField } = foundry.data.fields;
        // Note that the return is just a simple object
        return { ...super.defineSchema() };
    }
}
