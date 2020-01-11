import path from 'path';
import { MapInfos } from "../../shared/MapInfos";
import { Server, WebSocket } from 'mock-socket';
import { WSSocket } from '../../transport/ws/WSSocket';
import { PlayerService } from '../../PlayerService';
import { Team } from '../../shared/Team';
import { BattleRunRoom } from './BattleRunRoom';
import { BRunLaunchSAction } from '../../shared/action/BattleRunAction';

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


    const teams: Team[] = [
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

    let server: Server;

    let c1: WebSocket;
    let c2: WebSocket;

    let battleRunRoom: BattleRunRoom;

    jest.useFakeTimers();

    beforeEach(() => {
        if (server) server.close();
        if (c1) c1.close();
        if (c2) c2.close();

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

        c1 = new WebSocket(URL);
        c2 = new WebSocket(URL);

        jest.runOnlyPendingTimers();
    });

    test('should correctly init & start: parsing map, place characters, send first action', () => {
        battleRunRoom = new BattleRunRoom(mapInfos, teams);

        battleRunRoom.init();

        const type: BRunLaunchSAction['type'] = 'battle-run/launch';

        const jestFn = jest.fn();

        c1.onmessage = (message: any) => {
            if (message.type !== 'message') return;

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

    // ON: CHAR-ACTION
    //  Do checks: character is playing its turn etc
    //  Apply changes
    //  Send confirm to sender
    //  Send changes to others

});
