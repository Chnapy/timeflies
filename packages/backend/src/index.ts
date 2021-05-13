import { ObjectTyped } from '@timeflies/common';
import { createSocketCell } from '@timeflies/socket-server';
import { json, urlencoded } from 'body-parser';
import cors from "cors";
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { createGlobalEntities } from './main/global-entities';
import { createBattle } from './services/battle/battle';

// Env variables

if (!process.env.PORT) {
    throw new Error('env PORT missing.');
}

const port = Number(process.env.PORT);

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
globalEntities.currentBattleMap[ 'battleId' ] = createBattle(globalEntities, {
    playerIdList: [ 'p1', 'p2' ]
});

// Start

server.listen(port, () => {
    console.log('server listening address', server.address());
    console.log('ws listening address', ws.address());
    let i = 0;
    ws.on('connection', socket => {
        console.log('new connection')
        i++;

        ObjectTyped.entries(globalEntities.services).forEach(([key, service]) => service.onSocketConnect(
            createSocketCell(socket),
            'p' + i
        ));
    });
});
