import { Box } from '@material-ui/core';
import { seedTiledMap } from '@timeflies/shared';
import React from 'react';
import { AssetLoader, createAssetLoader } from '../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { useAssetLoader } from '../../../../assetManager/AssetProvider';
import { seedGameState } from '../../../../game-state.seed';
import { BattleStartAction } from '../../../../stages/battle/battle-actions';
import { characterAlterLife, characterToSnapshot } from '../../../../stages/battle/entities/character/Character';
import { seedCharacter } from '../../../../stages/battle/entities/character/Character.seed';
import { playerToSnapshot } from '../../../../stages/battle/entities/player/Player';
import { seedPlayer } from '../../../../stages/battle/entities/player/Player.seed';
import { teamToSnapshot } from '../../../../stages/battle/entities/team/Team';
import { seedTeam } from '../../../../stages/battle/entities/team/Team.seed';
import { createStoreManager } from '../../../../store-manager';
import { createView } from '../../../../view';
import { battleReducer } from '../../../reducers/battle-reducers/battle-reducer';
import { CharacterItem } from './character-item';

export default {
    title: 'Battle/Character list panel/Character item',
    component: CharacterItem
};

export const Default: React.FC = () => {

    const now = Date.now();

    const t1 = seedTeam({
        id: 't1',
        letter: 'A'
    });

    const t2 = seedTeam({
        id: 't2',
        letter: 'B',
    });

    const p1 = seedPlayer({
        id: 'p1',
        name: 'chnapy',
        teamId: t1.id
    });

    const p2 = seedPlayer({
        id: 'p2',
        name: 'yoshi2oeuf',
        teamId: t1.id
    });

    const p3 = seedPlayer({
        id: 'p3',
        name: 'toto',
        teamId: t2.id
    });

    const c1 = seedCharacter({
        id: 'c1',
        period: 'current',
        type: 'sampleChar1',
        features: {
            life: 100,
            actionTime: 12400
        },
        playerId: p1.id
    });
    characterAlterLife(c1, -20);

    const c4 = seedCharacter({
        id: 'c4',
        period: 'current',
        type: 'sampleChar1',
        features: {
            life: 100,
            actionTime: 12400
        },
        playerId: p1.id
    });
    characterAlterLife(c4, -100);

    const c5 = seedCharacter({
        id: 'c5',
        period: 'current',
        type: 'sampleChar1',
        features: {
            life: 100,
            actionTime: 12400
        },
        playerId: p1.id
    });

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: battleReducer(undefined, { type: '' }),
    });

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
        middlewareList: []
    });

    storeManager.dispatch(BattleStartAction({
        myPlayerId: 'p1',
        tiledMapAssets: {
            schema: seedTiledMap('map_1'),
            imagesUrls: {}
        },
        globalTurnSnapshot: {
            id: 1,
            order: [],
            startTime: now,
            currentTurn: {
                id: 1,
                characterId: c5.id,
                duration: 12400,
                startTime: now
            }
        },
        teamSnapshotList: [ t1, t2 ].map(teamToSnapshot),
        playerSnapshotList: [ p1, p2, p3 ].map(playerToSnapshot),
        entitiesSnapshot: {
            battleHash: '',
            charactersSnapshots: [
                c1,
                seedCharacter({
                    id: 'c2',
                    period: 'current',
                    type: 'sampleChar2',
                    features: {
                        life: 100,
                        actionTime: 13400
                    },
                    playerId: p2.id
                }),
                seedCharacter({
                    id: 'c3',
                    period: 'current',
                    type: 'sampleChar1',
                    features: {
                        life: 110,
                        actionTime: 18100
                    },
                    playerId: p3.id
                }),
                c4,
                c5,
            ].map(characterToSnapshot),
            launchTime: Date.now(),
            spellsSnapshots: [],
            time: Date.now()
        }
    }));

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { },
        gameUIChildren: <Box width={215}>
            <InnerDefault loader={assetLoader}/>
        </Box>
    });

    return view;
};

const InnerDefault: React.FC<{ loader: AssetLoader }> = ({ loader }) => {
    useAssetLoader(loader, 'characters', AssetManager.spritesheets.characters, true);

    return <>
        <CharacterItem characterId='c1' />
        <CharacterItem characterId='c2' />
        <CharacterItem characterId='c3' />
        <CharacterItem characterId='c4' />

        <Box bgcolor='#222' p={1}>
            <CharacterItem characterId='c5' />
        </Box>
    </>;
};
