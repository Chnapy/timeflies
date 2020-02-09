import 'phaser';
import { GlobalTurn } from '../phaser/cycle/GlobalTurn';
import { BattleData } from '../phaser/scenes/BattleScene';
import { seedBattleData } from '../__seeds__/seedBattleData';
import { BStateMachine } from './BStateMachine';
import { BState, BStateEvents } from './battleStateSchema';


describe('#BStateMachine', () => {

    let battleData: BattleData;
    let stateMachine: BStateMachine;

    const fillBattleData = (isMineFirst: boolean, getStartTime?: (now, actionTime) => number) => {

        const characters = isMineFirst
            ? battleData.characters
                .sort((a, b) => a.player.itsMe ? -1 : 1)
            : battleData.characters
                .sort((a, b) => a.player.itsMe ? 1 : -1);

        const startTime = getStartTime
            ? getStartTime(Date.now(), characters[ 0 ].features.actionTime)
            : Date.now();

        battleData.globalTurn = new GlobalTurn({
            id: 1,
            startTime,
            order: characters.map(c => c.id),
            currentTurn: {
                id: 1,
                startTime,
                characterId: characters[ 0 ].id
            }
        }, characters, () => { });
    };

    beforeEach(() => {
        battleData = seedBattleData();
    });

    it('should initialize with "watch" state', () => {

        stateMachine = new BStateMachine(battleData);

        expect(stateMachine.state).toBe<BState>('watch');
    });

    describe('from "watch"', () => {

        it('should not pass to "idle" on TURN-START when not own turn', () => {

            fillBattleData(false);

            stateMachine = new BStateMachine(battleData);

            stateMachine.send('TURN-START');

            expect(stateMachine.state).not.toBe<BState>('idle');
        });

        it('should pass to "idle" on TURN-START', () => {

            fillBattleData(true);

            stateMachine = new BStateMachine(battleData);

            stateMachine.send('TURN-START');

            expect(stateMachine.state).toBe<BState>('idle');
        });

        it('should not pass to "spellLaunch" on SPELL-NOTIFY if no one plays', () => {

            fillBattleData(false, (now, actionTime) => now - actionTime);

            stateMachine = new BStateMachine(battleData);

            stateMachine.send('SPELL-NOTIFY');

            expect(stateMachine.state).not.toBe<BState>('spellLaunch');
        });

        it('should pass to "spellLaunch" on SPELL-NOTIFY', () => {

            fillBattleData(false);

            stateMachine = new BStateMachine(battleData);

            stateMachine.send('SPELL-NOTIFY');

            expect(stateMachine.state).toBe<BState>('spellLaunch');
        });

        it.each<BStateEvents>(
            [ 'RESET', 'SPELL-LAUNCH', 'SPELL-PREPARE', 'TURN-END' ]
        )('should not handle %s event', event => {

            stateMachine = new BStateMachine(battleData);

            stateMachine.send(event);

            expect(stateMachine.state).toBe<BState>('watch');
        });

    });

    describe('from "idle"', () => {

        beforeEach(() => {
            fillBattleData(true);
        });

        it('should pass to "spellPrepare" on SPELL-PREPARE', () => {

            stateMachine = new BStateMachine(battleData);
            stateMachine.send('TURN-START');

            stateMachine.send('SPELL-PREPARE');

            expect(stateMachine.state).toBe<BState>('spellPrepare');
        });

        it('should pass to "watch" on TURN-END', () => {

            stateMachine = new BStateMachine(battleData);
            stateMachine.send('TURN-START');

            stateMachine.send('TURN-END');

            expect(stateMachine.state).toBe<BState>('watch');
        });

        it.each<BStateEvents>(
            [ 'RESET', 'SPELL-LAUNCH', 'SPELL-NOTIFY', 'TURN-START' ]
        )('should not handle %s event', event => {

            stateMachine = new BStateMachine(battleData);
            stateMachine.send('TURN-START');

            stateMachine.send(event);

            expect(stateMachine.state).toBe<BState>('idle');
        });
    });

});
