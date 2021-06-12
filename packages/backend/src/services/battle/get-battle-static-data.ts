import { createId, normalize, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { Battle, BattlePayload, StaticState } from './battle';

type BattleStaticData = Pick<Battle, 'staticPlayers' | 'staticCharacters' | 'staticSpells' | 'staticState'> & {
    initialSerializableState: SerializableState;
};

export const getBattleStaticData = ({
    entityListData, staticPlayerList, staticCharacterList
}: Pick<BattlePayload, 'staticPlayerList' | 'staticCharacterList' | 'entityListData'>): BattleStaticData => {

    const initialSerializableState: SerializableState = {
        checksum: '-initial-state-',
        time: Date.now(),
        characters: {
            actionTime: {},
            health: {},
            orientation: {},
            position: {}
        },
        spells: {
            duration: {},
            rangeArea: {},
            actionArea: {},
            lineOfSight: {},
            attack: {}
        }
    };

    const staticPlayers = staticPlayerList.map(({ playerId, playerName, teamColor }): StaticPlayer => ({
        playerId,
        playerName,
        teamColor: teamColor!
    }));

    const staticCharacters: StaticCharacter[] = [];
    const staticSpells: StaticSpell[] = [];

    for (const { characterId, characterRole, playerId, placement } of staticCharacterList) {

        const { defaultSpellRole, variables: characterVariables } = entityListData.characterList.find(character => character.characterRole === characterRole)!;

        let defaultSpellId = '';

        for (const { spellRole, variables: spellVariables } of entityListData.spellList.filter(spell => characterRole === spell.characterRole)) {
            const spellId = createId();

            initialSerializableState.spells.duration[ spellId ] = spellVariables.duration;
            initialSerializableState.spells.rangeArea[ spellId ] = spellVariables.rangeArea;
            initialSerializableState.spells.actionArea[ spellId ] = spellVariables.actionArea;
            initialSerializableState.spells.lineOfSight[ spellId ] = spellVariables.lineOfSight;
            initialSerializableState.spells.attack[ spellId ] = spellVariables.attack;

            staticSpells.push({
                spellId,
                spellRole,
                characterId
            });

            if (spellRole === defaultSpellRole) {
                defaultSpellId = spellId;
            }
        }

        initialSerializableState.characters.actionTime[ characterId ] = characterVariables.actionTime;
        initialSerializableState.characters.health[ characterId ] = characterVariables.health;
        initialSerializableState.characters.orientation[ characterId ] = 'bottom';
        initialSerializableState.characters.position[ characterId ] = placement!;

        staticCharacters.push({
            characterId,
            characterRole,
            playerId,
            defaultSpellId
        });
    }

    const staticState: StaticState = {
        players: normalize(staticPlayers, 'playerId'),
        characters: normalize(staticCharacters, 'characterId'),
        spells: normalize(staticSpells, 'spellId')
    };

    return {
        staticPlayers,
        staticCharacters,
        staticSpells,
        staticState,
        initialSerializableState
    };
};
