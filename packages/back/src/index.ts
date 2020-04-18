import { EnvManager, getEndpoint } from '@timeflies/shared';
import cors from "cors";
import express from 'express';
import http from 'http';
import urlJoin from 'url-join';
import WebSocket from 'ws';
import { App } from './App';

// TODO use shared config

// Env variables

const envManager = EnvManager('PORT', 'HOST_URL');

const port = Number(envManager.PORT);
const hostUrl = getEndpoint('http', envManager.HOST_URL);

// Static

const staticPostURL = '/static';

export const staticURL = urlJoin(hostUrl, staticPostURL);

// Express

const app = express();
app.use(
  cors({ allowedHeaders: '*' }),
  express.json()
);

app.use(staticPostURL, express.static('public'));

const server = http.createServer(app);

// Websocket

const ws = new WebSocket.Server({ server });

// Start

server.listen(port, () => {
  console.log('server listening address', server.address());
  console.log('ws listening address', ws.address());
});

const myApp = new App(ws);
myApp.init();
