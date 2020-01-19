import { BRunLaunchSAction, CharActionCAction, ConfirmSAction, NotifySAction, BRunTurnStartSAction, BRunGlobalTurnStartSAction } from "../../shared/action/BattleRunAction";
import { BattleSnapshot, BGlobalTurnState, BTurnState } from "../../shared/BattleSnapshot";
import { BCharacter } from "../../shared/Character";
import { MapInfos } from "../../shared/MapInfos";
import { BPlayer } from "../../shared/Player";
import { BTeam, Team } from "../../shared/Team";
import { BRCharActionChecker } from './BRCharActionChecker';
import { BRMap } from "./BRMap";

const LAUNCH_DELAY = 5000; // TODO use config system

export class BattleRunRoom {

    private readonly mapInfos: MapInfos;

    private readonly players: BPlayer[];

    private readonly teams: BTeam[];
    private readonly characters: BCharacter[];

    map!: BRMap;

    private launchTime!: number;

    globalTurnState!: BGlobalTurnState;

    private readonly charActionChecker: BRCharActionChecker;

    constructor(
        mapInfos: MapInfos,
        teams: Team[]
    ) {
        this.mapInfos = mapInfos;
        this.teams = teams.map(t => new BTeam(t));
        this.players = this.teams.flatMap(t => t.players);
        this.characters = this.players.flatMap(p => p.characters);
        this.charActionChecker = new BRCharActionChecker(this);
    }

    init(): void {
        this.map = new BRMap(this.mapInfos);
        const { initPositions } = this.map;
        this.teams.forEach((team, i) => {
            team.placeCharacters(initPositions[ i ]);
        });
    }

    start(): void {
        this.launchTime = Date.now() + LAUNCH_DELAY;

        const battleSnapshot = this.generateSnapshot();

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot
        };

        this.players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));
        this.players.forEach(p => {
            p.socket.on<CharActionCAction>('charAction', action => this.onCharActionReceive(action, p));
        });

        this.startGlobalTurn(this.launchTime);
    }

    startGlobalTurn(startTime: number): void {
        this.globalTurnState = {
            startTime,
            charactersOrdered: [ ...this.characters ],
            currentTurn: null as any // will be reset
        };

        this.players.forEach(p => {
            p.socket.send<BRunGlobalTurnStartSAction>({
                type: 'battle-run/global-turn-start',
                globalTurnState: {
                    startTime: this.globalTurnState.startTime,
                    order: this.globalTurnState.charactersOrdered.map(c => c.staticData.id)
                }
            })
        });

        this.startTurn(startTime, this.globalTurnState.charactersOrdered[ 0 ]);
    }

    startTurn(startTime: number, character: BCharacter): void {

        const currentTurn: BTurnState = {
            startTime,
            character,
            estimatedDuration: character.features.actionTime
        };

        this.globalTurnState.currentTurn = currentTurn;

        const timeDiff = startTime - Date.now();

        setTimeout(() => {
            const { charactersOrdered } = this.globalTurnState;
            const characterIndex = charactersOrdered
                .findIndex(c => c.staticData.id === character.staticData.id);
            const nextCharacter = charactersOrdered[ characterIndex + 1 ];

            const now = Date.now();
            if (!nextCharacter) {
                this.startGlobalTurn(now);
            } else {
                this.startTurn(now, nextCharacter);
            }

        }, timeDiff + currentTurn.estimatedDuration);

        this.players.forEach(p => {
            p.socket.send<BRunTurnStartSAction>({
                type: 'battle-run/turn-start',
                turnState: {
                    startTime: currentTurn.startTime,
                    characterId: currentTurn.character.staticData.id
                }
            })
        });
    }

    private readonly onCharActionReceive = (action: CharActionCAction, player: BPlayer): void => {

        const isOk = this.charActionChecker.check(action, player);

        const confirmAction: ConfirmSAction = {
            type: 'confirm',
            sendTime: action.sendTime,
            isOk
        };

        player.socket.send<ConfirmSAction>(confirmAction);

        if (confirmAction.isOk) {
            this.players
                .filter(p => p.id !== player.id)
                .forEach(p => p.socket.send<NotifySAction>({
                    type: 'notify',
                    charAction: action.charAction,
                    startTime: action.sendTime
                }));
        }
    };

    private generateSnapshot(): BattleSnapshot {

        return {
            launchTime: this.launchTime,
            teamsSnapshots: this.teams.map(team => team.toSnapshot())
        };
    }
}
