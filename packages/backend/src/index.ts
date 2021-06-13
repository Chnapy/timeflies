import { logger } from '@timeflies/devtools';
import { authEndpoint } from '@timeflies/socket-messages';
import { addSocketListenersLogger, createSocketCell, SocketError } from '@timeflies/socket-server';
import { json, urlencoded } from 'body-parser';
import cors from "cors";
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { config } from './main/config';
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

app.use('/static', express.static(config.staticFolderName));

const globalEntities = createGlobalEntities();

app.post(authEndpoint, globalEntities.services.authService.httpAuthRoute);

const server = http.createServer(app);

// Websocket

const ws = new WebSocket.Server({ server });

// Start

server.listen(port, () => {
    logger.net('http server listening', server.address()!);
    logger.net('websocket server listening', ws.address());

    ws.on('connection', (socket, request) => {

        socket.setMaxListeners(20); // fix console warning due to multiple services listeners

        addSocketListenersLogger(socket);

        const socketCell = createSocketCell(socket);
        try {
            const playerId = globalEntities.services.authService.onSocketFirstConnect(socketCell, request);

            onAllServicesSocketConnect(globalEntities.services, socket, playerId);
        } catch (err) {
            logger.error(err);
            socketCell.closeSocket(err instanceof SocketError
                ? err
                : new SocketError(500, (err as Error).stack ?? err + '')
            );
        }
    });
});
