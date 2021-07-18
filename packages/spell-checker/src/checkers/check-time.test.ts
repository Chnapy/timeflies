import { createPosition } from '@timeflies/common';
import { CheckerParams } from '../checker';
import { checkTime } from './check-time';

describe('check time', () => {

    it('fail on wrong start time', () => {

        const checkerParams: CheckerParams = {
            spellAction: {
                spellId: 's1',
                launchTime: 100,
                targetPos: createPosition(0, 0),
                duration: 200,
                checksum: ''
            },
            context: {
                state: null as any,
                staticState: null as any,
                currentTurn: {
                    playerId: 'p1',
                    characterId: 'c1',
                    startTime: 200
                },
                map: null as any,
                clientContext: null as any
            },
            newState: null as any
        };

        expect(checkTime(checkerParams)).toEqual(false);
    });

    it('fail on duration too long', () => {
        
        const checkerParams: CheckerParams = {
            spellAction: {
                spellId: 's1',
                launchTime: 100,
                targetPos: createPosition(0, 0),
                duration: 1000,
                checksum: ''
            },
            context: {
                state: {
                    checksum: '',
                    time: 0,
                    characters: {
                        actionTime: {
                            c1: 1000
                        }
                    } as any,
                    spells: null as any
                },
                staticState: null as any,
                currentTurn: {
                    playerId: 'p1',
                    characterId: 'c1',
                    startTime: 0
                },
                map: null as any,
                clientContext: null as any
            },
            newState: null as any
        };

        expect(checkTime(checkerParams)).toEqual(false);
    });

    it('succeed otherwise', () => {
        
        const checkerParams: CheckerParams = {
            spellAction: {
                spellId: 's1',
                launchTime: 1100,
                targetPos: createPosition(0, 0),
                duration: 800,
                checksum: ''
            },
            context: {
                state: {
                    checksum: '',
                    time: 0,
                    characters: {
                        actionTime: {
                            c1: 1000
                        }
                    } as any,
                    spells: null as any
                },
                staticState: null as any,
                currentTurn: {
                    playerId: 'p1',
                    characterId: 'c1',
                    startTime: 1000
                },
                map: null as any,
                clientContext: null as any
            },
            newState: null as any
        };

        expect(checkTime(checkerParams)).toEqual(true);
    });
});
