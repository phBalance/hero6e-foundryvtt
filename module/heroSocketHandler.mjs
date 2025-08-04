export class HeroSocketHandler {
    static Initialize() {
        HeroSocketHandler.registerSocketHandlers();
    }

    static registerSocketHandlers() {
        // game.socket.emit(`system.${game.system.id}`, {
        //     operation: ,
        //     userId: game.user.id,
        //     token:
        //     actor:
        // });

        game.socket.on(`system.${game.system.id}`, async (data) => {
            const user = User.get(data.userId);
            console.log(`HeroSocketHandler ${data.operation} for ${user.name}`, data);
            switch (data.operation) {
                case "nextHeroCombatantSingle":
                    if (game.user !== game.users.activeGM) return;
                    await game.combat.nextHeroCombatantSingle();
                    break;
                case "nextRound":
                    if (game.user !== game.users.activeGM) return;
                    await game.combat.nextRound();
                    break;
                case "nextTurn":
                    if (game.user !== game.users.activeGM) return;
                    await game.combat.nextTurn();
                    break;
                case "previousTurn":
                    if (game.user !== game.users.activeGM) return;
                    await game.combat.previousTurn();
                    break;

                default: {
                    throw new Error(`unhandled operation ${data?.operation}`);
                }
            }
        });
    }
}
