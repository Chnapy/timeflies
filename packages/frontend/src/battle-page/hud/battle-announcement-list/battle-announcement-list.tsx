import { Grid } from '@material-ui/core';
import { UIText } from '@timeflies/app-ui';
import { waitMs } from '@timeflies/common';
import { useSocketListeners } from '@timeflies/socket-client';
import { BattlePlayerDisconnectMessage, BattlePlayerDisconnectRemoveMessage } from '@timeflies/socket-messages';
import React from 'react';
import { useAsyncEffect } from 'use-async-effect';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { BattleAnnouncement } from './battle-announcement';
import { BattleTurnAnnouncement } from './battle-turn-announcement/battle-turn-announcement'

type MessageMap = { [ time in number ]: React.ReactNode };

export const BattleAnnouncementList: React.FC = () => {
    const socketListeners = useSocketListeners();
    const [ messageMap, addOrRemoveMessage ] = React.useReducer((map: MessageMap, message: { time: number; content: React.ReactElement } | number) => {

        if (typeof message === 'number') {
            delete map[ message ];
            return { ...map };
        }

        return {
            ...map,
            [ message.time ]: message.content
        };
    }, {});

    const staticPlayers = useBattleSelector(battle => battle.staticPlayers);

    useAsyncEffect(isMounted => {
        return socketListeners({
            [ BattlePlayerDisconnectMessage.action ]: async ({ payload }: ReturnType<typeof BattlePlayerDisconnectMessage>) => {
                const { playerName } = staticPlayers[ payload.playerId ];

                const time = Date.now();

                addOrRemoveMessage({
                    time,
                    content: <UIText variant='body1'>
                        <b>{playerName}</b> disconnected
                    </UIText>
                });

                await waitMs(5000);
                if (!isMounted()) {
                    return;
                }

                addOrRemoveMessage(time);
            },
            [ BattlePlayerDisconnectRemoveMessage.action ]: async ({ payload }: ReturnType<typeof BattlePlayerDisconnectRemoveMessage>) => {
                const promises = payload.playersToRemove.map(async playerId => {
                    const { playerName } = staticPlayers[ playerId ];

                    const time = Date.now();

                    addOrRemoveMessage({
                        time,
                        content: <UIText variant='body1'>
                            <b>{playerName}</b> leaved battle
                    </UIText>
                    });

                    await waitMs(5000);
                    if (!isMounted()) {
                        return;
                    }

                    addOrRemoveMessage(time);
                });

                return Promise.all(promises);
            },
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ staticPlayers ]);

    const messageRenderList = Object.entries(messageMap).sort(([ aTime ], [ bTime ]) => aTime < bTime ? -1 : 1);

    return <Grid container direction='column' alignItems='center' spacing={1}>
        <Grid item>
            <BattleTurnAnnouncement />
        </Grid>

        {messageRenderList.map(([ time, content ]) => (
            <Grid key={time} item>
                <BattleAnnouncement key={time}>
                    {content}
                </BattleAnnouncement>
            </Grid>
        ))}
    </Grid>;
};
