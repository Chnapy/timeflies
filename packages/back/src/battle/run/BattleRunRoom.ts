import { BRunEndSAction, BRunLaunchSAction, MapConfig, SpellActionCAction } from '@timeflies/shared';
import { TeamData } from '../../TeamData';
import { BattleStateManager } from './battleStateManager/BattleStateManager';
import { Cycle } from "./cycle/Cycle";
import { Team } from "./entities/team/Team";
import { MapManager } from "./mapManager/MapManager";
import { SpellActionReceiver } from './spellActionReceiver/SpellActionReceiver';

const LAUNCH_DELAY = 5000; // TODO use config system

export interface BattleRunRoom {
    start(): void;
}

export const BattleRunRoom = (mapConfig: MapConfig, teamsData: TeamData[]): BattleRunRoom => {

    const start = (): void => {
        const launchTime = Date.now() + LAUNCH_DELAY;

        const battleSnapshot = stateManager.generateFirstSnapshot(launchTime);

        cycle.start(launchTime);

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot,
            globalTurnState: cycle.globalTurn.toSnapshot()
        };

        players.forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));

        players.forEach(p => {
            p.socket.on<SpellActionCAction>('battle/spellAction', spellActionReceiver.getOnReceive(p));
        });
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

    const stateManager = BattleStateManager(
        teamsData.map(td => Team(td))
    );
    
    const { battleState } = stateManager;
    const { teams, players } = battleState;

    const mapManager = MapManager(mapConfig);
    const { initPositions } = mapManager;
    teams.forEach((team, i) => {
        team.placeCharacters(initPositions[ i ]);
    });

    const cycle = Cycle(battleState);

    const spellActionReceiver = SpellActionReceiver({
        stateManager,
        cycle,
        mapManager,
        checkDeathsAndDisconnects
    });

    players.forEach(p => p.socket.onClose(() => {
        console.log('Player disconnect:', p.id, p.socket.isConnected);
        checkDeathsAndDisconnects();
    }));

    return {
        start
    };
};
