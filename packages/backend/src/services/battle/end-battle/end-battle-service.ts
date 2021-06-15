import { ObjectTyped, PlayerId, SerializableState } from '@timeflies/common';
import { BattleEndMessage } from '@timeflies/socket-messages';
import { Service } from '../../service';
import { StaticState } from '../battle';

export class EndBattleService extends Service {
    afterSocketConnect = () => { };

    isBattleEnded = ({ characters }: Pick<SerializableState, 'characters'>, { players, characters: staticCharacters }: Pick<StaticState, 'players' | 'characters'>): string | null => {

        const teamHealthMap = ObjectTyped.entries(characters.health)
            .reduce<Record<string, number>>((acc, [ characterId, health ]) => {
                const { playerId } = staticCharacters[ characterId ];
                const { teamColor } = players[ playerId ];

                acc[ teamColor ] = (acc[ teamColor ] ?? 0) + health;

                return acc;
            }, {});

        const teamColorAliveList = ObjectTyped.entries(teamHealthMap)
            .filter(([ teamColor, health ]) => health > 0)
            .map(([ teamColor ]) => teamColor);

        if (teamColorAliveList.length !== 1) {
            return null;
        }

        return teamColorAliveList[ 0 ];
    };

    onBattleEnd = (winnerTeamColor: string, endTime: number, playerIdList: PlayerId[]) => {
        playerIdList.forEach(playerId => {
            const socketCell = this.playerSocketMap[ playerId ];

            if (socketCell) {
                socketCell.send(BattleEndMessage({
                    winnerTeamColor,
                    endTime
                }));
            }

            delete this.globalEntitiesNoServices.currentBattleMap.mapByPlayerId[ playerId ];
        });
    };
}
