import { OmitFn } from '@timeflies/shared';
import util from 'util';
import { TeamData } from '../../../../TeamData';
import { Player } from '../player/Player';
import { Team } from './Team';

describe('# Team', () => {

    it('should update from snapshot correctly', () => {

        const staticData: TeamData = {
            id: 'p1',
            name: 'p-1',
            color: 'red',
            players: [ { id: 'p1' } as any ]
        };

        const updateFromSnapshot = jest.fn();

        const playerCreator: typeof Player = () => ({
            characters: [],
            updateFromSnapshot
        } as any);

        const team = Team(staticData, { playerCreator });

        team.updateFromSnapshot({
            id: 'p1',
            name: 'p-1',
            color: 'red',
            playersSnapshots: [ { id: 'p1' } as any ]
        });

        expect(team).toMatchObject<OmitFn<Team, 'players' | 'characters'>>({
            id: 'p1',
            name: 'p-1',
            color: 'red',
        });
        expect(updateFromSnapshot).toHaveBeenCalledTimes(1);
    });

    it('should clone correctly', () => {

        const staticData: TeamData = {
            id: 'p1',
            name: 'p-1',
            color: 'red',
            players: [ { id: 'p1' } as any ]
        };

        const playerCreator: typeof Player = () => ({
            characters: [],
            toSnapshot() { return { id: 'p1' } as any },
            updateFromSnapshot: () => { },
        } as any);

        const team = Team(staticData, { playerCreator });

        const clone = team.clone();

        expect(clone).not.toBe(team);
        expect(clone.players[ 0 ]).not.toBe(team.players[ 0 ]);
        
        // Note that toEqual() cannot be used because of jest issue
        // https://github.com/facebook/jest/issues/8475
        expect(util.inspect(clone)).toBe(util.inspect(team));
    });
});
