import React from 'react';
import { createAssetLoader } from '../../assetManager/AssetLoader';
import { seedGameState } from '../../game-state.seed';
import { characterAlterLife } from '../../stages/battle/entities/character/Character';
import { seedCharacter } from '../../stages/battle/entities/character/Character.seed';
import { seedPlayer } from '../../stages/battle/entities/player/Player.seed';
import { seedSpell } from '../../stages/battle/entities/spell/Spell.seed';
import { seedTeam } from '../../stages/battle/entities/team/Team.seed';
import { createStoreManager } from '../../store-manager';
import { createView } from '../../view';
import { battleReducer, BattleState } from '../reducers/battle-reducers/battle-reducer';
import { BattleUI } from './battle-ui';
import { getInitialSnapshotState } from '../../stages/battle/snapshot/snapshot-reducer';

export default {
    title: 'Battle',
    component: BattleUI
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

    const preloadedState = battleReducer(undefined, { type: '' });

    const battleState: BattleState = {
        ...preloadedState,
        snapshotState: getInitialSnapshotState({
            ...preloadedState.snapshotState,
            teamList: { t1, t2 },
            playerList: { p1, p2, p3 },
            battleDataCurrent: {
                ...preloadedState.snapshotState.battleDataCurrent,
                characters: {
                    c1,
                    c2: seedCharacter({
                        id: 'c2',
                        period: 'current',
                        type: 'sampleChar2',
                        features: {
                            life: 100,
                            actionTime: 13400
                        },
                        playerId: p2.id
                    }),
                    c3: seedCharacter({
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
                },
                spells: {
                    s1: seedSpell({
                        id: 's1',
                        period: 'current',
                        type: 'move',
                        feature: {
                            duration: 800,
                            attack: 12,
                            area: 4
                        },
                        index: 1,
                        characterId: c5.id
                    }),
                    s2: seedSpell({
                        id: 's2',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 1000,
                            attack: 22,
                            area: 3
                        },
                        index: 2,
                        characterId: c5.id
                    }),
                    s3: seedSpell({
                        id: 's3',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 1000,
                            attack: 22,
                            area: 3
                        },
                        index: 3,
                        characterId: c5.id
                    }),
                    s4: seedSpell({
                        id: 's4',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 1000,
                            attack: 22,
                            area: 3
                        },
                        index: 4,
                        characterId: c5.id
                    }),
                }
            }
        }),
        cycleState: {
            ...preloadedState.cycleState,
            currentCharacterId: c5.id,
            turnDuration: 12400,
            turnStartTime: now
        }
    };

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState: seedGameState('p1', {
            step: 'battle',
            battle: battleState
        }),
        middlewareList: []
    });

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { },
        gameUIChildren: <BattleUI />
    });

    return view;
};
