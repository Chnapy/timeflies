import { ArrayUtils, ObjectTyped } from '@timeflies/common';
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
}
