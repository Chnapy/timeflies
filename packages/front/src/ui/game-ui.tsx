import React from 'react';
import { useSelector } from 'react-redux';
import { GameState, GameStateStep } from '../game-state';
import { UIAuth } from './auth-ui/ui-auth';
import { BattleUI } from './battle-ui/battle-ui';
import { UIRoomList } from './room-list-ui/ui-room-list';
import { UIRoom } from './room-ui/ui-room';

const stepComponentMap: Record<GameStateStep, React.ComponentType> = {
    'auth': UIAuth,
    'room': UIRoom,
    'roomList': UIRoomList,
    'battle': BattleUI
};

export const GameUI: React.FC = () => {

    const step = useSelector<GameState, GameStateStep>(state => state.step);

    const Component = stepComponentMap[ step ];

    return <div style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        pointerEvents: 'none'
    }}>

        <Component />

    </div>
};
