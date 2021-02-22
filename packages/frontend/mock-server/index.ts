import { createPosition } from '@timeflies/common';
import { createCycleEngine } from '@timeflies/cycle-engine';
import { BattleLoadData, BattleLoadMessage, BattleTurnStartMessage } from '@timeflies/socket-messages';
import * as cors from "cors";
import * as express from 'express';
import * as http from 'http';
import { Server as WebSocketServer } from 'ws';

const app = express() as any;

app.use(
    cors({ allowedHeaders: '*' }),
);

app.use('/public', express.static('mock-server/public'));

const server = http.createServer(app);

const port = 40510;
const wss = new WebSocketServer({ server });

console.log('Mock server started');

server.listen(port, () => {
    console.log('server listening address', server.address());
    console.log('ws listening address', wss.address());
});

const turnsOrder = [ 'c2', 'c1', 'c3' ];

const battleLoadData: BattleLoadData = {
    myPlayerId: 'p1',
    tiledMapInfos: {
        name: 'dungeon',
        schemaLink: 'http://localhost:40510/public/maps/map_dungeon.json',
        imagesLinks: {
            "tiles_dungeon_v1.1": 'http://localhost:40510/public/maps/map_dungeon.png'
        }
    },
    players: [
        {
            playerId: 'p1',
            playerName: 'chnapy',
            teamColor: '#FF0000'
        },
        {
            playerId: 'p2',
            playerName: 'yoshi2oeuf',
            teamColor: '#00FF00'
        }
    ],
    characters: [
        {
            characterId: 'c1',
            characterRole: 'tacka',
            playerId: 'p1',
            defaultSpellId: 's1',
            initialVariables: {
                actionTime: 10000,
                health: 100,
                orientation: 'bottom',
                position: createPosition(8, 3),
            },
        },
        {
            characterId: 'c2',
            characterRole: 'meti',
            playerId: 'p1',
            defaultSpellId: 's3',
            initialVariables: {
                actionTime: 12000,
                health: 120,
                orientation: 'left',
                position: createPosition(10, 3),
            },
        },
        {
            characterId: 'c3',
            characterRole: 'vemo',
            playerId: 'p2',
            defaultSpellId: 's5',
            initialVariables: {
                actionTime: 9000,
                health: 110,
                orientation: 'top',
                position: createPosition(9, 11),
            },
        }
    ],
    spells: [
        {
            characterId: 'c1',
            spellId: 's1',
            spellRole: 'move',
            initialVariables: {
                actionArea: 1,
                duration: 1000,
                lineOfSight: true,
                rangeArea: 10,
            }
        },
        {
            characterId: 'c1',
            spellId: 's2',
            spellRole: 'simpleAttack',
            initialVariables: {
                actionArea: 2,
                duration: 2000,
                lineOfSight: true,
                rangeArea: 6,
            }
        },
        {
            characterId: 'c2',
            spellId: 's3',
            spellRole: 'switch',
            initialVariables: {
                actionArea: 1,
                duration: 800,
                lineOfSight: false,
                rangeArea: 2,
            }
        },
        {
            characterId: 'c2',
            spellId: 's4',
            spellRole: 'simpleAttack',
            initialVariables: {
                actionArea: 2,
                duration: 2000,
                lineOfSight: true,
                rangeArea: 6,
            }
        },
        {
            characterId: 'c3',
            spellId: 's5',
            spellRole: 'move',
            initialVariables: {
                actionArea: 1,
                duration: 1000,
                lineOfSight: true,
                rangeArea: 1,
            }
        },
        {
            characterId: 'c3',
            spellId: 's6',
            spellRole: 'simpleAttack',
            initialVariables: {
                actionArea: 2,
                duration: 2000,
                lineOfSight: true,
                rangeArea: 6,
            }
        }
    ],
    cycleInfos: {
        turnsOrder
    }
};

const sendAll = action => {
    console.log('sendAll: %s', JSON.stringify(action));
    wss.clients.forEach(ws => {
        ws.send(JSON.stringify([ action ]));
    });
};

const cycleEngine = createCycleEngine({
    charactersList: turnsOrder,
    charactersDurations: battleLoadData.characters.reduce((acc, { characterId, initialVariables }) => {
        acc[ characterId ] = initialVariables.actionTime;
        return acc;
    }, {}),
    listeners: {
        turnEnd: params => {
            sendAllNextTurnInfos();
            cycleEngine.startNextTurn();
        }
    }
});

const sendAllNextTurnInfos = () => setTimeout(() =>
    sendAll(
        BattleTurnStartMessage(cycleEngine.getNextTurnInfos())
    ), 200);

wss.on('connection', function (ws) {

    const startTime = Date.now() + 5000;

    const send = action => {
        console.log('send: %s', JSON.stringify(action));
        ws.send(JSON.stringify([ action ]));
    };

    ws.on('message', function (message: string) {
        console.log('received: %s', message);
        if (message[ 0 ] !== '[') {
            return;
        }

        if (!cycleEngine.isStarted()) {
            cycleEngine.start(startTime);
        }

        const actionList = JSON.parse(message);
        actionList.forEach(message => {
            if (BattleLoadMessage.match(message)) {

                const response = BattleLoadMessage.createResponse(message.requestId, battleLoadData);
                send(response);
                sendAllNextTurnInfos();
            }
        });
    });

});
