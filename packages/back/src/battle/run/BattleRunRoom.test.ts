import { BattleRunSAction, CharacterSnapshot, CharActionCAction, ConfirmSAction, MapInfos, NotifySAction } from '@timeflies/shared';
import { Server, WebSocket } from 'mock-socket';
import path from 'path';
import { PlayerService } from '../../PlayerService';
import { Team } from '../../Team';
import { WSSocket } from '../../transport/ws/WSSocket';
import { BattleRunRoom } from './BattleRunRoom';
import { TimerTester } from '../../__testUtils__/TimerTester';

describe('BattleRunRoom', () => {

    const timerTester = new TimerTester();

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

    const generateBattleRunRoom = ({
        c0OnStart, c0OnConfirm, c1OnNotify,
        c0GetCharActionCAction
    }: {
        c0GetCharActionCAction?: (initialAction: CharActionCAction) => CharActionCAction,
        c0OnStart?: () => void,
        c0OnConfirm?: (action: ConfirmSAction) => void,
        c1OnNotify?: (action: NotifySAction) => void
    }) => {
        battleRunRoom = new BattleRunRoom(mapInfos, teams);

        battleRunRoom.init();

        const onStart = (char: CharacterSnapshot) => {
            const initialAction: CharActionCAction = {
                type: 'charAction',
                sendTime: Date.now() + 5000,
                charAction: {
                    spellId: char.spellsSnapshots.find(s => s.staticData.type === 'move')!.staticData.id,
                    positions: [{
                        ...char.position,
                        x: char.position.x + 1
                    }]
                }
            };
            const action: CharActionCAction = c0GetCharActionCAction
                ? c0GetCharActionCAction(initialAction)
                : initialAction;

            clients[0].send(JSON.stringify(action));
        };

        clients[0].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const action: BattleRunSAction = JSON.parse(message.data);

            switch (action.type) {
                case 'battle-run/launch':
                    const { teamsSnapshots } = action.battleSnapshot;
                    const players = teamsSnapshots.flatMap(t => t.playersSnapshots);
                    const characters = players.flatMap(p => p.charactersSnapshots);

                    const char = characters[0];

                    if (c0OnStart)
                        c0OnStart();

                    onStart(char);
                    break;

                case 'confirm':
                    if (c0OnConfirm)
                        c0OnConfirm(action);
                    break;
            }

        };

        clients[1].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const action: BattleRunSAction = JSON.parse(message.data);

            if (action.type === 'notify') {
                if (c1OnNotify)
                    c1OnNotify(action);
            }
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();
    };

    beforeEach(() => {
        timerTester.beforeTest();

        teams = getTeams();

        server = new Server(URL);
        server.on('connection', socket => {
            const wss = new WSSocket(socket as any);
            const player = playerService.getPlayer(wss);
            if (teams[0].players.length) {
                teams[1].players.push(player);
            } else {
                teams[0].players.push(player);
            }

        });

        clients = [1, 2].map(_ => new WebSocket(URL));

        jest.runOnlyPendingTimers();
    });

    afterEach(() => {
        timerTester.afterTest();
        
        if (server) server.close();
        clients.forEach(c => c.close());

        clients = [];
        teams = [];
    });

    test('should correctly init & start: parsing map, place characters, receive first actions', () => {
        battleRunRoom = new BattleRunRoom(mapInfos, teams);

        battleRunRoom.init();

        const encounteredTypes: BattleRunSAction['type'][] = [];

        const jestFn = jest.fn();
        clients[1].onmessage = (m: any) => {
            if (m.type !== 'message') return;

            jestFn();
        }

        clients[0].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const action: BattleRunSAction = JSON.parse(message.data);

            encounteredTypes.push(action.type);

            if (action.type === 'battle-run/launch') {

                expect(action.battleSnapshot.launchTime).toBeGreaterThan(Date.now());

                const positions = action.battleSnapshot.teamsSnapshots
                    .flatMap(t => t.playersSnapshots
                        .flatMap(p => p.charactersSnapshots
                            .flatMap(c => c.position)
                        )
                    );
                expect(positions).not.toContain(undefined);
                expect(positions.some(p => p.x < 0 || p.y < 0)).toBeFalsy();
            }
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();

        expect(jestFn).toHaveBeenCalled();

        expect(encounteredTypes).toEqual(expect.arrayContaining<BattleRunSAction['type']>([
            "battle-run/launch"
        ]));
    });

    test('should play a turn with a valid char action', async () => {
        const startFn = jest.fn();
        const notifyFn = jest.fn();

        let charActionSendTime: number;

        generateBattleRunRoom({
            c0OnStart: startFn,
            c0OnConfirm: action => expect(action.isOk).toBe(true),
            c1OnNotify: action => {
                notifyFn();
                expect(action.startTime).toBe(charActionSendTime);
            },
            c0GetCharActionCAction: initialAction => {
                charActionSendTime = initialAction.sendTime;
                return initialAction;
            }
        });

        expect(startFn).toBeCalled();
        expect(notifyFn).toBeCalled();
    });

    test('should send an invalid charAction and be notified on that', async () => {
        const notifyFn = jest.fn();

        generateBattleRunRoom({
            c0OnConfirm: action => expect(action.isOk).toBe(false),
            c1OnNotify: action => {
                notifyFn();
            },
            c0GetCharActionCAction: initialAction => {
                initialAction.sendTime -= 10000;
                return initialAction;
            }
        });

        expect(notifyFn).not.toBeCalled();
    });

});
