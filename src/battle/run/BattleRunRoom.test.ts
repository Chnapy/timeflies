import path from 'path';
import { MapInfos } from "../../shared/MapInfos";
import { Server, WebSocket } from 'mock-socket';
import { WSSocket } from '../../transport/ws/WSSocket';
import { PlayerService } from '../../PlayerService';
import { Team } from '../../shared/Team';
import { BattleRunRoom } from './BattleRunRoom';
import { BRunLaunchSAction, BattleRunCAction, BattleRunSAction } from '../../shared/action/BattleRunAction';
import { CharacterSnapshot } from '../../shared/Character';

describe('BattleRunRoom', () => {
    const URL = `ws://localhost:1234`;

    const playerService = new PlayerService();

    const mapInfos: MapInfos = {
        urls: {
            schema: path.join('map', 'sample1', 'map_2.json'),
            sheet: path.join('map', 'sample1', 'map_2.png')
        },
        mapKey: 'sampleMap1',
        tilemapKey: 'map_main',
        decorLayerKey: 'decors',
        obstaclesLayerKey: 'obstacles',
        initLayerKey: 'init'
    };


    const getTeams: () => Team[] = () => [
        {
            id: '1',
            color: '#FF0000',
            name: 'Team Rocket',
            players: []
        },
        {
            id: '2',
            color: '#FF00FF',
            name: 'Team Azure',
            players: []
        }
    ];
    let teams: Team[];

    let server: Server;

    let clients: WebSocket[];

    let battleRunRoom: BattleRunRoom;

    jest.useFakeTimers();

    beforeEach(() => {
        teams = getTeams();

        server = new Server(URL);
        server.on('connection', socket => {
            const wss = new WSSocket(socket as any);
            const player = playerService.getPlayer(wss);
            if (teams[ 0 ].players.length) {
                teams[ 1 ].players.push(player);
            } else {
                teams[ 0 ].players.push(player);
            }

        });

        clients = [ 1, 2 ].map(_ => new WebSocket(URL));

        jest.runOnlyPendingTimers();
    });

    afterEach(() => {
        if (server) server.close();
        clients.forEach(c => c.close());

        clients = [];
        teams = [];
    });

    test('should correctly init & start: parsing map, place characters, send first action', () => {
        battleRunRoom = new BattleRunRoom(mapInfos, teams);

        battleRunRoom.init();

        const type: BRunLaunchSAction[ 'type' ] = 'battle-run/launch';

        const jestFn = jest.fn();
        clients[ 1 ].onmessage = (m: any) => {
            console.log('M2', m);
            jestFn()
        }

        clients[ 0 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;
            console.log('M1', message);
            jestFn();

            const action: BRunLaunchSAction = JSON.parse(message.data);

            expect(action.type === type).toBeTruthy();

            expect(action.battleSnapshot.launchTime).toBeGreaterThan(Date.now());

            const positions = action.battleSnapshot.teamsSnapshots
                .flatMap(t => t.playersSnapshots
                    .flatMap(p => p.charactersSnapshots
                        .flatMap(c => c.position)
                    )
                );
            expect(positions).not.toContain(undefined);
            expect(positions.some(p => p.x < 0 || p.y < 0)).toBeFalsy();
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();

        expect(jestFn).toHaveBeenCalled();
    });

    test('should play a turn with a valid char action', async () => {
        battleRunRoom = new BattleRunRoom(mapInfos, teams);

        battleRunRoom.init();

        const startFn = jest.fn();
        const notifyFn = jest.fn();

        const onStart = (char: CharacterSnapshot) => {
            const action: BattleRunCAction = {
                type: 'charAction',
                sendTime: Date.now(),
                charAction: {
                    spellId: char.spellsSnapshots.find(s => s.staticData.type === 'move')!.staticData.id,
                    positions: [ {
                        ...char.position,
                        x: char.position.x + 1
                    } ]
                }
            };

            clients[ 0 ].send(JSON.stringify(action));

            startFn();
        };

        clients[ 0 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const action: BattleRunSAction = JSON.parse(message.data);

            switch (action.type) {
                case 'battle-run/launch':
                    const { teamsSnapshots } = action.battleSnapshot;
                    const players = teamsSnapshots.flatMap(t => t.playersSnapshots);
                    const characters = players.flatMap(p => p.charactersSnapshots);
                    const positions = characters.flatMap(c => c.position);

                    const char = characters[ 0 ];

                    setTimeout(() => onStart(char), action.battleSnapshot.launchTime - Date.now());

                    jest.runOnlyPendingTimers();
                    break;

                case 'confirm':
                    console.log(action);
                    expect(action.isOk).toBe(true);
                    break;
            }

        };

        clients[ 1 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const action: BattleRunSAction = JSON.parse(message.data);

            if (action.type === 'notify') {
                notifyFn();
            }
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();

        expect(startFn).toBeCalled();
        expect(notifyFn).toBeCalled();
    });
    // ON: CHAR-ACTION
    //  Do checks: character is playing its turn etc
    //  Apply changes
    //  Send confirm to sender
    //  Send changes to others

});
