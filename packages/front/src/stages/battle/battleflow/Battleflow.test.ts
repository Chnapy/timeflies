import { StoreTest } from '../../../StoreTest';
import { Position, TimerTester, ConfirmSAction, TiledManager } from '@timeflies/shared';
import { serviceNetwork } from '../../../services/serviceNetwork';
import { SendMessageAction, ReceiveMessageAction } from '../../../socket/WSClient';
import { seedCharacter } from '../../../__seeds__/seedCharacter';
import { BState, BStateTurnStartAction } from '../battleState/BattleStateSchema';
import { BStateMachine } from '../battleState/BStateMachine';
import { CycleManager } from '../cycle/CycleManager';
import { SpellEngineBindAction } from '../engine/Engine';
import { seedMapManager } from '../map/MapManager.seed';
import { SnapshotManager } from '../snapshot/SnapshotManager';
import { SpellActionManager } from '../spellAction/SpellActionManager';
import { BattleDataCurrent, BattleDataFuture } from '../../../BattleData';

describe('Battleflow', () => {

    const timerTester = new TimerTester();

    const init = () => {

        const initialPos: Position = { x: 4, y: 3 };

        const characterCurrent = seedCharacter({ position: initialPos });
        const characterFuture = seedCharacter({ position: initialPos });

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

        const mapManager = seedMapManager('real', 'map_1');

        mapManager.refreshPathfinder();

        // from x:4 y:3
        const posAvailables: readonly Position[] = [
            {x: 4, y: 4},
            {x: 5, y: 4},
            {x: 6, y: 4},
        ];

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
            posAvailables
        };
    };

    const awaitAndAdvance10 = async (promise: Promise<any>) => {
        timerTester.advanceBy(10);
        return await promise;
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

            const { currentBattleData, futureBattleData, bindAction, characterCurrent, posAvailables } = init();

            timerTester.advanceBy(characterCurrent.features.actionTime - 50);

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;

            await awaitAndAdvance10(onTileHover(posAvailables[0]));

            await onTileClick(posAvailables[0]);

            await serviceNetwork({});

            timerTester.advanceBy(50);

            expect(futureBattleData.battleHash).toBe(firstHash);
            expect(currentBattleData.battleHash).toBe(firstHash);
        });
    });

    describe('on spell action:', () => {

        it('should not allow to launch spell with not enough time to use it', async () => {

            const { characterCurrent, futureBattleData, bindAction, posAvailables } = init();

            const firstHash = futureBattleData.battleHash;

            timerTester.advanceBy(characterCurrent.features.actionTime - 80);

            const { onTileHover, onTileClick } = bindAction;

            await await awaitAndAdvance10(onTileHover(posAvailables[0]));

            await onTileClick(posAvailables[0]);

            await serviceNetwork({});

            expect(futureBattleData.battleHash).toBe(firstHash);
        });

        it('should commit after spell action', async () => {

            const { currentBattleData, futureBattleData, bindAction, posAvailables } = init();

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;
            
            await awaitAndAdvance10(onTileHover(posAvailables[0]))

            await onTileClick(posAvailables[0]);

            await serviceNetwork({});

            expect(futureBattleData.battleHash).not.toBe(firstHash);
            expect(currentBattleData.battleHash).toBe(firstHash);
        });

        it('should send message after spell action', async () => {

            const { bindAction, posAvailables } = init();

            const { onTileHover, onTileClick } = bindAction;

            await awaitAndAdvance10(onTileHover(posAvailables[0]))

            StoreTest.clearActions();

            await onTileClick(posAvailables[0]);

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

            const { characterCurrent, bindAction, currentBattleData, futureBattleData, posAvailables } = init();

            const firstPos = characterCurrent.position;

            const { onTileHover, onTileClick } = bindAction;

            // first spell action

            await awaitAndAdvance10(onTileHover(posAvailables[0]))

            await onTileClick(posAvailables[0]);

            await serviceNetwork({});

            expect(futureBattleData.characters[ 0 ].position).toEqual(posAvailables[0]);

            // second spell action

            await awaitAndAdvance10(onTileHover(posAvailables[1]))

            await onTileClick(posAvailables[1]);

            await serviceNetwork({});

            expect(futureBattleData.characters[ 0 ].position).toEqual(posAvailables[1]);
            expect(currentBattleData.characters[ 0 ].position).toEqual(firstPos);
        });
    });

    describe('on confirm message:', () => {

        it('should rollback on confirm KO', async () => {

            const { characterCurrent, futureBattleData, bindAction, posAvailables } = init();

            StoreTest.dispatch<BStateTurnStartAction>({
                type: 'battle/state/event',
                eventType: 'TURN-START',
                payload: {
                    characterId: characterCurrent.id
                }
            });

            const firstHash = futureBattleData.battleHash;

            const { onTileHover, onTileClick } = bindAction;

            await awaitAndAdvance10(onTileHover(posAvailables[0]));

            await onTileClick(posAvailables[0]);

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
