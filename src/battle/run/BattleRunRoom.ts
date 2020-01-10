import { BCharacter, Orientation, Position } from "../../shared/Character";
import { BPlayer } from "../../shared/Player";
import { BTeam, Team } from "../../shared/Team";
import { TAction } from "../../transport/ws/WSSocket";
import { MapInfos } from "../../shared/MapInfos";


export interface BRunLaunchSAction extends TAction<'battle-run/launch'> {
    launchTime: number;
    turnState: {
        charactersPositions: {
            [k: string]: { // char ID
                position: Position;
                orientation: Orientation;
            };
        };
        order: string[]; // char IDs

    }
}

export interface BRunGlobalTurnStartSAction extends TAction<'battle-run/global-turn-start'> {
    startTime: number;
    turnState: {
        order: string[]; // char IDs
    };
}

export type BattleRunSAction =
    | BRunLaunchSAction
    | BRunGlobalTurnStartSAction;

export type BattleRunCAction = never;

const LAUNCH_DELAY = 5000;

export class BattleRunRoom {

    private readonly mapInfos: MapInfos;

    private readonly players: BPlayer[];

    private readonly teams: BTeam[];
    private readonly characters: BCharacter[];

    private launchTime!: number;

    constructor(
        mapInfos: MapInfos,
        teams: Team[]
    ) {
        this.mapInfos = mapInfos;
        this.teams = teams.map(t => new BTeam(t));
        this.players = this.teams.flatMap(t => t.players);
        this.characters = this.players.flatMap(p => p.characters);
    }

    init(): void {
        this.computeMap();
    }

    start(): void {
        this.launchTime = Date.now() + LAUNCH_DELAY;

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            launchTime: this.launchTime,
            turnState: {
                charactersPositions: {
                    // TODO
                },
                order: this.characters.map(c => c.staticData.id)
            }
        };

        this.players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));
    }

    private computeMap(): void {
        const {urls: {schema}, obstaclesLayerKey} = this.mapInfos;

        import('./' + schema).then(data => {
            console.log('data', data);
        });
    }
}
