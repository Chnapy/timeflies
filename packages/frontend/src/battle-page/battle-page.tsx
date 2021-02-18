import React from 'react';
import { useParams } from 'react-router-dom';
import { useGameSelector } from '../store/hooks/use-game-selector';
import { BattleView } from './battle-view';
import { useBattleLoad } from './loading/hooks/use-battle-load';
import { BattleLoading } from './loading/view/battle-loading';

type BattlePageParams = {
    battleId: string;
};

export const BattlePage: React.FC = () => {
    const { battleId } = useParams<BattlePageParams>();
    const hasBattleData = useGameSelector(state => state.battle !== null);

    const { isLoading, errorCode } = useBattleLoad(battleId);

    if (hasBattleData) {
        return <BattleView />;
    }

    return (
        <div>
            <div>Battle page</div>
            <div>Battle ID: {battleId}</div>
            {isLoading && <BattleLoading />}
            {errorCode && <div>Error {errorCode}</div>}
        </div>
    );
};
