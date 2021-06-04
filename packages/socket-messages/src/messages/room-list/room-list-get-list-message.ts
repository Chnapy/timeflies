import { StaticPlayer } from '@timeflies/common';
import Joi from 'joi';
import { createMessage } from '../../message';
import { MapInfos } from '../room/room-state-data';

export type RoomInfos = {
    roomId: string;
    playerAdmin: Pick<StaticPlayer, 'playerId' | 'playerName'>;
    map: Pick<MapInfos, 'mapId' | 'name'> | null;
    nbrPlayers: number;
    state: 'open' | 'in-battle';
};

export type RoomListGetListData = RoomInfos[];

export const RoomListGetListMessage = createMessage('room-list/get-list', Joi.object())
    .withResponse<RoomListGetListData>();
