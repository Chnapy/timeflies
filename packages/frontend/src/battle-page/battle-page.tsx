import { Container, makeStyles } from '@material-ui/core';
import { useSocketSend } from '@timeflies/socket-client';
import { BattleLeaveMessage, BattleLoadMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import useAsyncEffect from 'use-async-effect';
import { LoadingBackdrop } from '../components/loading-backdrop';
import { NotFoundPanel } from '../components/not-found-panel';
import { useSocketSendWithResponseError } from '../connected-socket/hooks/use-socket-send-with-response-error';
import { useGameSelector } from '../store/hooks/use-game-selector';
import { BattleView } from './battle-view';
import { BattleLoadAction, BattleResetAction } from './store/battle-actions';

type BattlePageParams = {
    battleId: string;
};

const useStyles = makeStyles(() => ({
    wrongIdContainer: {
        display: 'flex',
        height: '100vh'
    }
}));

export const BattlePage: React.FC = () => {
    const classes = useStyles();
    const { battleId } = useParams<BattlePageParams>();
    const hasBattleData = useGameSelector(state => state.battle !== null);
    const send = useSocketSend();
    const sendWithResponse = useSocketSendWithResponseError();
    const dispatch = useDispatch();
    const [ hasWrongId, setHasWrongId ] = React.useState(false);

    useAsyncEffect(async (isMounted) => {

        const response = await sendWithResponse(BattleLoadMessage({ battleId }), isMounted, ({ payload }, dispatchError) => {
            if (payload.reason === 'bad-request') {
                setHasWrongId(true);
            } else {
                dispatchError();
            }
        });
        if (!response) {
            return;
        }

        dispatch(BattleLoadAction(response.payload));
    },
        () => {
            dispatch(BattleResetAction());

            return send(BattleLeaveMessage({}));
        },
        []);

    if (hasWrongId) {
        return (
            <Container className={classes.wrongIdContainer}>
                <NotFoundPanel
                    title='Oops, there is no battle here.'
                    reasons={[
                        'Battle is over',
                        'URL is wrong, if you paste it from outside'
                    ]}
                />
            </Container>
        );
    }

    if (!hasBattleData) {
        return <LoadingBackdrop />;
    }

    return <BattleView />;
};
