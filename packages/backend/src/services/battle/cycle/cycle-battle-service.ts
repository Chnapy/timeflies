import { PlayerId } from '@timeflies/common';
import { NextTurnInfos } from '@timeflies/cycle-engine';
import { BattleTurnStartMessage } from '@timeflies/socket-messages';
import { Service } from '../../service';

export class CycleBattleService extends Service {
    afterSocketConnect = () => { };

    beforeTurnStart = ({ roundIndex, turnIndex, characterId, startTime }: NextTurnInfos, playerIdList: PlayerId[]) => {
        playerIdList.forEach(playerId => {

            const socketCell = this.playerSocketMap[ playerId ];

            socketCell.send(BattleTurnStartMessage({
                roundIndex,
                turnIndex,
                characterId,
                startTime
            }));
        });
    };
};
