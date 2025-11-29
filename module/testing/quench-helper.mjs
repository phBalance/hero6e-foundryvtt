export async function createQuenchActor({ quench, contents, is5e }) {
    const CHARACTER_NAME = contents?.match(/CHARACTER_NAME=".*?"/)?.[0];
    const name = CHARACTER_NAME?.match(/CHARACTER_NAME="(.*?)"/)?.[1] || "";

    function generateQuenchTitleRecursive(quench) {
        // '__root/hero6efoundryvttv2.utils.defense_root/Resistant Protection/rPD 1'
        if (!quench.parent) {
            return quench.title.replace(/\W+/g, "");
        }
        return `${generateQuenchTitleRecursive(quench.parent)}/${quench.title.replace(/\W+/g, "")}`;
    }

    // Need to be a bit careful as we can create invalid XML if name has special characters
    const quenchName = `_Quench ${Date.now().toString()} ${name.replace(
        /\W+/g,
        " ",
    )} ${generateQuenchTitleRecursive(quench.currentTest || quench.test)}`;

    // Delete any previous leftover actors for this test
    const oldQuenchActors = game.actors.filter((a) => a.name.includes(quench.title));
    await Actor.deleteDocuments(oldQuenchActors.map((m) => m.id));

    if (is5e === undefined) {
        throw "missing is5e";
    }

    // Create new actor for this test
    const actor = await Actor.create(
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

    await actor.FullHealth();

    return actor;
}

export async function deleteQuenchActor({ quench, actor }) {
    if (actor == null) {
        throw "missing actor";
    } else if (quench == null) {
        throw "missing quench";
    }

    // Careful undefined comparisons are tricky
    if (
        quench.tests?.find((t) => t?.state !== "passed") ||
        quench.currentTest?.state === "failed" ||
        quench.suites?.find((s) => s.tests.find((t) => t.state !== "passed")) ||
        quench.test.parent.suites?.find((s) => s.tests.find((t) => t.state === "failed"))
    ) {
        console.error("skipping deletion of actor because tests failed");
        return;
    }

    await actor.delete();
}

export function registerGlobalSetup(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.a.global-setup",
        (context) => {
            const { describe, it } = context;

            describe("Global Module Setup", function () {
                it("Delete '_Quench' actors", async () => {
                    await Actor.deleteDocuments(
                        game.actors.filter((a) => a.name.startsWith("_Quench")).map((o) => o.id),
                    );
                });
            });
        },
        {
            // Display name for the batch in the Quench UI.
            displayName: "Global Setup",
        },
    );
}

export function registerGlobalTeardown(quench) {
    quench.registerBatch(
        "hero6efoundryvttv2.z.global-teardown", // Use a unique key for your module.
        (context) => {
            const { describe, it } = context;

            describe("Global Teardown", function () {
                it("Delete '_Quench' actors", async () => {
                    await Actor.deleteDocuments(
                        game.actors.filter((a) => a.name.startsWith("_Quench")).map((o) => o.id),
                    );
                });
            });
        },
        {
            // Display name for the batch in the Quench UI.
            displayName: "Global Teardown",
        },
    );
}
