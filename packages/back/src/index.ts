import http from 'http';
import WebSocket from 'ws';
import { App } from './App';
import { envManager } from './envManager';
import { expressApp } from './express-app';

// TODO use shared config

// Env variables

const port = Number(envManager.PORT);

// Express

const app = expressApp();

const myApp = new App();
// TODO share path
app.post('/auth', myApp.getAuthRoute());

// const 

const server = http.createServer(app);

// Websocket

const ws = new WebSocket.Server({ server });

// Start

server.listen(port, () => {
  console.log('server listening address', server.address());
  console.log('ws listening address', ws.address());
});

myApp.init(ws);
