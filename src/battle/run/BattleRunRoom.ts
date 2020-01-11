import { BattleSnapshot, GlobalTurnState } from "../../shared/BattleSnapshot";
import { BCharacter } from "../../shared/Character";
import { MapInfos } from "../../shared/MapInfos";
import { BPlayer } from "../../shared/Player";
import { BTeam, Team } from "../../shared/Team";
import { TAction } from "../../transport/ws/WSSocket";
import { BRMap } from "./BRMap";

export interface BRunLaunchSAction extends TAction<'battle-run/launch'> {
    battleSnapshot: BattleSnapshot;
}

export interface BRunGlobalTurnStartSAction extends TAction<'battle-run/global-turn-start'> {
    globalTurnState: GlobalTurnState;
}

export type BattleRunSAction =
    | BRunLaunchSAction
    | BRunGlobalTurnStartSAction;

export type BattleRunCAction = never;

const LAUNCH_DELAY = 5000; // TODO use config system

export class BattleRunRoom {

    private readonly mapInfos: MapInfos;

    private readonly players: BPlayer[];

    private readonly teams: BTeam[];
    private readonly characters: BCharacter[];

    private map!: BRMap;

    private launchTime!: number;

    private globalTurnState!: GlobalTurnState;

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
        this.map = new BRMap(this.mapInfos);
        const { initPositions } = this.map;
        this.teams.forEach((team, i) => {
            team.placeCharacters(initPositions[i]);
        });
    }

    start(): void {
        this.launchTime = Date.now() + LAUNCH_DELAY;

        this.globalTurnState = {
            startTime: this.launchTime,
            order: this.characters.map(c => c.staticData.id)
        };

        const battleSnapshot = this.generateSnapshot();

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot
        };

        this.players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));
    }

    private generateSnapshot(): BattleSnapshot {

        return {
            launchTime: this.launchTime,
            globalTurnState: this.globalTurnState,
            teamsSnapshots: this.teams.map(team => team.toSnapshot())
        };
    }
}
