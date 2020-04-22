import { BattleDataKey, BattleDataMap } from '../BattleData';
import { serviceSelector } from './serviceSelector';
import { GameStateStep } from '../game-state';

function assertIsStateBattle(step: GameStateStep, battle: BattleDataMap | null): asserts battle is BattleDataMap {
    if (step !== 'battle' ?? battle === null) {
        throw new TypeError('should be state "battle"');
    }
};

export const serviceBattleData = <B extends BattleDataKey, K extends keyof BattleDataMap[ B ]>(battleKey: B) => serviceSelector<Pick<BattleDataMap[ B ], K>>(({ step, battle }) => {
    assertIsStateBattle(step, battle);
    return battle[ battleKey ];
});
