import { seedSpellActionSnapshot, SpellActionCAction } from '@timeflies/shared';
import { BattleState } from '../../battleStateManager/BattleStateManager';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedCharacter } from '../../entities/character/Character.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerTime } from './checkerTime';

describe('# checkerTime', () => {

    const getBattleState = (): BattleState => ({
        battleHashList: [],
        teams: [],
        players: [ seedPlayer({ id: 'p1' }) ],
        characters: [ seedCharacter({

            alterFn: char => {
                char.id = 'c1';
            }
        }, 'p1')[ 0 ] ],
        spells: [ {
            id: 's1', index: 1, staticData: {
                id: 's1', name: 's1', type: 'move', initialFeatures: {} as any
            },
            features: { duration: 1000 } as any,
            characterId: 'c1'
        } ]
    });

    it('should fail on bad start time', () => {

        const battleState = getBattleState();

        const player = battleState.players[ 0 ];
        const character = battleState.characters[ 0 ];
        const spell = battleState.spells[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 100,
            spellAction: seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
                duration: 200,
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'startTime'
        });
    });

    it('should fail on duration too long', () => {

        const battleState = getBattleState();

        const player = battleState.players[ 0 ];
        const character = battleState.characters[ 0 ];
        const spell = battleState.spells[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                turnDuration: 900,
                endTime: 1100,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 201,
            spellAction: seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'duration'
        });
    });

    it('should succeed else', () => {

        const battleState = getBattleState();

        const player = battleState.players[ 0 ];
        const character = battleState.characters[ 0 ];
        const spell = battleState.spells[ 0 ];

        const cycle = seedCycle({
            turn: {
                startTime: 200,
                turnDuration: 1100,
                endTime: 1300,
                character
            }
        });

        const mapManager = seedMapManager();

        const checker = checkerTime(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: 201,
            spellAction: seedSpellActionSnapshot(spell.id, {
                characterId: character.id,
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({ success: true });
    });
});
