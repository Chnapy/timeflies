import { seedCycle } from '../cycle/Cycle.seed';
import { seedMapManager } from '../mapManager/MapManager.seed';
import { CheckerCreator, SpellActionChecker } from './SpellActionChecker';

describe('# SpellActionChecker', () => {

    it('should run all checkers until it fails', () => {

        const cycle = seedCycle();

        const mapManager = seedMapManager();

        let nbrCalls = 0;

        const checkersCreators: CheckerCreator[] = ([
            { success: true },
            { success: true },
            { success: false, reason: 'spell' },
            { success: true },
            { success: true },
        ] as const).map(r => () => () => {
            nbrCalls++;
            return r;
        });

        const checker = SpellActionChecker(cycle, mapManager, { checkersCreators });

        expect(checker.check({} as any, {} as any)).toEqual({ success: false, reason: 'spell' });
        expect(nbrCalls).toBe(3);
    });

    it('should run all checkers on success', () => {

        const cycle = seedCycle();

        const mapManager = seedMapManager();

        let nbrCalls = 0;

        const checkersCreators: CheckerCreator[] = ([
            { success: true },
            { success: true },
            { success: true },
            { success: true },
            { success: true },
        ] as const).map(r => () => () => {
            nbrCalls++;
            return r;
        });

        const checker = SpellActionChecker(cycle, mapManager, { checkersCreators });

        expect(checker.check({} as any, {} as any)).toEqual({ success: true });
        expect(nbrCalls).toBe(5);
    });

});
