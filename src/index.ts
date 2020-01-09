import express from 'express';
import http from 'http';
import WebSocket from 'ws';
import cors from "cors";
import { App } from './App';

const port = Number(process.env.PORT || 2567);
const wsPort = 4275;

const app = express();
app.use(
  cors(),
  express.json()
);

const server = http.createServer(app);

const ws = new WebSocket.Server({
  port: wsPort,
  server,
  
});

app.get('/', (req, res) => {
  res.send('<h1>Hello world</h1>');
});

app.use('/', express.static('public'));

server.listen(port, () => {
  console.log(`http listening on http://localhost:${port}`);
  console.log(`ws listening on http://localhost:${wsPort}`);
});

const myApp = new App(ws);
myApp.init();
