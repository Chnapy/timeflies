import { ObjectTyped, PlayerId } from '@timeflies/common';
import { createSocketCell } from '@timeflies/socket-server';
import WebSocket from 'ws';
import { GlobalEntitiesNoServices } from '../main/global-entities';
import { CycleBattleService } from './battle/cycle/cycle-battle-service';
import { JoinBattleService } from './battle/join/join-battle-service';
import { SpellActionBattleService } from './battle/spell-action/spell-action-battle-service';
import { ChatService } from './chat/chat-service';

export type Services = ReturnType<typeof createServices>;

export const createServices = (globalEntitiesNoServices: GlobalEntitiesNoServices) => ({
    joinBattleService: new JoinBattleService(globalEntitiesNoServices),
    cycleBattleService: new CycleBattleService(globalEntitiesNoServices),
    spellActionBattleService: new SpellActionBattleService(globalEntitiesNoServices),
    chatService: new ChatService(globalEntitiesNoServices)
});

export const onAllServicesSocketConnect = (services: Services, socket: WebSocket, playerId: PlayerId) => {
    ObjectTyped.entries(services).forEach(([ key, service ]) => service.onSocketConnect(
        createSocketCell(socket),
        playerId
    ));
};
