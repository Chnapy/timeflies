import http from 'http';
import WebSocket from 'ws';
import { App } from './App';
import { Auth } from './battle/auth/auth';
import { envManager } from './envManager';
import { expressApp } from './express-app';

// TODO use shared config

// Env variables

const port = Number(envManager.PORT);

// Express

const app = expressApp();

const auth = Auth();
app.post('/auth', auth.route());

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
