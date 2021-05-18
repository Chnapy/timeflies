import { PlayerId } from '@timeflies/common';
import { NextTurnInfos } from '@timeflies/cycle-engine';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { SocketCell } from '@timeflies/socket-server';
import { createService } from '../../service';

export const cycleBattleService = createService(() => {

    const playerSocketMap: { [ playerId in PlayerId ]: SocketCell } = {};

    return {
        onSocketConnect: (socketCell, currentPlayerId) => {
            playerSocketMap[ currentPlayerId ] = socketCell;

            socketCell.addDisconnectListener(() => {
                delete playerSocketMap[ currentPlayerId ];
            });
        },
        beforeTurnStart: ({ roundIndex, turnIndex, characterId, startTime }: NextTurnInfos, playerIdList: PlayerId[]) => {
            playerIdList.forEach(playerId => {

                const socketCell = playerSocketMap[ playerId ];

                socketCell.send(BattleTurnStartMessage({
                    roundIndex,
                    turnIndex,
                    characterId,
                    startTime
                }));
            });
        }
    };
});
