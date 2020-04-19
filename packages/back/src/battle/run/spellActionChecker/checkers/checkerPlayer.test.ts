import { SpellActionCAction } from '@timeflies/shared';
import { seedCycle } from '../../cycle/Cycle.seed';
import { seedPlayer } from '../../entities/player/Player.seed';
import { seedMapManager } from '../../mapManager/MapManager.seed';
import { CharActionCheckerResult } from '../SpellActionChecker';
import { checkerPlayer } from './checkerPlayer';

describe('# checkerPlayer', () => {

    const getPlayer = () => seedPlayer({
        staticCharacters: [ {
            id: 'test',
            defaultSpellId: '',
            initialFeatures: {
                life: 100,
                actionTime: 200,
            },
            name: '',
            staticSpells: [],
            type: 'sampleChar1'
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
            spellAction: {
                characterId: 'other',
                actionArea: [],
                battleHash: '',
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: -1,
                validated: false
            }
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
            spellAction: {
                characterId: 'other',
                actionArea: [],
                battleHash: '',
                duration: 200,
                fromNotify: false,
                position: { x: -1, y: -1 },
                spellId: '',
                startTime: -1,
                validated: false
            }
        };

        expect(checker(spellAction, player)).toEqual<CharActionCheckerResult>({ success: true });
    });

});
