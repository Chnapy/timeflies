import { StoreTest } from '../../../StoreTest';
import { Position, TimerTester, ConfirmSAction } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction, ReceiveMessageAction } from '../../../socket/WSClient';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { BState, BStateTurnStartAction } from '../battleState/BattleStateSchema';
import { BStateMachine } from '../battleState/BStateMachine';
import { CycleManager } from '../cycle/CycleManager';
import { SpellEngineBindAction } from '../engine/Engine';
import { MapManager } from '../map/MapManager';
import { seedMapManager } from '../map/MapManager.seed';
import { SnapshotManager } from '../snapshot/SnapshotManager';
import { SpellActionManager } from '../spellAction/SpellActionManager';
import { BattleDataCurrent, BattleDataFuture } from '../../../BattleData';

describe('Battleflow', () => {

    const timerTester = new TimerTester();

    const init = (mapManager?: MapManager) => {

        let pathPromise;

        mapManager = mapManager || {
            ...seedMapManager(),
            worldToTileIfExist() { return { x: 5, y: 5 }; },
            calculatePath() {
                pathPromise = new Promise<Position[]>(r => r([
                    { x: -1, y: -1 },
                    { x: 5, y: 5 },
                ]));
                return {
                    cancel: () => true,
                    promise: pathPromise
                };
            }
        };

        const characterCurrent = seedCharacter();
        const characterFuture = seedCharacter();

        const currentBattleData: BattleDataCurrent = {
            battleHash: 'not-defined',
            teams: [],
            players: null as any,
            characters: [ characterCurrent ],
        };

        const futureBattleData: BattleDataFuture = {
            battleHash: 'not-defined',
            teams: [],
            players: null as any,
            characters: [ characterFuture ],
            spellActionSnapshotList: []
        };

        StoreTest.initStore({
            data: {
                state: 'battle',
                battleData: {
                    cycle: {
                        launchTime: timerTester.now
                    },
                    current: currentBattleData,
                    future: futureBattleData
                }
            }
        });

        const cycle = CycleManager();

        const snapshotManager = SnapshotManager();

        const spellActionManager = SpellActionManager();

        const bState = BStateMachine(mapManager);

        const battleHash = futureBattleData.battleHash;

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

        const bindAction = StoreTest.getActions().find((a): a is SpellEngineBindAction =>
            a.type === 'battle/spell-engine/bind'
        )!;

        return {
            currentBattleData,
            futureBattleData,
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

    describe('on turn action:', () => {

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

        it('should commit on turn start', () => {

            const { currentBattleData, futureBattleData, battleHash } = init();

            expect(currentBattleData.battleHash).not.toBe(battleHash);
            expect(futureBattleData.battleHash).not.toBe(battleHash);
        });

        it('should rollback on turn end', async () => {

            const { currentBattleData, futureBattleData, bindAction, pathPromise, characterCurrent } = init();

            timerTester.advanceBy(characterCurrent.features.actionTime - 50);

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;

            onTileHover({ x: -1, y: -1 });

            await pathPromise;

            onTileClick({ x: -1, y: -1 });

            await serviceNetwork({});

            timerTester.advanceBy(50);

            expect(futureBattleData.battleHash).toBe(firstHash);
            expect(currentBattleData.battleHash).toBe(firstHash);
        });
    });

    describe('on spell action:', () => {

        it('should not allow to launch spell with not enough time to use it', async () => {

            const { characterCurrent, futureBattleData, bindAction, pathPromise } = init();

            const firstHash = futureBattleData.battleHash;

            timerTester.advanceBy(characterCurrent.features.actionTime - 80);

            const { onTileHover, onTileClick } = bindAction;

            onTileHover({ x: -1, y: -1 });

            await pathPromise;

            onTileClick({ x: -1, y: -1 });

            await serviceNetwork({});

            expect(futureBattleData.battleHash).toBe(firstHash);
        });

        it('should commit after spell action', async () => {

            const { currentBattleData, futureBattleData, bindAction, pathPromise } = init();

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;

            onTileHover({ x: -1, y: -1 });

            await pathPromise;

            onTileClick({ x: -1, y: -1 });

            await serviceNetwork({});

            expect(futureBattleData.battleHash).not.toBe(firstHash);
            expect(currentBattleData.battleHash).toBe(firstHash);
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

            const { characterCurrent, bindAction, currentBattleData, futureBattleData } = init({
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

            expect(futureBattleData.characters[ 0 ].position).toEqual({ x: 5, y: 5 });

            // second spell action

            getPos = () => ({ x: 6, y: 5 });

            onTileHover({ x: -1, y: -1 });

            await pathPromise;

            onTileClick({ x: -1, y: -1 });

            await serviceNetwork({});

            expect(futureBattleData.characters[ 0 ].position).toEqual({ x: 6, y: 5 });
            expect(currentBattleData.characters[ 0 ].position).toEqual(firstPos);
        });
    });

    describe('on confirm message:', () => {

        it('should rollback on confirm KO', async () => {

            const { characterCurrent, futureBattleData, bindAction, pathPromise } = init();

            StoreTest.dispatch<BStateTurnStartAction>({
                type: 'battle/state/event',
                eventType: 'TURN-START',
                payload: {
                    characterId: characterCurrent.id
                }
            });

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;

            onTileHover({ x: -1, y: -1 });

            await pathPromise;

            onTileClick({ x: -1, y: -1 });

            await serviceNetwork({});

            StoreTest.dispatch<ReceiveMessageAction<ConfirmSAction>>({
                type: 'message/receive',
                message: {
                    type: 'confirm',
                    sendTime: timerTester.now,
                    isOk: false,
                    lastCorrectHash: firstHash
                }
            });

            expect(futureBattleData.battleHash).toBe(firstHash);
        });

    });
});
