import { assertIsDefined, BRunEndSAction, BRunLaunchSAction, SpellActionCAction, DeepReadonly } from '@timeflies/shared';
import { PlayerData } from '../../PlayerData';
import { TeamData } from '../../TeamData';
import { WSSocket } from '../../transport/ws/WSSocket';
import { IPlayerRoomData } from '../room/room';
import { RoomState } from '../room/room-state-manager';
import { BattleStateManager } from './battleStateManager/BattleStateManager';
import { createStaticCharacter } from './createStaticCharacter';
import { Cycle } from "./cycle/Cycle";
import { Team } from "./entities/team/Team";
import { MapManager } from "./mapManager/MapManager";
import { SpellActionReceiver } from './spellActionReceiver/SpellActionReceiver';

const LAUNCH_DELAY = 5000; // TODO use config system

type RoomKeys = keyof Pick<RoomState, 'id' | 'playerList' | 'teamList' | 'mapSelected'>;

export type RoomStateReady = DeepReadonly<{
    [ K in RoomKeys ]: Exclude<RoomState[ K ], null>;
} & {
    playerDataList: IPlayerRoomData<WSSocket>[];
}>;

export interface BattleRunRoom {
    start(): void;
}

export const BattleRunRoom = ({ mapSelected, teamList, playerDataList, playerList }: RoomStateReady): BattleRunRoom => {

    const teamsData: TeamData[] = teamList.map((t): TeamData => {

        return {
            id: t.id,
            name: t.letter,
            color: '',
            players: t.playersIds.map((pid): PlayerData => {
                const playerData = playerDataList.find(p => p.id === pid);
                const player = playerList.find(p => p.id === pid);

                assertIsDefined(playerData);
                assertIsDefined(player);

                const socket = playerData.socket.createPool();

                return {
                    id: pid,
                    name: player.name,
                    socket,
                    staticCharacters: player.characters.map((c) => {

                        return {
                            staticData: createStaticCharacter(c.id, c.type),
                            initialPosition: c.position
                        };
                    })
                };
            })
        }
    });

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
        players.forEach(p => p.socket.send<BRunEndSAction>({
            type: 'battle-run/end',
            winnerTeamId: team.id
        }));
        players.forEach(p => p.socket.close());

        console.log('\n---');
        console.log(`Battle ended. Team ${team.name} wins !`);
        console.log('---\n');
    };

    const stateManager = BattleStateManager(
        teamsData.map(td => Team(td))
    );

    const { battleState } = stateManager;
    const { teams, players } = battleState;

    const mapManager = MapManager(mapSelected.config);

    const cycle = Cycle(battleState);

    const spellActionReceiver = SpellActionReceiver({
        stateManager,
        cycle,
        mapManager,
        checkDeathsAndDisconnects
    });

    players.forEach(p => p.socket.onDisconnect(() => {
        console.log('Player disconnect:', p.id, p.socket.isConnected);
        checkDeathsAndDisconnects();
    }));

    return {
        start
    };
};
