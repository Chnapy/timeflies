import { PlayerId } from '@timeflies/common';
import { createSocketCell } from '@timeflies/socket-server';
import WebSocket from 'ws';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { CycleBattleService } from './battle/cycle/cycle-battle-service';
import { EndBattleService } from './battle/end-battle/end-battle-service';
import { JoinBattleService } from './battle/join/join-battle-service';
import { SpellActionBattleService } from './battle/spell-action/spell-action-battle-service';
import { ChatService } from './chat/chat-service';
import { CreateRoomListService } from './room-list/create-room/create-room-list-service';
import { GetRoomListService } from './room-list/get-room-list/get-room-list-service';
import { CharacterRoomService } from './room/character/character-room-service';
import { EntityListGetRoomService } from './room/entity-list-get/entity-list-get-room-service';
import { MapRoomService } from './room/map/map-room-service';
import { PlayerRoomService } from './room/player/player-room-service';
import { TeamRoomService } from './room/team/team-room-service';

export type Services = ReturnType<typeof createServicesRaw>;

const createServicesRaw = (globalEntitiesNoServices: GlobalEntitiesNoServices) => ({
    joinBattleService: new JoinBattleService(globalEntitiesNoServices),
    cycleBattleService: new CycleBattleService(globalEntitiesNoServices),
    spellActionBattleService: new SpellActionBattleService(globalEntitiesNoServices),
    endBattleService: new EndBattleService(globalEntitiesNoServices),
    chatService: new ChatService(globalEntitiesNoServices),
    playerRoomService: new PlayerRoomService(globalEntitiesNoServices),
    mapRoomService: new MapRoomService(globalEntitiesNoServices),
    teamRoomService: new TeamRoomService(globalEntitiesNoServices),
    characterRoomService: new CharacterRoomService(globalEntitiesNoServices),
    entityListGetRoomService: new EntityListGetRoomService(globalEntitiesNoServices),
    getRoomListService: new GetRoomListService(globalEntitiesNoServices),
    createRoomListService: new CreateRoomListService(globalEntitiesNoServices)
});

export const createServices = (globalEntitiesNoServices: GlobalEntitiesNoServices): Services => {
    const services = createServicesRaw(globalEntitiesNoServices);

    Object.values(services).forEach(service => service.services = services);

    return services;
};

export const onAllServicesSocketConnect = (services: Services, socket: WebSocket, playerId: PlayerId) => {
    Object.values(services).forEach(service => service.onSocketConnect(
        createSocketCell(socket),
        playerId
    ));
};
