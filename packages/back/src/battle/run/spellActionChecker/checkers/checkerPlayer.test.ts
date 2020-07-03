import { SpellActionCAction, seedSpellActionSnapshot } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerPlayer } from './checkerPlayer';
import { BattleState, EntitiesGetter } from '../../battleStateManager/BattleStateManager';
import { seedCharacter } from '../../entities/character/Character.seed';

describe('# checkerPlayer', () => {

    const getBattleState = (): BattleState => ({
        battleHashList: [],
        characters: {
            c1: seedCharacter({

                alterFn: char => {
                    char.id = 'c1';
                }
            }, 'p1').c1
        },
        spells: {
            s1: {
                id: 's1', index: 1, staticData: {
                    id: 's1', name: 's1', role: 'move', initialFeatures: {} as any
                },
                features: {} as any,
                characterId: 'c1'
            }
        }
    });

    it('should fail if not current turn', () => {

        const battleState = getBattleState();

        const player = seedPlayer({ id: 'p2' });

        const get: EntitiesGetter = key => battleState[ key ];

        const cycle = seedCycle();

        const mapManager = seedMapManager();

        const checker = checkerPlayer(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot('', {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, get)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'player'
        });
    });

    it('should succeed else', () => {

        const battleState = getBattleState();

        const player = seedPlayer({ id: 'p1' });
        const character = battleState.characters.c1;

        const get: EntitiesGetter = key => battleState[ key ];

        const cycle = seedCycle({
            turn: { getCharacter: () => character }
        });

        const mapManager = seedMapManager();

        const checker = checkerPlayer(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot('', {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, get)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
