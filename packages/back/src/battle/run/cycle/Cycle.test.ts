import { BRunGlobalTurnStartSAction, GLOBALTURN_DELAY, ServerAction, TimerTester, TURN_DELAY } from '@timeflies/shared';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { Character } from '../entities/character/Character';
import { seedCharacter } from '../entities/character/Character.seed';
import { Player } from '../entities/player/Player';
import { seedPlayer } from '../entities/player/Player.seed';
import { Cycle } from './Cycle';
import { GlobalTurn, GlobalTurnState } from './turn/GlobalTurn';
import WebSocket = require('ws');

describe('# Cycle', () => {

    const timerTester = new TimerTester();

    let onSendFn1: (action: ServerAction) => void;
    let onSendFn2: (action: ServerAction) => void;

    let sockets: WebSocket[];

    let players: Player[];

    let characters: Character[];

    let cycle: Cycle;

    beforeEach(() => {
        timerTester.beforeTest();

        sockets = [
            seedWebSocket({
                onSendFn: () => onSendFn1
            }),
            seedWebSocket({
                onSendFn: () => onSendFn2
            })
        ];

        players = sockets.map(s => seedPlayer({ socket: new WSSocket(s) }));

        characters = seedCharacter(
            { length: 3 },
            i => i < 2 ? players[ 0 ] : players[ 1 ]
        );

        onSendFn1 = () => { };
        onSendFn2 = () => { };
    });

    afterEach(() => {
        cycle = undefined as any;

        sockets.forEach(c => c.close());

        characters.length = 0;
        players.length = 0;
        sockets.length = 0;

        timerTester.afterTest();
    });

    it('should not start on init', () => {

        const cycle = Cycle({ players, characters });

        expect(cycle.globalTurn).toBeUndefined();
    });

    it('should run the first global turn & not send action', () => {

        onSendFn1 = jest.fn();

        const launchTime = timerTester.now;

        cycle = Cycle({ players, characters });
        cycle.start(launchTime);

        expect(cycle.globalTurn).toMatchObject<Partial<GlobalTurn>>({
            id: 0,
            startTime: launchTime
        });

        timerTester.advanceBy(1000);

        expect(onSendFn1).not.toHaveBeenCalled();
    });

    it('should send action on second turn, not before', () => {

        const actions: ServerAction[] = [];

        const on = jest.fn((action: ServerAction) => {
            actions.push(action);
        });

        // test for the TWO players
        onSendFn1 = onSendFn2 = on;

        const launchTime = timerTester.now;

        cycle = Cycle({ players, characters });
        cycle.start(launchTime);

        expect(on).not.toHaveBeenCalled();

        const { turnDuration } = cycle.globalTurn.currentTurn;

        timerTester.advanceBy(turnDuration + TURN_DELAY + 10);

        expect(on).toHaveBeenCalledTimes(players.length);

        expect(actions
            .filter(a => a.type === 'battle-run/turn-start')
        ).toHaveLength(players.length);

        expect(actions
            .map(a => a.type)
        ).not.toContain<BRunGlobalTurnStartSAction[ 'type' ]>('battle-run/global-turn-start')
    });

    it('should run a complete global turn, then run the next one', () => {

        const actions: ServerAction[] = [];

        const on = jest.fn((action: ServerAction) => {
            actions.push(action);
        });

        // test for only ONE player
        onSendFn1 = on;

        const launchTime = timerTester.now;

        cycle = Cycle({ players, characters });
        cycle.start(launchTime);

        let advance = 0;
        characters.forEach((c, i) => {
            const delay = i && TURN_DELAY;
            advance += c.features.actionTime + delay;
        });
        timerTester.advanceBy(advance);

        expect(cycle.globalTurn.id).toBe(1);
        expect(cycle.globalTurn.currentTurn.id).toBe(characters.length);
        expect(cycle.globalTurn.state).toBe<GlobalTurnState>('idle');

        timerTester.advanceBy(GLOBALTURN_DELAY);

        expect(cycle.globalTurn.state).toBe<GlobalTurnState>('running');

        const actionTypes = actions.map(a => a.type);

        // note that the first global turn does not send any action
        expect(actionTypes
            .filter(t => t === 'battle-run/global-turn-start')
        ).toHaveLength(1);

        // note that the first turn of a global turn does not send any action
        expect(actionTypes
            .filter(t => t === 'battle-run/turn-start')
        ).toHaveLength(characters.length - 1);
    });
});
