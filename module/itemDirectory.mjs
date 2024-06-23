// eslint-disable-next-line no-undef
export class HeroSystem6eItemDirectory extends ItemDirectory {
    constructor(...args) {
        super(...args);
        //debugger;
    }

    _onDrop(event) {
        super._onDrop(event);

        // // Check if this is a COMPOUNDPOWER
        // const data = TextEditor.getDragEventData(event);
        // if (!data.type) return;
        // const item = fromUuidSync(data.uuid);
        // for (const childItem of item.childItems) {
        //     const psudoEvent = { ...event };
        //     psudoEvent;
        //     super._onDrop(...event);
        // }

        // debugger;
    }
}
