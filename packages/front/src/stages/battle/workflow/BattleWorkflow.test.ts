import { StoreTest } from '../../../StoreTest';
import { Position, TimerTester } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction } from '../../../socket/WSClient';
import { UIStateBattle } from '../../../ui/UIState';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { BState } from '../battleState/BattleStateSchema';
import { BStateMachine } from '../battleState/BStateMachine';
import { CycleManager } from '../cycle/CycleManager';
import { SpellEngineBindAction } from '../engine/Engine';
import { MapManager } from '../map/MapManager';
import { seedMapManager } from '../map/MapManager.seed';
import { SnapshotManager } from '../snapshot/SnapshotManager';
import { SpellActionManager } from '../spellAction/SpellActionManager';

describe('Battle workflow', () => {

    const timerTester = new TimerTester();

    const init = (mapManager?: MapManager) => {

        let pathPromise;

        mapManager = mapManager || {
            ...seedMapManager(),
            worldToTileIfExist() { return {x: 5, y: 5}; },
            calculatePath() {
                pathPromise = new Promise<Position[]>(r => r([
                    { x: -1, y: -1 },
                    {x: 5, y: 5},
                ]));
                return {
                    cancel: () => true,
                    promise: pathPromise
                };
            }
        };

        const characterCurrent = seedCharacter();
        const characterFuture = seedCharacter();

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    cycle: {
                        launchTime: timerTester.now
                    },
                    current: {
                        characters: [ characterCurrent ]
                    },
                    future: {
                        characters: [ characterFuture ],
                        teams: [],
                        spellActionSnapshotList: []
                    }
                } as any
            }
        });

        const cycle = CycleManager();

        const snapshotManager = SnapshotManager();

        const spellActionManager = SpellActionManager(snapshotManager);

        const bState = BStateMachine(mapManager);

        cycle.start({
            id: 1,
            order: [ characterCurrent.id ],
            startTime: timerTester.now,
            currentTurn: {
                id: 1,
                characterId: characterCurrent.id,
                startTime: timerTester.now
            }
        });

        const battleHash = (() => {
            try {
                return snapshotManager.getLastHash();
            } catch (e) {
                return;
            }
        })();

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        return {
            characterCurrent,
            characterFuture,
            cycle,
            snapshotManager,
            spellActionManager,
            bState,
            battleHash,
            bindAction,
            pathPromise
        };
    };

    beforeEach(() => {
        StoreTest.beforeTest();
        timerTester.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
        timerTester.afterTest();
    });

    it('should change battle state to "spellPrepare" on turn start', () => {

        const { bState } = init();

        expect(bState.state).toBe<BState>('spellPrepare');
    });

    it('should change battle state to "watch" on turn end', () => {

        const { bState, characterCurrent } = init();

        expect(bState.state).toBe<BState>('spellPrepare');

        timerTester.advanceBy(characterCurrent.features.actionTime);

        expect(bState.state).toBe<BState>('watch');
    });

    it('should commit on turn end', () => {

        const { snapshotManager, characterCurrent, battleHash } = init();

        timerTester.advanceBy(characterCurrent.features.actionTime);

        expect(snapshotManager.getLastHash()).not.toBe(battleHash);
    });

    it('should commit after spell action', async () => {

        const { snapshotManager, bindAction, pathPromise, battleHash } = init();

        const { onTileHover, onTileClick } = bindAction;

        onTileHover({ x: -1, y: -1 });

        await pathPromise;

        onTileClick({ x: -1, y: -1 });

        await serviceNetwork({});

        expect(snapshotManager.getLastHash()).not.toBe(battleHash);
    });

    it('should send message after spell action', async () => {

        const { bindAction, pathPromise } = init();

        const { onTileHover, onTileClick } = bindAction;

        onTileHover({ x: -1, y: -1 });

        await pathPromise;

        StoreTest.clearActions();

        onTileClick({ x: -1, y: -1 });

        await serviceNetwork({});

        expect(StoreTest.getActions()).toEqual(
            expect.arrayContaining<SendMessageAction>([
                expect.objectContaining<SendMessageAction>({
                    type: 'message/send',
                    message: {
                        type: 'battle/spellAction',
                        spellAction: expect.anything()
                    }
                })
            ])
        );
    });

    it('should change future battle data against current one after two spell actions', async () => {

        let getPos: () => Position;

        let pathPromise;

        const { characterCurrent, bindAction } = init({
            ...seedMapManager(),
            worldToTileIfExist() { return getPos(); },
            calculatePath() {
                pathPromise = new Promise<Position[]>(r => r([
                    { x: -1, y: -1 },
                    getPos(),
                ]));
                return {
                    cancel: () => true,
                    promise: pathPromise
                };
            }
        });

        const firstPos = characterCurrent.position;

        const { onTileHover, onTileClick } = bindAction;

        // first spell action

        getPos = () => ({ x: 5, y: 5 });

        onTileHover({ x: -1, y: -1 });

        await pathPromise;

        onTileClick({ x: -1, y: -1 });

        await serviceNetwork({});

        const { battleData } = StoreTest.getStore().getState().data as UIStateBattle;

        expect(battleData.future.characters[ 0 ].position).toEqual({ x: 5, y: 5 });

        // second spell action

        getPos = () => ({ x: 6, y: 5 });

        onTileHover({ x: -1, y: -1 });

        await pathPromise;

        onTileClick({ x: -1, y: -1 });

        await serviceNetwork({});

        expect(battleData.future.characters[ 0 ].position).toEqual({ x: 6, y: 5 });
        expect(battleData.current.characters[ 0 ].position).toEqual(firstPos);
    });
});
