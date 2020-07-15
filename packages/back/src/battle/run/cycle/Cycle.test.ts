import { BRunGlobalTurnStartSAction, denormalize, GLOBALTURN_DELAY, Normalized, ServerAction, TimerTester, TURN_DELAY } from '@timeflies/shared';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { EntitiesGetter } from '../battleStateManager/BattleStateManager';
import { Character } from '../entities/character/Character';
import { seedCharacter } from '../entities/character/Character.seed';
import { Player } from '../entities/player/Player';
import { seedPlayer } from '../entities/player/Player.seed';
import { Cycle } from './Cycle';
import { GlobalTurn, GlobalTurnState } from './turn/GlobalTurn';
import WebSocket = require('ws');

describe('# Cycle', () => {

    const timerTester = new TimerTester();

    let onSendFn1: (action: ServerAction[]) => void;
    let onSendFn2: (action: ServerAction[]) => void;

    let sockets: WebSocket[];

    let players: Player[];

    let characters: Normalized<Character>;

    const getter: EntitiesGetter<'characters'> = () => characters;

    let cycle: Cycle;

    beforeEach(() => {
        timerTester.beforeTest();

        sockets = [
            seedWebSocket({
                onSendFn: () => onSendFn1
            }).ws,
            seedWebSocket({
                onSendFn: () => onSendFn2
            }).ws
        ];

        players = sockets.map(s => seedPlayer({}, undefined, new WSSocket(s).createPool()));

        characters = seedCharacter(
            { length: 3 },
            players[ 1 ].id
        );
        characters[ '1' ].playerId = players[ 0 ].id;

        onSendFn1 = () => { };
        onSendFn2 = () => { };
    });

    afterEach(() => {
        cycle = undefined as any;

        sockets.forEach(c => c.close());

        characters = {};
        players.length = 0;
        sockets.length = 0;

        timerTester.afterTest();
    });

    it('should not start on init', () => {

        const cycle = Cycle(players, getter);

        expect(cycle.globalTurn).toBeUndefined();
    });

    it('should run the first global turn & not send action', async () => {

        onSendFn1 = jest.fn();

        const launchTime = timerTester.now;

        cycle = Cycle(players, getter);
        cycle.start(launchTime);

        expect(cycle.globalTurn).toMatchObject<Partial<GlobalTurn>>({
            id: 0,
            startTime: launchTime
        });

        await timerTester.advanceBy(1000);

        expect(onSendFn1).not.toHaveBeenCalled();
    });

    it('should send action on second turn, not before', async () => {

        const actions: ServerAction[] = [];

        const on = jest.fn((actionList: ServerAction[]) => {
            actions.push(...actionList);
        });

        // test for the TWO players
        onSendFn1 = onSendFn2 = on;

        const launchTime = timerTester.now;

        cycle = Cycle(players, getter);
        cycle.start(launchTime);

        expect(on).not.toHaveBeenCalled();

        const { turnDuration } = cycle.globalTurn.currentTurn;

        await timerTester.advanceBy(turnDuration + TURN_DELAY + 10);

        expect(on).toHaveBeenCalledTimes(players.length);

        expect(actions
            .filter(a => a.type === 'battle-run/turn-start')
        ).toHaveLength(players.length);

        expect(actions
            .map(a => a.type)
        ).not.toContain<BRunGlobalTurnStartSAction[ 'type' ]>('battle-run/global-turn-start')
    });

    it('should run a complete global turn, then run the next one', async () => {

        const actions: ServerAction[] = [];

        const on = jest.fn((actionList: ServerAction[]) => {
            actions.push(...actionList);
        });

        // test for only ONE player
        onSendFn1 = on;

        const launchTime = timerTester.now;

        cycle = Cycle(players, getter);
        cycle.start(launchTime);

        const characterList = denormalize(characters);
        let isFirstCharacter = true;
        for(const c of characterList) {
            const delay = isFirstCharacter ? 0 : TURN_DELAY;
            await timerTester.advanceBy(c.features.actionTime + delay);
            isFirstCharacter = false;
        }

        // workaround for triggering ended promise 'then'
        await timerTester.advanceBy(0);

        expect(cycle.globalTurn.id).toBe(1);
        expect(cycle.globalTurn.currentTurn.id).toBe(characterList.length);
        expect(cycle.globalTurn.state).toBe<GlobalTurnState>('idle');

        await timerTester.advanceBy(GLOBALTURN_DELAY);

        expect(cycle.globalTurn.state).toBe<GlobalTurnState>('running');

        const actionTypes = actions.map(a => a.type);

        // note that the first global turn does not send any action
        expect(actionTypes
            .filter(t => t === 'battle-run/global-turn-start')
        ).toHaveLength(1);

        // note that the first turn of a global turn does not send any action
        expect(actionTypes
            .filter(t => t === 'battle-run/turn-start')
        ).toHaveLength(denormalize(characters).length - 1);
    });
});
