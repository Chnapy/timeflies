import { CharacterId, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import Joi from 'joi';
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
    roomId: string;

    tiledMapInfos: TiledMapInfos;

    staticPlayers: StaticPlayer[];
    staticCharacters: StaticCharacter[];
    staticSpells: StaticSpell[];

    initialSerializableState: SerializableState;

    cycleInfos: CycleInfos;
};

export const BattleLoadMessage = createMessage('battle/load', Joi.object<{ battleId: string }>({
    battleId: Joi.string().required()
}))
    .withResponse<BattleLoadData>();
