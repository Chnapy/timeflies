import cors from "cors";
import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import { App } from './App';
import { envManager } from './envManager';
import { staticPostURL } from './config';

// TODO use shared config

// Env variables

const port = Number(envManager.PORT);

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
