export class HeroSystem6eItemTypeDataModel extends foundry.abstract.TypeDataModel {
    /// https://foundryvtt.wiki/en/development/api/DataModel

    static defineSchema() {
        const fields = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            NAME: new fields.StringField(),
        };
    }

    static migrateData(data) {
        return super.migrateData(data);
    }

    // get name() {
    //     return this._hdc.NAME;
    // }
    // set name(value) {
    //     this.HDC._hdc = value;
    // }
}
