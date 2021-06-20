import Joi from 'joi';
import { createMessage } from '../../message';
import { RoomStateData } from './room-state-data';

export const RoomTeamJoinMessage = createMessage('room/team/join', Joi.object<{ teamColor: string | null }>({
    teamColor: Joi.string().allow(null).required()
}))
    .withResponse<RoomStateData>();
