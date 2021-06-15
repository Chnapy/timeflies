import { CharacterId, PlayerId } from '@timeflies/common';
import { useSocketListeners } from '@timeflies/socket-client';
import { BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import { produceStateDisconnectedPlayers } from '@timeflies/spell-effects';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { useCurrentEntities } from '../../hooks/use-entities';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattlePlayerDisconnectAction, BattlePlayerDisconnectRemoveAction } from '../store/player-disconnect-actions';

const useOnPlayerDisconnectMessage = () => {
    const dispatch = useDispatch();

    return ({ payload }: ReturnType<typeof BattlePlayerDisconnectMessage>) => {
        dispatch(BattlePlayerDisconnectAction(payload));
    };
};

const useOnPlayerDisconnectRemoveMessage = () => {
    const dispatch = useDispatch();
    const currentState = useCurrentEntities(state => state);
    const characterList = useBattleSelector(battle => battle.characterList);
    const staticCharacters = useBattleSelector(battle => battle.staticCharacters);

    return ({ payload }: ReturnType<typeof BattlePlayerDisconnectRemoveMessage>) => {

        const { playersToRemove, time } = payload;

        const characterPlayerMap = characterList.reduce<{ [ characterId in CharacterId ]: PlayerId }>((acc, characterId) => {
            acc[ characterId ] = staticCharacters[ characterId ].playerId;
            return acc;
        }, {});

        const newState = produceStateDisconnectedPlayers(currentState, time, playersToRemove, characterPlayerMap);

        dispatch(BattlePlayerDisconnectRemoveAction({ newState }));
    };
};

export const usePlayerDisconnectListener = () => {
    const socketListeners = useSocketListeners();

    const notifyListenerRef = React.useRef<{
        playerDisconnectListener: ReturnType<typeof useOnPlayerDisconnectMessage>;
        playerDisconnectRemoveListener: ReturnType<typeof useOnPlayerDisconnectRemoveMessage>;
    }>();
    notifyListenerRef.current = {
        playerDisconnectListener: useOnPlayerDisconnectMessage(),
        playerDisconnectRemoveListener: useOnPlayerDisconnectRemoveMessage()
    };

    useAsyncEffect(() => {
        return socketListeners({
            [ BattlePlayerDisconnectMessage.action ]: action => notifyListenerRef.current!.playerDisconnectListener(action),
            [ BattlePlayerDisconnectRemoveMessage.action ]: action => notifyListenerRef.current!.playerDisconnectRemoveListener(action)
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ notifyListenerRef ]);
};
