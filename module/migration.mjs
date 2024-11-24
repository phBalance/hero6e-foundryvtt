import { HeroProgressBar } from "./utility/progress-bar.mjs";
import { CreateHeroCompendiums } from "./heroCompendiums.mjs";

function getAllActorsInGame() {
    return [
        ...game.actors.contents,
        ...game.scenes.contents
            .map((scene) => scene.tokens)
            .map((token) => token.actorLink)
            .filter((actorLink) => actorLink),
    ];
}

async function willNotMigrate() {
    const lastMigration = game.settings.get(game.system.id, "lastMigration");

    // We no longer support migration of things which are too old so that migration doesn't become too complicated.
    // If anything is too old (based on the elements it supports) then we won't update anything. That list is:
    // - Last migrated version is before 3.0.76 which is the last version that had custom migration methods
    if (!foundry.utils.isNewerVersion(lastMigration, "3.0.75")) {
        const message = `<strong>FATAL ERROR</strong><br>The compendia, actors, and items in this world were were created with an older ${game.system.title || game.system.name} version that is no longer supported for automatic migration. Please re-upload everything from HDC or migrate through one, or more, supported versions (3.0.76 - 4.0.5) before upgrading to ${game.system.version}.`;

        const chatData = {
            author: game.user._id,
            style: CONST.CHAT_MESSAGE_STYLES.OTHER,
            content: message,
        };

        await Promise.all([ChatMessage.create(chatData), ui.notifications.error(message)]);

        return true;
    }

    return false;
}

async function migrateToVersion(migratesToVersion, lastMigration, queue, queueType, asyncFn) {
    if (!lastMigration || foundry.utils.isNewerVersion(migratesToVersion, lastMigration)) {
        const originalTotal = queue.length;
        const migrationProgressBar = new HeroProgressBar(
            `Migrating ${originalTotal} ${queueType} to ${migratesToVersion}`,
            originalTotal + 1,
        );

        while (queue.length > 0) {
            const queueElement = queue.pop();

            migrationProgressBar.advance(
                `Migrating ${queueType} ${originalTotal - queue.length} of ${originalTotal} to ${migratesToVersion}`,
            );

            await asyncFn(queueElement);
        }

        migrationProgressBar.close(`Done migrating ${originalTotal} ${queueType} to ${migratesToVersion}`);
    }
}

export async function migrateWorld() {
    if (await willNotMigrate()) return;

    // Chat Card for GM about new version
    const content = `Version ${
        game.system.version
    } of <a href="https://github.com/dmdorman/hero6e-foundryvtt/blob/main/README.md">${
        game.system.title || game.system.name
    }</a> has been installed. Details about recent changes can be viewed at <a href="https://github.com/dmdorman/hero6e-foundryvtt/blob/main/CHANGELOG.md">CHANGELOG</a>.<br><br>If you find any problems, are missing things, or just would like a feature that is lacking, please report these <a href="https://github.com/dmdorman/hero6e-foundryvtt/issues">HERE</a>.<br><br>Check out our <a href="https://www.youtube.com/channel/UCcmq0WFFNZNhRSGwuEHOgRg">YouTube channel</a>.  There is also a <a href="https://discord.com/channels/609528652878839828/770825017729482772">Discord channel</a> where you can interactively communicate with others using <a href="https://github.com/dmdorman/hero6e-foundryvtt/blob/main/README.md">${
        game.system.title || game.system.name
    }</a>.`;
    const chatData = {
        author: game.user._id,
        style: CONST.CHAT_MESSAGE_STYLES.OTHER,
        content: content,
    };
    await ChatMessage.create(chatData);

    // Create or recreate Compendiums
    CreateHeroCompendiums();

    // Rebuild the database for all actors by recreating actors and all all their items (description, cost, etc)
    await migrateToVersion(
        game.system.version,
        undefined,
        getAllActorsInGame(),
        "rebuilding actors and their items",
        async (actor) => await rebuildActors(actor),
    );

    await ui.notifications.info(`Migration complete to ${game.system.version}`);
}

async function rebuildActors(actor) {
    try {
        if (!actor) return false;

        const itemsChanged = false;
        for (let item of actor.items) {
            await item._postUpload();
        }

        if (itemsChanged || !actor.system.pointsDetail) {
            const oldPointsDetail = actor.system.pointsDetail;
            await actor.CalcActorRealAndActivePoints();
            if (oldPointsDetail !== actor.system.pointsDetail) {
                await actor.update(
                    {
                        "system.points": actor.system.points,
                        "system.activePoints": actor.system.activePoints,
                        "system.pointsDetail": actor.system.pointsDetail,
                    },
                    { render: false },
                    { hideChatMessage: true },
                );
            }
        }

        actor._postUpload();
    } catch (e) {
        console.log(e);
        if (game.user.isGM && game.settings.get(game.system.id, "alphaTesting")) {
            await ui.notifications.warn(`Migration failed for ${actor?.name}. Recommend re-uploading from HDC.`);
        }
    }
}
