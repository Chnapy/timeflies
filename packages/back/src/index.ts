import { getEndpoint } from '@timeflies/shared';
import cors from "cors";
import express from 'express';
import http from 'http';
import urlJoin from 'url-join';
import WebSocket from 'ws';
import { App } from './App';

console.log('NODE_ENV', process.env.NODE_ENV);

// TODO use shared config
const getPort = () => {

  if(!process.env.PORT) {
    throw new Error('env PORT is not defined');
  }

  return Number(process.env.PORT);
};

const port = getPort();

const httpBaseURL = `localhost:${port}`;
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
  console.log(`ws listening on ${getEndpoint('ws', httpBaseURL)}`);
});

const myApp = new App(ws);
myApp.init();
