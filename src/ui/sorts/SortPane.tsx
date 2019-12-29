import React from 'react';
import { connect } from 'react-redux';
import { UIState } from '../UIState';
import { Sort } from '../../phaser/entities/Sort';
import { SortBtn } from './SortBtn';
import { BattleState } from '../../phaser/stateManager/BattleStateManager';

export interface SortPaneProps {
    sorts: Sort[];
    disabled: boolean;
    prepareSort?: Sort;
}

const authorizedState: BattleState[] = ['idle', 'sortPrepare'];

export const SortPane = connect<SortPaneProps, {}, {}, UIState>(
    ({ currentCharacter, gameState }) => ({
        sorts: currentCharacter?.sorts || [],
        prepareSort: gameState && gameState.state === 'sortPrepare' ? gameState.data.sort : undefined,
        disabled: gameState && !authorizedState.includes(gameState.state)
    })
)(({ sorts, prepareSort, disabled }: SortPaneProps): React.ReactElement => {

    return <div>
        {sorts.map(s => <SortBtn
            key={s.name}
            sort={s}
            isActive={!!prepareSort && prepareSort.name === s.name}
            disabled={disabled}
        />)}
    </div>;
});
