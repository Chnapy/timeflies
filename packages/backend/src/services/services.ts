import { ObjectTyped, PlayerId } from '@timeflies/common';
import { createSocketCell } from '@timeflies/socket-server';
import WebSocket from 'ws';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { CycleBattleService } from './battle/cycle/cycle-battle-service';
import { EndBattleService } from './battle/end-battle/end-battle-service';
import { JoinBattleService } from './battle/join/join-battle-service';
import { SpellActionBattleService } from './battle/spell-action/spell-action-battle-service';
import { ChatService } from './chat/chat-service';
import { CharacterRoomService } from './room/character/character-room-service';
import { EntityListGetRoomService } from './room/entity-list-get/entity-list-get-room-service';
import { MapRoomService } from './room/map/map-room-service';
import { PlayerRoomService } from './room/player/player-room-service';
import { TeamRoomService } from './room/team/team-room-service';

export type Services = ReturnType<typeof createServices>;

export const createServices = (globalEntitiesNoServices: GlobalEntitiesNoServices) => ({
    joinBattleService: new JoinBattleService(globalEntitiesNoServices),
    cycleBattleService: new CycleBattleService(globalEntitiesNoServices),
    spellActionBattleService: new SpellActionBattleService(globalEntitiesNoServices),
    endBattleService: new EndBattleService(globalEntitiesNoServices),
    chatService: new ChatService(globalEntitiesNoServices),
    playerRoomService: new PlayerRoomService(globalEntitiesNoServices),
    mapRoomService: new MapRoomService(globalEntitiesNoServices),
    teamRoomService: new TeamRoomService(globalEntitiesNoServices),
    characterRoomService: new CharacterRoomService(globalEntitiesNoServices),
    entityListGetRoomService: new EntityListGetRoomService(globalEntitiesNoServices)
});

export const onAllServicesSocketConnect = (services: Services, socket: WebSocket, playerId: PlayerId) => {
    ObjectTyped.entries(services).forEach(([ key, service ]) => service.onSocketConnect(
        createSocketCell(socket),
        playerId
    ));
};
