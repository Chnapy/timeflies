import { OmitFn } from '@timeflies/shared';
import { PlayerData } from '../../../../PlayerData';
import { WSSocket } from '../../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../../transport/ws/WSSocket.seed';
import { Character } from '../character/Character';
import { seedTeam } from '../team/Team.seed';
import { Player } from './Player';

describe('# Player', () => {

    it('should update from snapshot correctly', () => {

        const team = seedTeam();

        const staticData: PlayerData = {
            id: 'p1',
            name: 'p-1',
            socket: new WSSocket(seedWebSocket()),
            state: 'battle-ready',
            staticCharacters: [ { id: 'c1' } as any ]
        };

        const updateFromSnapshot = jest.fn();

        const characterCreator: typeof Character = () => ({
            updateFromSnapshot
        } as any);

        const player = Player(staticData, team, { characterCreator });

        player.updateFromSnapshot({
            id: 'p1',
            name: 'p-1',
            charactersSnapshots: [ { id: 'c1' } as any ]
        });

        expect(player).toMatchObject<OmitFn<Player, 'team' | 'socket' | 'characters'>>({
            id: 'p1',
            name: 'p-1'
        });
        expect(updateFromSnapshot).toHaveBeenCalledTimes(1);
    });
});
