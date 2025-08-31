export class HeroSystem6eItemTypeDataModelMisc extends foundry.abstract.TypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        const fields = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            NAME: new fields.StringField(),
            ADDER: new fields.ArrayField(
                new fields.SchemaField({
                    XMLID: new fields.StringField(),
                }),
            ),
            XMLID: new fields.StringField(),
            _hdc: new fields.ObjectField({}),
        };
    }

    get adders() {
        return this.ADDER.map((a) => ({ a, cost: 0 }));
    }

    static migrateData(data) {
        const proficiencies = data.proficiencies ?? {};
        if ("weapons" in proficiencies) {
            proficiencies.weapons = proficiencies.weapons.map((weapon) => {
                return weapon === "bmr" ? "boomerang" : weapon;
            });
        }

        return super.migrateData(data);
    }

    get name() {
        return this._hdc.NAME;
    }
    set name(value) {
        this.HDC._hdc = value;
    }
}
