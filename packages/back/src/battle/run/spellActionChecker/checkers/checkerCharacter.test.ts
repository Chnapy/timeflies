import { SpellActionCAction, seedSpellActionSnapshot } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerCharacter } from './checkerCharacter';
import { BattleState } from '../../battleStateManager/BattleStateManager';
import { seedCharacter } from '../../entities/character/Character.seed';

describe('# checkerCharacter', () => {

    const getBattleState = (charLife: number = 100): BattleState => ({
        battleHashList: [],
        teams: [],
        players: [ seedPlayer({ id: 'p1' }) ],
        characters: [ seedCharacter({

            alterFn: char => {
                char.id = 'c1';
                char.initialFeatures.life = charLife;
            }
        }, 'p1')[ 0 ] ],
        spells: [ {
            id: 's1', index: 1, staticData: {
                id: 's1', name: 's1', type: 'move', initialFeatures: {} as any
            },
            features: {} as any,
            characterId: 'c1'
        } ]
    });

    it('should fail if character is dead', () => {

        const battleState = getBattleState(0);

        const player = battleState.players[0];
        const character = battleState.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(battleState.spells[ 0 ].id, {
                characterId: 'other',
                duration: 200,
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'isAlive'
        });
    });

    it('should fail on bad spell id', () => {

        const battleState = getBattleState();

        const player = battleState.players[0];
        const character = battleState.characters[ 0 ];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot('bad-id', {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'spell'
        });
    });

    it('should succeed else', () => {

        const battleState = getBattleState();

        const player = battleState.players[0];
        const character = battleState.characters[ 0 ];
        const spell = battleState.spells[0];

        const cycle = seedCycle({ turn: { character } });

        const mapManager = seedMapManager();

        const checker = checkerCharacter(cycle, mapManager);

        const spellAction: SpellActionCAction = {
            type: 'battle/spellAction',
            sendTime: -1,
            spellAction: seedSpellActionSnapshot(spell.id, {
                characterId: 'other',
            })
        };

        expect(checker(spellAction, player, battleState)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
