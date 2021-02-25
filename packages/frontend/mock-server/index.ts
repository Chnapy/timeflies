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
    staticPlayers: [
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
    staticCharacters: [
        {
            characterId: 'c1',
            characterRole: 'tacka',
            playerId: 'p1',
            defaultSpellId: 's1',
        },
        {
            characterId: 'c2',
            characterRole: 'meti',
            playerId: 'p1',
            defaultSpellId: 's3',
        },
        {
            characterId: 'c3',
            characterRole: 'vemo',
            playerId: 'p2',
            defaultSpellId: 's5',
        }
    ],
    staticSpells: [
        {
            characterId: 'c1',
            spellId: 's1',
            spellRole: 'move',
        },
        {
            characterId: 'c1',
            spellId: 's2',
            spellRole: 'simpleAttack',
        },
        {
            characterId: 'c2',
            spellId: 's3',
            spellRole: 'switch',
        },
        {
            characterId: 'c2',
            spellId: 's4',
            spellRole: 'simpleAttack',
        },
        {
            characterId: 'c3',
            spellId: 's5',
            spellRole: 'move',
        },
        {
            characterId: 'c3',
            spellId: 's6',
            spellRole: 'simpleAttack',
        }
    ],
    initialSerializableState: {
        checksum: '',
        time: Date.now(),
        characters: {
            actionTime: {
                c1: 10000,
                c2: 12000,
                c3: 9000
            },
            health: {
                c1: 100,
                c2: 110,
                c3: 120
            },
            orientation: {
                c1: 'bottom',
                c2: 'left',
                c3: 'top'
            },
            position: {
                c1: createPosition(8, 3),
                c2: createPosition(10, 3),
                c3: createPosition(9, 11)
            }
        },
        spells: {
            duration: {
                s1: 1000,
                s2: 2000,
                s3: 800,
                s4: 2000,
                s5: 1000,
                s6: 2000,
            },
            rangeArea: {
                s1: 10,
                s2: 6,
                s3: 2,
                s4: 6,
                s5: 1,
                s6: 6,
            },
            actionArea: {
                s1: 1,
                s2: 2,
                s3: 1,
                s4: 2,
                s5: 1,
                s6: 2,
            },
            lineOfSight: {
                s1: true,
                s2: true,
                s3: false,
                s4: true,
                s5: true,
                s6: true,
            },
            attack: {
                s2: 20,
                s4: 20,
                s6: 20,
            }
        }
    },
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
    charactersDurations: battleLoadData.initialSerializableState.characters.actionTime,
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
    ), 1000);

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
