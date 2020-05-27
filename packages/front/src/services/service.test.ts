import { ConfirmSAction, NotifySAction, SetIDCAction, SpellActionCAction } from '@timeflies/shared';
import { BattleDataMap } from '../BattleData';
import { SendMessageAction } from '../socket/wsclient-actions';
import { NotifyDeathsAction } from '../stages/battle/cycle/cycle-manager-actions';
import { SpellActionTimerEndAction } from '../stages/battle/spellAction/spell-action-manager-actions';
import { StoreTest } from '../StoreTest';
import { serviceBattleData } from './serviceBattleData';
import { serviceCurrentPlayer } from './serviceCurrentPlayer';
import { serviceDispatch } from './serviceDispatch';
import { serviceEvent } from './serviceEvent';
import { serviceNetwork } from './serviceNetwork';
import { serviceSelector } from './serviceSelector';
import { ReceiveMessageAction } from '../socket/wsclient-actions';

describe('services', () => {

    beforeEach(() => {
        StoreTest.beforeTest();
    });

    afterEach(() => {
        StoreTest.afterTest();
    });

    it('serviceSelector should return the correct data', () => {

        StoreTest.initStore({
            battle: {
                cycle: null as any,
                current: null as any,
                future: null as any
            }
        });

        expect(serviceSelector(state => state.battle)).toEqual<BattleDataMap>({
            cycle: null as any,
            current: null as any,
            future: null as any
        });
    });

    it('serviceBattleData should work only on battle context', () => {

        StoreTest.initStore({
            step: 'room'
        });

        expect(() => serviceBattleData('cycle')).toThrowError();
    });

    it('serviceBattleData should return the correct battle data', () => {

        const cycle = {
            launchTime: -1
        };
        const current = {
            sample: 2
        };
        const future = {
            other: ''
        };

        StoreTest.initStore({
            battle: {
                cycle: cycle as any,
                current: current as any,
                future: future as any
            }
        });

        expect(serviceBattleData('cycle')).toEqual(cycle);
        expect(serviceBattleData('current')).toEqual(current);
        expect(serviceBattleData('future')).toEqual(future);
    });

    it('serviceCurrentPlayer should return current player data if exist', () => {

        StoreTest.initStore({
            currentPlayer: null
        });

        expect(serviceCurrentPlayer()).toBeNull();

        const currentPlayer = {
            id: 'id',
            name: 'name'
        };

        StoreTest.initStore({
            currentPlayer
        });

        expect(serviceCurrentPlayer()).toEqual(currentPlayer);
    });

    it('serviceDispatch should dispatch any given action', () => {

        StoreTest.initStore();

        const { dispatchNotifyDeaths, dispatchSpellActionEnd } = serviceDispatch({
            dispatchNotifyDeaths: NotifyDeathsAction,
            dispatchSpellActionEnd: () => SpellActionTimerEndAction({
                removed: false,
                correctHash: '',
                spellActionSnapshot: {} as any
            })
        });

        expect(StoreTest.getActions()).toHaveLength(0);

        dispatchNotifyDeaths();

        expect(StoreTest.getActions()).toEqual([ NotifyDeathsAction() ]);

        StoreTest.clearActions();

        dispatchSpellActionEnd();

        expect(StoreTest.getActions()).toEqual([ SpellActionTimerEndAction({
            removed: false,
            correctHash: '',
            spellActionSnapshot: {} as any
        }) ]);
    });

    it('serviceEvent should add correct action listener', () => {

        const { onAction } = serviceEvent();

        const notifyDeathsFn = jest.fn();
        const spellActionEndFn = jest.fn();

        onAction(NotifyDeathsAction, notifyDeathsFn);
        onAction(SpellActionTimerEndAction, spellActionEndFn);

        const { dispatchNotifyDeaths, dispatchSpellActionEnd } = serviceDispatch({
            dispatchNotifyDeaths: NotifyDeathsAction,
            dispatchSpellActionEnd: () => SpellActionTimerEndAction({
                removed: false,
                correctHash: '',
                spellActionSnapshot: {} as any
            })
        });

        dispatchNotifyDeaths();

        expect(notifyDeathsFn).toHaveBeenNthCalledWith(1, NotifyDeathsAction().payload);

        dispatchSpellActionEnd();

        expect(spellActionEndFn).toHaveBeenNthCalledWith(1, SpellActionTimerEndAction({
            removed: false,
            correctHash: '',
            spellActionSnapshot: {} as any
        }).payload);
    });

    it('serviceEvent should add correct message listener', () => {

        const { onMessageAction } = serviceEvent();

        const confirmFn = jest.fn();
        const notifyFn = jest.fn();

        onMessageAction<ConfirmSAction>('confirm', confirmFn);
        onMessageAction<NotifySAction>('notify', notifyFn);

        const { dispatchNotifyDeaths, dispatchSpellActionEnd } = serviceDispatch({
            dispatchNotifyDeaths: () => ReceiveMessageAction({
                type: 'confirm',
                sendTime: -1,
                isOk: true,
                lastCorrectHash: ''
            }),
            dispatchSpellActionEnd: () => ReceiveMessageAction({
                type: 'notify',
                sendTime: -1,
                spellActionSnapshot: null as any
            })
        });

        dispatchNotifyDeaths();

        expect(confirmFn).toHaveBeenNthCalledWith<[ ConfirmSAction ]>(1, {
            type: 'confirm',
            sendTime: -1,
            isOk: true,
            lastCorrectHash: ''
        });

        dispatchSpellActionEnd();

        expect(notifyFn).toHaveBeenNthCalledWith<[ NotifySAction ]>(1, {
            type: 'notify',
            sendTime: -1,
            spellActionSnapshot: null as any
        });
    });

    it('serviceNetwork should send correct message action', async () => {

        const { sendSpellAction, sendSetID } = await serviceNetwork({
            sendSpellAction: (): SpellActionCAction => ({
                type: 'battle/spellAction',
                sendTime: -1,
                spellAction: {} as any
            }),
            sendSetID: (): SetIDCAction => ({
                type: 'set-id',
                sendTime: -1,
                id: ''
            })
        });

        expect(StoreTest.getActions()).toHaveLength(0);

        sendSpellAction();

        expect(StoreTest.getActions()).toEqual([ SendMessageAction({
            type: 'battle/spellAction',
            [ 'sendTime' as any ]: -1,
            spellAction: {} as any
        }) ]);

        StoreTest.clearActions();

        sendSetID();

        expect(StoreTest.getActions()).toEqual([ SendMessageAction({
            type: 'set-id',
            [ 'sendTime' as any ]: -1,
            id: ''
        }) ]);
    });

    it.todo('serviceEvent should remove listener on returned function call');
});