import { BRunGlobalTurnStartSAction, BRunTurnStartSAction } from "../../../shared/action/BattleRunAction";
import { BCharacter } from "../entities/BCharacter";
import { GLOBALTURN_DELAY } from "../../../shared/GlobalTurnSnapshot";
import { BGlobalTurn } from "./turn/BGlobalTurn";
import { BPlayer } from "../entities/BPlayer";
import { TurnIDGenerator, getTurnIdGenerator } from "../../../shared/getTurnIdGenerator";

export class BRCycle {

    private generateGlobalTurnId: TurnIDGenerator = getTurnIdGenerator();
    private generateTurnId: TurnIDGenerator = getTurnIdGenerator();

    private readonly players: readonly BPlayer[];
    private readonly characters: readonly BCharacter[];

    globalTurn: BGlobalTurn;

    constructor(players: readonly BPlayer[], characters: readonly BCharacter[], launchTime: number) {
        this.players = players;
        this.characters = characters;
        this.globalTurn = this.newGlobalTurn(launchTime, false);
    }

    private newGlobalTurn(startTime: number, send: boolean = true): BGlobalTurn {

        const globalTurn: BGlobalTurn = new BGlobalTurn(this.generateGlobalTurnId(), startTime, [...this.characters], this.generateTurnId, this.onGlobalTurnEnd, this.onTurnStart);

        // console.log('globalTurn', globalTurn);

        if (send) {
            const snapshot = globalTurn.toSnapshot();
            this.players.forEach(p => {
                p.socket.send<BRunGlobalTurnStartSAction>({
                    type: 'battle-run/global-turn-start',
                    globalTurnState: snapshot
                });
            });
        }

        return globalTurn;
    }

    private onTurnStart = (): void => {

        const snapshot = this.globalTurn.currentTurn.toSnapshot();
        this.players.forEach(p => {
            p.socket.send<BRunTurnStartSAction>({
                type: 'battle-run/turn-start',
                turnState: snapshot
            });
        });
    };

    private onGlobalTurnEnd = (): void => {
        console.log('C-GT-ONEND', this.globalTurn.currentTurn.endTime);
        this.globalTurn = this.newGlobalTurn(this.globalTurn.currentTurn.endTime + GLOBALTURN_DELAY);
    };
}
