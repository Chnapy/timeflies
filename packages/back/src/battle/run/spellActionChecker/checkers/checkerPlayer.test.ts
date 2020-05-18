import { SpellActionCAction, seedSpellActionSnapshot } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerPlayer } from './checkerPlayer';

describe('# checkerPlayer', () => {

    const getPlayer = () => seedPlayer({
        staticCharacters: [ {
            staticData: {
                id: 'test',
                defaultSpellId: '',
                initialFeatures: {
                    life: 100,
                    actionTime: 200,
                },
                name: '',
                staticSpells: [],
                type: 'sampleChar1'
            },
            initialPosition: { x: 0, y: 0 }
        } ]
    });

    it('should fail if not current turn', () => {

        const player = getPlayer();

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

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({
            success: false,
            reason: 'player'
        });
    });

    it('should succeed else', () => {

        const player = getPlayer();

        const character = player.characters[ 0 ];

        const cycle = seedCycle({
            turn: { character }
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

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
