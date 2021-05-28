import Joi from 'joi';
import { createMessage } from '../../message';
import { MapInfos } from './room-state-data';

type RoomMapListGetMessageData = MapInfos[];

export const RoomMapListGetMessage = createMessage('room/map/list/get', Joi.object())
    .withResponse<RoomMapListGetMessageData>();
