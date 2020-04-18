import { getEndpoint, getPort } from '@timeflies/shared';
import cors from "cors";
import express from 'express';
import http from 'http';
import urlJoin from 'url-join';
import WebSocket from 'ws';
import { App } from './App';

console.log('NODE_ENV', process.env.NODE_ENV);
console.log('PORT', process.env.PORT);

// TODO use shared config

const port = getPort();

const httpBaseURL = getEndpoint('http');
const staticPostURL = '/static';

export const staticURL = urlJoin(httpBaseURL, staticPostURL);

const app = express();
app.use(
  cors({ allowedHeaders: '*' }),
  express.json()
);

app.use(staticPostURL, express.static('public'));

const server = http.createServer(app);

const ws = new WebSocket.Server({ server });

server.listen(port, () => {
  console.log(`http listening on ${httpBaseURL}`);
  console.log(`ws listening on ${getEndpoint('ws')}`);
});

const myApp = new App(ws);
myApp.init();
