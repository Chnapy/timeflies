import cors from "cors";
import express from 'express';
import http from 'http';
import urlJoin from 'url-join';
import WebSocket from 'ws';
import { App } from './App';

// TDOO use shared config

const httpPort = Number(process.env.PORT || 2567);
const wsPort = 4275;

const httpBaseURL = `http://localhost:${httpPort}`;
const staticPostURL = '/static';

export const staticURL = urlJoin(httpBaseURL, staticPostURL);

const app = express();
app.use(
  cors({ allowedHeaders: '*' }),
  express.json()
);

app.use(staticPostURL, express.static('public'));

const server = http.createServer(app);

const ws = new WebSocket.Server({
  port: wsPort,
  server,

});

server.listen(httpPort, () => {
  console.log(`http listening on http://localhost:${httpPort}`);
  console.log(`ws listening on http://localhost:${wsPort}`);
});

const myApp = new App(ws);
myApp.init();
