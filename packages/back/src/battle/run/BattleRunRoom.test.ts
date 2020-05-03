import { assertIsDefined, BattleRunSAction, CharacterSnapshot, ConfirmSAction, MapConfig, NotifySAction, SpellActionCAction, TimerTester } from '@timeflies/shared';
import { Server, WebSocket } from 'mock-socket';
import path from 'path';
import { PlayerService } from '../../PlayerService';
import { TeamData } from '../../TeamData';
import { WSSocket } from '../../transport/ws/WSSocket';
import { BattleRunRoom } from './BattleRunRoom';

describe('BattleRunRoom', () => {

    const timerTester = new TimerTester();

    const URL = `ws://localhost:1234`;

    const playerService = new PlayerService();

    const mapConfig: MapConfig = {
        id: 'm-1',
        schemaUrl: path.join('map', 'sample2', 'map.json'),
        name: 'm1',
        height: 10,
        nbrCharactersPerTeam: 1,
        nbrTeams: 1,
        previewUrl: '',
        width: 10
    };


    const getTeams: () => TeamData[] = () => [
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
    let teams: TeamData[];

    let server: Server;

    let clients: WebSocket[];

    let battleRunRoom: BattleRunRoom;

    const generateBattleRunRoom = ({
        c0OnStart, c0OnConfirm, c1OnNotify,
        c0GetCharActionCAction
    }: {
        c0GetCharActionCAction?: (initialAction: SpellActionCAction) => SpellActionCAction,
        c0OnStart?: () => void,
        c0OnConfirm?: (action: ConfirmSAction) => void,
        c1OnNotify?: (action: NotifySAction) => void
    }) => {
        battleRunRoom = BattleRunRoom(mapConfig, teams);

        const onStart = (char: CharacterSnapshot) => {
            const position = {
                ...char.position,
                y: char.position.y + 1
            };

            const spell = char.spellsSnapshots.find(s => s.staticData.type === 'move');

            assertIsDefined(spell);

            const initialAction: SpellActionCAction = {
                type: 'battle/spellAction',
                sendTime: Date.now() + 5000,
                spellAction: {
                    startTime: Date.now() + 5000,
                    battleHash: '',
                    characterId: char.id,
                    duration: spell.features.duration,
                    spellId: spell.id,
                    position,
                    actionArea: [ position ],
                    fromNotify: false,
                    validated: false
                }
            };
            const action: SpellActionCAction = c0GetCharActionCAction
                ? c0GetCharActionCAction(initialAction)
                : initialAction;

            clients[ 0 ].send(JSON.stringify([ action ]));
        };

        clients[ 0 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const actionList: BattleRunSAction[] = JSON.parse(message.data);

            actionList.forEach(action => {

                switch (action.type) {
                    case 'battle-run/launch':
                        const { teamsSnapshots } = action.battleSnapshot;
                        const players = teamsSnapshots.flatMap(t => t.playersSnapshots);
                        const characters = players.flatMap(p => p.charactersSnapshots);

                        const char = characters[ 0 ];

                        if (c0OnStart)
                            c0OnStart();

                        onStart(char);
                        break;

                    case 'confirm':
                        if (c0OnConfirm)
                            c0OnConfirm(action);
                        break;
                }
            });
        };

        clients[ 1 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const actionList: BattleRunSAction[] = JSON.parse(message.data);

            actionList.forEach(action => {
                if (action.type === 'notify') {
                    if (c1OnNotify)
                        c1OnNotify(action);
                }
            });
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();
    };

    beforeEach(() => {
        timerTester.beforeTest();

        teams = getTeams();

        server = new Server(URL);
        let i = 0;
        server.on('connection', socket => {
            const wss = new WSSocket(socket as any);
            const player = playerService.getPlayer(wss, i);
            i++;
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
        timerTester.afterTest();

        if (server) server.close();
        clients.forEach(c => c.close());

        clients = [];
        teams = [];
    });

    test('should correctly init & start: parsing map, place characters, receive first actions', () => {
        battleRunRoom = BattleRunRoom(mapConfig, teams);

        const encounteredTypes: BattleRunSAction[ 'type' ][] = [];

        const jestFn = jest.fn();
        clients[ 1 ].onmessage = (m: any) => {
            if (m.type !== 'message') return;

            jestFn();
        }

        clients[ 0 ].onmessage = (message: any) => {
            if (message.type !== 'message') return;

            const actionList: BattleRunSAction[] = JSON.parse(message.data);

            actionList.forEach(action => {
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
            });
        };

        battleRunRoom.start();

        jest.runOnlyPendingTimers();

        expect(jestFn).toHaveBeenCalled();

        expect(encounteredTypes).toEqual(expect.arrayContaining<BattleRunSAction[ 'type' ]>([
            "battle-run/launch"
        ]));
    });

    // TODO
    it.skip('should play a turn with a valid char action', async () => {
        const startFn = jest.fn();
        const notifyFn = jest.fn();

        let charActionSendTime: number;

        generateBattleRunRoom({
            c0OnStart: startFn,
            c0OnConfirm: action => {
                console.log('a', action);
                expect(action.isOk).toBe(true);
            },
            c1OnNotify: action => {
                notifyFn();
                expect(action.spellActionSnapshot.startTime).toBe(charActionSendTime);
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
