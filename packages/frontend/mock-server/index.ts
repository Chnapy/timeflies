import { createPosition } from '@timeflies/common';
import { BattleLoadMessage } from '@timeflies/socket-messages';
import * as cors from "cors";
import * as express from 'express';
import * as http from 'http';

const app = express() as any;

app.use(
    cors({ allowedHeaders: '*' }),
);

app.use('/public', express.static('mock-server/public'));

const server = http.createServer(app);

const WebSocketServer = require('ws').Server;

const port = 40510;
const wss = new WebSocketServer({ server });

console.log('Mock server started');

server.listen(port, () => {
    console.log('server listening address', server.address());
    console.log('ws listening address', wss.address());
});

wss.on('connection', function (ws) {
    const send = action => {
        console.log('send: %s', JSON.stringify(action));
        ws.send(JSON.stringify([ action ]));
    };

    ws.on('message', function (message) {
        console.log('received: %s', message);
        if (message[ 0 ] !== '[') {
            return;
        }

        const actionList = JSON.parse(message);
        actionList.forEach(message => {
            if (BattleLoadMessage.match(message)) {
                const response = BattleLoadMessage.createResponse(message.requestId, {
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
                            defaultSpellRole: 'move',
                            initialVariables: {
                                actionTime: 10000,
                                health: 100,
                                orientation: 'bottom',
                                position: createPosition(1, 1),
                            },
                        },
                        {
                            characterId: 'c2',
                            characterRole: 'meti',
                            playerId: 'p1',
                            defaultSpellRole: 'switch',
                            initialVariables: {
                                actionTime: 12000,
                                health: 120,
                                orientation: 'left',
                                position: createPosition(2, 1),
                            },
                        },
                        {
                            characterId: 'c3',
                            characterRole: 'vemo',
                            playerId: 'p2',
                            defaultSpellRole: 'move',
                            initialVariables: {
                                actionTime: 9000,
                                health: 110,
                                orientation: 'bottom',
                                position: createPosition(3, 1),
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
                                rangeArea: 1,
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
                    startTime: Date.now() + 5000,
                    turnsOrder: [ 'c2', 'c1', 'c3' ]
                });
                send(response);
            }
        });
    });

});
