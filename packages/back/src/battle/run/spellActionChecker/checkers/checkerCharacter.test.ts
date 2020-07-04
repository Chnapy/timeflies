import { seedSpellActionSnapshot, SpellActionCAction } from '@timeflies/shared';
import { BattleState, EntitiesGetter } from '../../battleStateManager/BattleStateManager';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedCharacter } from '../../entities/character/Character.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerCharacter } from './checkerCharacter';

describe('# checkerCharacter', () => {

    const getBattleState = (charLife: number = 100): BattleState => ({
        battleHashList: [],
        characters: {
            c1: seedCharacter({

                alterFn: char => {
                    char.id = 'c1';
                    char.initialFeatures.life = charLife;
                }
            }, 'p1').c1
        },
        spells: {
            s1: {
                id: 's1', index: 1, staticData: {
                    id: 's1', name: 's1', description: '', role: 'move', initialFeatures: {} as any
                },
                features: {} as any,
                characterId: 'c1'
            }
        }
    });

    it('should fail if character is dead', () => {

        const battleState = getBattleState(0);

        const player = seedPlayer({ id: 'p1' });
        const character = battleState.characters.c1;

        const get: EntitiesGetter = key => battleState[ key ];

        const cycle = seedCycle({ turn: { getCharacter: () => character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(battleState.spells.s1.id, {
                characterId: 'other',
                duration: 200,
            })
        };

        expect(checker(spellAction, player, get)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'isAlive'
        });
    });

    it('should fail on bad spell id', () => {

        const battleState = getBattleState();

        const player = seedPlayer({ id: 'p1' });
        const character = battleState.characters.c1;

        const get: EntitiesGetter = key => battleState[ key ];

        const cycle = seedCycle({ turn: { getCharacter: () => character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot('bad-id', {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, get)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'spell'
        });
    });

    it('should succeed else', () => {

        const battleState = getBattleState();

        const player = seedPlayer({ id: 'p1' });
        const character = battleState.characters.c1;
        const spell = battleState.spells.s1;

        const get: EntitiesGetter = key => battleState[ key ];

        const cycle = seedCycle({ turn: { getCharacter: () => character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(spell.id, {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, get)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
