import { ArrayUtils, ObjectTyped, SerializableState, waitMs } from '@timeflies/common';
import { MapInfos } from '@timeflies/socket-messages';
import { assetUrl } from '../../utils/asset-url';
import { Service } from '../service';
import { Battle } from './battle';

export abstract class BattleAbstractService extends Service {

    static getMapInfosFrontend = ({ mapInfos }: Pick<Battle, 'mapInfos'>) => {
        return {
            ...mapInfos,
            schemaLink: assetUrl.toFrontend(mapInfos.schemaLink),
            imagesLinks: ObjectTyped.entries(mapInfos.imagesLinks)
                .reduce<MapInfos[ 'imagesLinks' ]>((acc, [ key, value ]) => {
                    acc[ key ] = assetUrl.toFrontend(value);
                    return acc;
                }, {})
        };
    };
    protected getMapInfosFrontend = BattleAbstractService.getMapInfosFrontend;

    protected getInitialState = ({ stateStack }: Pick<Battle, 'stateStack'>) => stateStack[ 0 ];

    protected getCurrentState = ({ stateStack }: Pick<Battle, 'stateStack'>) => ArrayUtils.last(stateStack)!;

    protected addNewStateToBattle = (battle: Battle, state: SerializableState) => {
        const { stateStack } = battle;

        stateStack.push(state);
    };

    protected addNewStateToCycleAndCheckBattleEnd = async (battle: Battle, state: SerializableState, stateEndTime: number) => {
        const { staticState } = battle;

        // wait current spell action to end
        const timeBeforeEnd = stateEndTime - Date.now();
        await waitMs(timeBeforeEnd);

        this.services.cycleBattleService.onNewState(battle, state);

        const winnerTeamColor = this.services.endBattleService.isBattleEnded(state, staticState);
        if (winnerTeamColor) {
            await this.services.endBattleService.onBattleEnd(battle, winnerTeamColor, stateEndTime);
        }
    };

    protected addNewState = async (battle: Battle, state: SerializableState, stateEndTime: number) => {

        this.addNewStateToBattle(battle, state);

        await this.addNewStateToCycleAndCheckBattleEnd(battle, state, stateEndTime);
    };
}