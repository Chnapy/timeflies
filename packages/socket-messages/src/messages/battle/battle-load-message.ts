import { CharacterId, PlayerId, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { createMessage } from '../../message';

type TiledMapInfos = {
    name: string;
    schemaLink: string;
    imagesLinks: Record<string, string>;
};

type CycleInfos = {
    turnsOrder: CharacterId[];
};

export type BattleLoadData = {
    myPlayerId: PlayerId;

    tiledMapInfos: TiledMapInfos;

    staticPlayers: StaticPlayer[];
    staticCharacters: StaticCharacter[];
    staticSpells: StaticSpell[];

    initialSerializableState: SerializableState;

    cycleInfos: CycleInfos;
};

export const BattleLoadMessage = createMessage<{ battleId: string }>('battle/load')
    .withResponse<BattleLoadData>();
