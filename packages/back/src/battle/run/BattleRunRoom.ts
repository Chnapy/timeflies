import { BRunEndSAction, BRunLaunchSAction, SpellActionCAction } from '@timeflies/shared';
import { WSSocket } from '../../transport/ws/WSSocket';
import { IPlayerRoomData } from '../room/room';
import { RoomState } from '../room/room-state-manager';
import { BattleStateManager } from './battleStateManager/BattleStateManager';
import { Cycle } from "./cycle/Cycle";
import { Team } from "./entities/team/Team";
import { MapManager } from "./mapManager/MapManager";
import { SpellActionReceiver } from './spellActionReceiver/SpellActionReceiver';
import { characterIsAlive } from './entities/character/Character';

const LAUNCH_DELAY = 5000; // TODO use config system

type RoomKeys = keyof Pick<RoomState, 'id' | 'playerList' | 'teamList' | 'mapSelected'>;

export type RoomStateReady = {
    [ K in RoomKeys ]: Exclude<RoomState[ K ], null>;
} & {
    playerDataList: IPlayerRoomData<WSSocket>[];
};

export interface BattleRunRoom {
    start(): void;
}

export const BattleRunRoom = ({ mapSelected, teamList, playerDataList, playerList }: RoomStateReady): BattleRunRoom => {

    const start = (): void => {
        const launchTime = Date.now() + LAUNCH_DELAY;

        const battleSnapshot = stateManager.generateFirstSnapshot(launchTime);

        cycle.start(launchTime);

        const launchAction: Omit<BRunLaunchSAction, 'sendTime'> = {
            type: 'battle-run/launch',
            battleSnapshot,
            globalTurnState: cycle.globalTurn.toSnapshot()
        };

        get('players').forEach(p => p.socket.send<BRunLaunchSAction>(launchAction));

        get('players').forEach(p => {
            p.socket.on<SpellActionCAction>('battle/spellAction', spellActionReceiver.getOnReceive(p));
        });
    };

    const checkDeathsAndDisconnects = () => {
        const charactersAlivePlayerIds = get('characters')
            .filter(characterIsAlive)
            .map(c => c.playerId);

        const connectedPlayerTeamIds = get('players')
            .filter(p => p.socket.isConnected())
            .filter(p => charactersAlivePlayerIds.includes(p.id))
            .map(p => p.teamId);

        const remainingTeams = new Set(connectedPlayerTeamIds);

        if (remainingTeams.size === 1) {
            const { value } = remainingTeams.values().next();
            const teamWinner = get('teams').find(t => t.id === value)!;

            endBattle(teamWinner);
        }
    };

    const endBattle = (team: Team): void => {
        cycle.stop();
        get('players').forEach(p => p.socket.send<BRunEndSAction>({
            type: 'battle-run/end',
            winnerTeamId: team.id
        }));
        get('players').forEach(p => p.socket.close());

        console.log('\n---');
        console.log(`Battle ended. Team ${team.letter} wins !`);
        console.log('---\n');
    };

    const stateManager = BattleStateManager(
        playerDataList,
        teamList,
        playerList
    );

    const { get } = stateManager;

    const mapManager = MapManager(mapSelected.config);

    const cycle = Cycle(get);

    const spellActionReceiver = SpellActionReceiver({
        stateManager,
        cycle,
        mapManager,
        checkDeathsAndDisconnects
    });

    get('players').forEach(p => p.socket.onDisconnect(() => {
        console.log('Player disconnect:', p.id, p.socket.isConnected());
        checkDeathsAndDisconnects();
    }));

    return {
        start
    };
};
