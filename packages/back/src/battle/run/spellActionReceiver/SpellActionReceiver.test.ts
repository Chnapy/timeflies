import { ConfirmSAction, NotifySAction, SpellActionSnapshot, seedSpellActionSnapshot } from '@timeflies/shared';
import { WSSocket } from '../../../transport/ws/WSSocket';
import { seedWebSocket } from '../../../transport/ws/WSSocket.seed';
import { BattleStateManager } from '../battleStateManager/BattleStateManager';
import { Cycle } from '../cycle/Cycle';
import { Character } from '../entities/character/Character';
import { seedCharacter } from '../entities/character/Character.seed';
import { seedPlayer } from '../entities/player/Player.seed';
import { CharActionCheckerResult } from '../spellActionChecker/SpellActionChecker';
import { SpellActionReceiver } from './SpellActionReceiver';

describe('# SpellActionReceiver', () => {

    const seedCycle = (notifyDeathsFn: () => void = jest.fn()): Cycle => ({
        start() { },
        stop() { },
        globalTurn: {
            notifyDeaths: notifyDeathsFn
        } as any
    });

    const seedMapManager = () => ({});

    const getAll = ({ checkResult, generateSnapshotHash, spellActionHash, isHashCorrect, deaths = [] }: {
        checkResult: CharActionCheckerResult;
        generateSnapshotHash: string;
        spellActionHash: string;
        isHashCorrect: boolean;
        deaths?: Character[]
    }) => {

        const cycle = seedCycle();

        const mapManager = seedMapManager();

        const battleHashList = [ 'firstHash' ];

        const sendFn = jest.fn();

        const { ws } = seedWebSocket({
            onSendFn: () => sendFn
        });

        const p = seedPlayer({
            socket: new WSSocket(ws).createPool()
        });

        const sendFnP2 = jest.fn();
        const sendFnP3 = jest.fn();

        const players = [
            p,
            seedPlayer({
                socket: new WSSocket(seedWebSocket({
                    onSendFn: () => sendFnP2
                }).ws).createPool()
            }),
            seedPlayer({
                socket: new WSSocket(seedWebSocket({
                    onSendFn: () => sendFnP3
                }).ws).createPool()
            })
        ];

        const characters = seedCharacter();

        const checkDeathsAndDisconnects = jest.fn();

        const stateManager: BattleStateManager = {
            battleState: {
                battleHashList,
                players,
                teams: [],
                characters: [],
                spells: []
            },
            generateFirstSnapshot: jest.fn(),
            useSpellAction: () => ({
                onClone: () => ({
                    ifCorrectHash: (fn) => {
                        isHashCorrect && fn(generateSnapshotHash, () => ({ deaths }));
                        return isHashCorrect;
                    }
                })
            })
        };

        const receiver = SpellActionReceiver({
            stateManager,
            cycle,
            mapManager,
            checkDeathsAndDisconnects
        }, {
            spellActionCheckerCreator: () => ({
                check: () => checkResult
            })
        });

        const spellAction: SpellActionSnapshot = seedSpellActionSnapshot('', {
            battleHash: spellActionHash,
        });

        return {
            battleHashList,
            sendFn,
            sendFnsOthers: [ sendFnP2, sendFnP3 ],
            p,
            players,
            characters,
            checkDeathsAndDisconnects,
            receiver,
            spellAction
        };
    };

    describe('on bad spell action', () => {

        it('should cancel action with current hash', () => {

            const { receiver, p, sendFn, spellAction } = getAll({
                checkResult: {
                    success: false,
                    reason: 'spell'
                },
                isHashCorrect: true,
                generateSnapshotHash: '',
                spellActionHash: ''
            });

            receiver.getOnReceive(p)({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction
            });

            expect(sendFn).toHaveBeenNthCalledWith<[ [ ConfirmSAction ] ]>(1, [ {
                type: 'confirm',
                sendTime: expect.anything(),
                isOk: false,
                lastCorrectHash: 'firstHash'
            } ]);
        });

    });

    describe('on bad battle hash', () => {

        it('should cancel action with current hash', () => {

            const { receiver, p, sendFn, spellAction } = getAll({
                checkResult: {
                    success: true
                },
                isHashCorrect: false,
                generateSnapshotHash: 'one',
                spellActionHash: 'two'
            });

            receiver.getOnReceive(p)({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction
            });

            expect(sendFn).toHaveBeenNthCalledWith<[ [ ConfirmSAction ] ]>(1, [ {
                type: 'confirm',
                sendTime: expect.anything(),
                isOk: false,
                lastCorrectHash: 'firstHash'
            } ]);
        });

        it.todo('should not have modify battle state');
    });

    describe('on correct spell action & battle hash', () => {

        it('should confirm action on correct spell action', () => {

            const { receiver, p, sendFn, spellAction } = getAll({
                checkResult: {
                    success: true
                },
                isHashCorrect: true,
                generateSnapshotHash: 'one',
                spellActionHash: 'one'
            });

            receiver.getOnReceive(p)({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction
            });

            expect(sendFn).toHaveBeenNthCalledWith<[ [ ConfirmSAction ] ]>(1, [ {
                type: 'confirm',
                sendTime: expect.anything(),
                isOk: true,
                lastCorrectHash: 'one'
            } ]);
        });

        it('should notify others players', () => {

            const { receiver, p, sendFnsOthers, spellAction } = getAll({
                checkResult: {
                    success: true
                },
                isHashCorrect: true,
                generateSnapshotHash: 'one',
                spellActionHash: 'one'
            });

            receiver.getOnReceive(p)({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction
            });

            for (const fn of sendFnsOthers) {
                expect(fn).toHaveBeenNthCalledWith<[ [ NotifySAction ] ]>(1, [ {
                    type: 'notify',
                    sendTime: expect.anything(),
                    spellActionSnapshot: spellAction
                } ]);
            }
        });

        it('should notify deaths if any', () => {

            const death = seedCharacter()[ 0 ];

            const { receiver, p, spellAction, checkDeathsAndDisconnects } = getAll({
                checkResult: {
                    success: true
                },
                isHashCorrect: true,
                generateSnapshotHash: 'one',
                spellActionHash: 'one',
                deaths: [ death ]
            });

            receiver.getOnReceive(p)({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction
            });

            expect(checkDeathsAndDisconnects).toHaveBeenCalledTimes(1);
        });

    });


});
