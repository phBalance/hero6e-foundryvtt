export class HeroSystem6eItemTypeDataModelMisc extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        // Note that the return is just a simple object
        return {
            NAME: new fields.StringField({ initial: "Misc Item" }),
        };
    }
}
