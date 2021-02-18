import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { BattleLoadMessage, ErrorCode, SocketErrorMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useAsyncEffect } from 'use-async-effect';
import { BattleLoadAction } from '../../store/battle-actions';

export const useBattleLoad = (battleId: string) => {

    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();

    const [ isLoading, setIsLoading ] = React.useState(true);
    const [ errorCode, setErrorCode ] = React.useState<ErrorCode | null>(null);

    useAsyncEffect(async () => {

        const response = await sendWithResponse(BattleLoadMessage({ battleId }));

        setIsLoading(false);
        if (SocketErrorMessage.match(response)) {
            setErrorCode(response.payload.code);
        } else {
            dispatch(
                BattleLoadAction(response.payload)
            );
        }

    }, []);

    return {
        isLoading,
        errorCode
    };
};
