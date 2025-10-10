export async function createQuenchActor({ quench, actor, contents, is5e }) {
    const CHARACTER_NAME = contents?.match(/CHARACTER_NAME=".*?"/)?.[0];
    const name = CHARACTER_NAME?.match(/CHARACTER_NAME="(.*?)"/)?.[1] || "";
    const quenchName = `_Quench ${quench?.title} ${name} ${Date.now().toString()}`;

    // Delete any previous leftover actors for this test
    const oldQuenchActors = game.actors.filter((a) => a.name.includes(quench.title));
    await Actor.deleteDocuments(oldQuenchActors.map((m) => m.id));

    // Create new actor for this test
    actor = await Actor.create(
        {
            name: quenchName,
            type: "pc",
        },
        { is5e },
    );

    if (contents) {
        // Is this a full actor
        if (contents.includes("CHARACTER_NAME")) {
            await actor.uploadFromXml(contents.replace(CHARACTER_NAME, `CHARACTER_NAME="${quenchName}"`));
        } // Likely item contents
        else {
            // Add item
            await actor.items.create(HeroSystem6eItem.itemDataFromXml(contents, actor));
        }
    }

    actor.FullHealth();

    return { actor, quenchName };
}

export async function deleteQuenchActor({ quench, actor }) {
    if (quench.tests.find((t) => t?.state != "passed")) {
        return;
    }
    await actor.delete();
}
