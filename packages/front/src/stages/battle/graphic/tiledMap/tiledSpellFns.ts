import { assertIsDefined, Normalized, SpellActionSnapshot } from '@timeflies/shared';
import { TileGraphic } from './TileGraphic';

type TiledMapStartFn = (props: Pick<SpellActionSnapshot,
    | 'startTime'
    | 'position'
    | 'actionArea'
    | 'duration'
> & {
    tileGraphicList: Normalized<TileGraphic>;
}) => void;

export const tiledMapSpellMove: TiledMapStartFn = ({
    tileGraphicList, startTime, duration, position
}) => {
    const tilePos = tileGraphicList[ position.id ];
    assertIsDefined(tilePos);

    tilePos.persistActionStart(duration, startTime);
};

export const tiledMapSpellSimpleAttack: TiledMapStartFn = ({
    tileGraphicList, startTime, duration, position
}) => {
    const tilePos = tileGraphicList[ position.id ];
    assertIsDefined(tilePos);

    tilePos.persistActionStart(duration, startTime);
};
