import { useSocketListeners } from '@timeflies/socket-client';
import { BattleEndMessage } from '@timeflies/socket-messages';
import React from 'react';
import useAsyncEffect from 'use-async-effect';

type BattleEndContextValue = {
    winnerTeamColor: string;
} | null;

export const BattleEndContext = React.createContext<BattleEndContextValue>(null);
BattleEndContext.displayName = 'BattleEndContext';

export const BattleEndContextProvider: React.FC = ({ children }) => {
    const [ value, setValue ] = React.useState<BattleEndContextValue>(null);
    const socketListeners = useSocketListeners();

    useAsyncEffect(() => {
        return socketListeners({
            [ BattleEndMessage.action ]: ({ payload }: ReturnType<typeof BattleEndMessage>) => {
                setValue({
                    winnerTeamColor: payload.winnerTeamColor
                });
            }
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ socketListeners ]);

    return <BattleEndContext.Provider value={value}>
            {children}
    </BattleEndContext.Provider>;
};

export const useBattleEndContext = () => React.useContext(BattleEndContext);
