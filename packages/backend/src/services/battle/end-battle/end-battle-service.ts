import { ObjectTyped, SerializableState } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
import { BattleEndMessage } from '@timeflies/socket-messages';
import { Battle, StaticState } from '../battle';
import { BattleAbstractService } from '../battle-abstract-service';

export class EndBattleService extends BattleAbstractService {
    afterSocketConnect = () => { };

    isBattleEnded = ({ characters }: Pick<SerializableState, 'characters'>, { players, characters: staticCharacters }: Pick<StaticState, 'players' | 'characters'>): string | null => {

        const teamHealthMap = ObjectTyped.entries(characters.health)
            .reduce<Record<string, number>>((acc, [ characterId, health ]) => {
                const { playerId } = staticCharacters[ characterId ];
                const teamColor = players[ playerId ].teamColor!;

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

    onBattleEnd = async (battle: Battle, winnerTeamColor: string, endTime: number) => {
        const { battleId, playerIdList, onBattleEnd } = battle;

        logger.info('Battle [' + battleId + '] ending...');

        await this.services.cycleBattleService.stop(battle);

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

        logger.info('Battle [' + battleId + '] ended.');

        onBattleEnd();
    };
}
