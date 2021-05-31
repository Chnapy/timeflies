import { logger } from '@timeflies/devtools';
import { json, urlencoded } from 'body-parser';
import cors from "cors";
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { createGlobalEntities } from './main/global-entities';
import { onAllServicesSocketConnect } from './services/services';
import { getEnv } from './utils/env';

const port = Number(getEnv('PORT'));

// Express

const app = express();

app.use(
    cors({ allowedHeaders: '*' }),
    urlencoded({ extended: false }),
    json()
);

app.use('/static', express.static('static'));

const server = http.createServer(app);

// Websocket

const ws = new WebSocket.Server({ server });

const globalEntities = createGlobalEntities();

// TODO remove mock
// void createBattle(globalEntities, {
//     staticPlayerList: [
//         { playerId: 'p1' } as any,
//         { playerId: 'p2' } as any,
//     ]
// }).then(mockBattle => {
//     globalEntities.currentBattleMap.mapById[ 'battleId' ] = mockBattle;
//     globalEntities.currentBattleMap.mapByPlayerId[ 'p1' ] = mockBattle;
//     globalEntities.currentBattleMap.mapByPlayerId[ 'p2' ] = mockBattle;
// });

// Start

server.listen(port, () => {
    logger.net('http server listening', server.address()!);
    logger.net('websocket server listening', ws.address());

    let i = 0;
    ws.on('connection', socket => {
        logger.net('new socket connection');
        i++;

        // TODO
        onAllServicesSocketConnect(globalEntities.services, socket, 'p' + i);
    });
});
