import { BattleSnapshot, BRunLaunchSAction, ConfirmSAction, getBattleSnapshotWithHash, MapConfig, NotifySAction, SpellActionCAction, BRunEndSAction } from '@timeflies/shared';
import { TeamData } from '../../TeamData';
import { BattleState } from './BattleState';
import { Cycle } from "./cycle/Cycle";
import { Character } from "./entities/Character";
import { Player } from "./entities/Player";
import { Team } from "./entities/Team";
import { MapManager } from "./MapManager";
import { SpellActionChecker } from './SpellActionChecker';

const LAUNCH_DELAY = 5000; // TODO use config system

export interface BattleRunRoom {
    start(): void;
}

export const BattleRunRoom = (mapConfig: MapConfig, teamsData: TeamData[]): BattleRunRoom => {

    const teams: Team[] = teamsData.map(Team);
    const players: Player[] = teams.flatMap(t => t.players);
    const characters: Character[] = players.flatMap(p => p.characters);
    const battleHashList: string[] = [];

    const map = MapManager(mapConfig);
    const { initPositions } = map;
    teams.forEach((team, i) => {
        team.placeCharacters(initPositions[ i ]);
    });

    const cycle = Cycle(players, characters);
    const spellActionChecker = SpellActionChecker(cycle, map);
    const state = BattleState(cycle, characters);

    players.forEach(p => p.socket.onClose(() => {
        console.log('Player disconnect:', p.id, p.socket.isConnected);
        checkDeathsAndDisconnects();
    }));

    const start = (): void => {
        const launchTime = Date.now() + LAUNCH_DELAY;

        const battleSnapshot = generateSnapshot(launchTime, launchTime);

        battleHashList.push(battleSnapshot.battleHash);

        cycle.start(launchTime);

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot,
            globalTurnState: cycle.globalTurn.toSnapshot()
        };

        players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));

        players.forEach(p => {
            const onReceive = getOnSpellActionReceive(p);
            p.socket.on<SpellActionCAction>('battle/spellAction', onReceive);
        });
    };

    const getOnSpellActionReceive = (player: Player) => {
        return (action: SpellActionCAction): void => {

            const isCheckSuccess = spellActionChecker.check(action, player).success;

            const sendConfirmAction = (isOk: boolean, lastCorrectHash: string): void => {

                player.socket.send<ConfirmSAction>({
                    type: 'confirm',
                    isOk,
                    lastCorrectHash
                });
            };

            console.log('isCheckSuccess', isCheckSuccess);

            if (isCheckSuccess) {

                // TODO test on a copy before doing it on current data
                const deaths = state.applySpellAction(action.spellAction);

                const snap = generateSnapshot(-1, -1);

                const isOk = action.spellAction.battleHash === snap.battleHash;

                if (isOk) {

                    battleHashList.push(snap.battleHash);

                    sendConfirmAction(true, snap.battleHash);

                    players
                        .filter(p => p.id !== player.id)
                        .forEach(p => p.socket.send<NotifySAction>({
                            type: 'notify',
                            spellActionSnapshot: action.spellAction,
                        }));

                    notifyDeaths(deaths)

                    return;
                }
            }

            const lastCorrectHash = battleHashList[ battleHashList.length - 1 ];

            sendConfirmAction(false, lastCorrectHash);
        };
    };

    const generateSnapshot = (launchTime: number, time: number): BattleSnapshot => {

        return getBattleSnapshotWithHash({
            time,
            launchTime,
            teamsSnapshots: teams.map(team => team.toSnapshot())
        });
    };

    const notifyDeaths = (deaths: Character[]): void => {
        if (!deaths.length) {
            return;
        }

        cycle.globalTurn.notifyDeaths();

        checkDeathsAndDisconnects();
    };

    const checkDeathsAndDisconnects = () => {
        const teamsRemains = teams.filter(t =>
            t.players.some(p => p.socket.isConnected)
            && t.characters.some(c => c.isAlive)
        );
        if (teamsRemains.length === 1) {
            endBattle(teamsRemains[ 0 ]);
        }
    };

    const endBattle = (team: Team): void => {
        cycle.stop();
        players.forEach(p => p.socket.clearBattleListeners());
        players.forEach(p => p.socket.send<BRunEndSAction>({
            type: 'battle-run/end',
            winnerTeamId: team.id
        }));

        console.log('\n---');
        console.log(`Battle ended. Team ${team.name} wins !`);
        console.log('---\n');
    };

    return {
        start
    };
};
