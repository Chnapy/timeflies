import { BStateActionType } from './BattleStateSchema';

describe('Battle state workflow', () => {

    it.todo('should start in "watch" state');

    describe('from "watch" state', () => {
        
        it.todo('should not change state on events TURN-END, SPELL-PREPARE, SPELL-LAUNCH');

        it.todo('should not change state on event TURN-START if not own character');

        it.todo('should change state to "spellPrepare" on event TURN-START if own character');

        it.todo('should not change state on event RESET if not own turn');

        it.todo('should change state to "spellPrepare" on event RESET if own turn');

        it.todo('should not change state on event SPELL-NOTIFY if own turn');

        it.todo('should change state to "spellLaunch" on event SPELL-NOTIFY if not own turn');

    });

    describe('from "spellPrepare" state', () => {
        
        it.todo('should not change state on events TURN-START, SPELL-NOTIFY');
        
        it.todo('should not change state on event SPELL-PREPARE but use given spell');
        
        it.todo('should change state to "watch" on event RESET if not own turn');
        
        it.todo('should not change state on event RESET if own turn but use default spell');

        it.todo('should not change state on event SPELL-LAUNCH if given spell is not same as current spell');

        it.todo('should change state to "spellLaunch" on event SPELL-LAUNCH if given spell is same as current spell');

    });

});