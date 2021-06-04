import { createId, normalize, SerializableState, StaticCharacter, StaticPlayer, StaticSpell } from '@timeflies/common';
import { RoomEntityListGetMessageData, RoomStateData } from '@timeflies/socket-messages';
import { Battle, StaticState } from './battle';

export const getBattleStaticData = (
    roomState: Pick<RoomStateData, 'staticPlayerList' | 'staticCharacterList'>,
    entityListData: RoomEntityListGetMessageData
): Pick<Battle, 'staticPlayers' | 'staticCharacters' | 'staticSpells' | 'staticState'> & { initialSerializableState: SerializableState } => {

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

    const staticPlayers = roomState.staticPlayerList.map(({ playerId, playerName, teamColor }): StaticPlayer => ({
        playerId,
        playerName,
        teamColor: teamColor!
    }));

    const staticCharacters: StaticCharacter[] = [];
    const staticSpells: StaticSpell[] = [];

    for (const { characterId, characterRole, playerId, placement } of roomState.staticCharacterList) {

        const { defaultSpellRole, variables: characterVariables } = entityListData.characterList.find(character => character.characterRole === characterRole)!;

        let defaultSpellId = '';

        for (const { spellRole, variables: spellVariables } of entityListData.spellList.filter(spell => characterRole === spell.characterRole)) {
            const spellId = createId();

            initialSerializableState.spells.duration[spellId] = spellVariables.duration;
            initialSerializableState.spells.rangeArea[spellId] = spellVariables.rangeArea;
            initialSerializableState.spells.actionArea[spellId] = spellVariables.actionArea;
            initialSerializableState.spells.lineOfSight[spellId] = spellVariables.lineOfSight;
            initialSerializableState.spells.attack[spellId] = spellVariables.attack;

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
