import { BattleDataKey, BattleDataMap } from '../BattleData';
import { UIStateBattle, UIStateData } from "../ui/UIState";
import { serviceSelector } from './serviceSelector';

function assertIsStateBattle(data: UIStateData): asserts data is UIStateBattle {
    if (data.state !== 'battle') {
        throw new TypeError('should be state "battle"');
    }
};

export const serviceBattleData = <B extends BattleDataKey, K extends keyof BattleDataMap[ B ]>(battleKey: B) => serviceSelector<Pick<BattleDataMap[ B ], K>>(({ data }) => {
    assertIsStateBattle(data);
    return data.battleData[ battleKey ];
});
