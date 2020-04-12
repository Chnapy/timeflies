import { BattleSnapshot, BRunLaunchSAction, SpellActionCAction, ConfirmSAction, MapConfig, NotifySAction, getBattleSnapshotWithHash } from '@timeflies/shared';
import { Team } from '../../Team';
import { BRCharActionChecker } from './BRCharActionChecker';
import { BRMap } from "./BRMap";
import { BRState } from './BRState';
import { BRCycle } from "./cycle/BRCycle";
import { BCharacter } from "./entities/BCharacter";
import { BPlayer } from "./entities/BPlayer";
import { BTeam } from "./entities/BTeam";

const LAUNCH_DELAY = 5000; // TODO use config system

export class BattleRunRoom {

    private readonly mapConfig: MapConfig;

    private readonly players: BPlayer[];

    private readonly teams: BTeam[];
    private readonly characters: BCharacter[];

    map!: BRMap;

    private launchTime!: number;

    private charActionChecker!: BRCharActionChecker;
    private cycle!: BRCycle;
    private state!: BRState;

    private battleHashList: string[];

    constructor(
        mapConfig: MapConfig,
        teams: Team[]
    ) {
        this.mapConfig = mapConfig;
        this.teams = teams.map(t => new BTeam(t));
        this.players = this.teams.flatMap(t => t.players);
        this.characters = this.players.flatMap(p => p.characters);
        this.battleHashList = [];
    }

    init(): void {
        this.map = new BRMap(this.mapConfig);
        const { initPositions } = this.map;
        this.teams.forEach((team, i) => {
            team.placeCharacters(initPositions[ i ]);
        });
    }

    start(): void {
        this.launchTime = Date.now() + LAUNCH_DELAY;

        this.cycle = new BRCycle(this.players, this.characters, this.launchTime);
        this.charActionChecker = new BRCharActionChecker(this.cycle, this.map);
        this.state = new BRState(this.cycle, this.characters);

        const battleSnapshot = this.generateSnapshot();

        this.battleHashList.push(battleSnapshot.battleHash);

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot,
            globalTurnState: this.cycle.globalTurn.toSnapshot()
        };

        this.players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));

        this.players.forEach(p => {
            const onReceive = this.onSpellActionReceive(p);
            p.socket.on<SpellActionCAction>('battle/spellAction', onReceive);
        });
    }

    private onSpellActionReceive(player: BPlayer) {
        return (action: SpellActionCAction): void => {

            const isOk = this.charActionChecker.check(action, player).success;

            const lastCorrectHash = this.battleHashList[ this.battleHashList.length - 1 ];

            const confirmAction: ConfirmSAction = {
                type: 'confirm',
                sendTime: action.sendTime,
                isOk,
                lastCorrectHash
            };

            player.socket.send<ConfirmSAction>(confirmAction);

            if (confirmAction.isOk) {
                this.state.applyCharAction(action.spellAction);
                this.players
                    .filter(p => p.id !== player.id)
                    .forEach(p => p.socket.send<NotifySAction>({
                        type: 'notify',
                        spellActionSnapshot: action.spellAction,
                    }));
            }
        };
    }

    private generateSnapshot(): BattleSnapshot {

        return getBattleSnapshotWithHash({
            time: this.launchTime,
            launchTime: this.launchTime,
            teamsSnapshots: this.teams.map(team => team.toSnapshot())
        });
    }
}
