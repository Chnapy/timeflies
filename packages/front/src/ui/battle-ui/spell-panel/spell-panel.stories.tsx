import { seedSpellActionSnapshot } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { seedGameState } from '../../../game-state.seed';
import { seedCharacter } from '../../../stages/battle/entities/character/Character.seed';
import { seedSpell } from '../../../stages/battle/entities/spell/Spell.seed';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
import { battleReducer, BattleState } from '../../reducers/battle-reducers/battle-reducer';
import { SpellPanel } from './spell-panel';

export default {
    title: 'Battle/Spell panel',
    component: SpellPanel
};

export const Default: React.FC = () => {

    const now = Date.now();

    const preloadedState = battleReducer(undefined, { type: '' });

    const battleState: BattleState = {
        ...preloadedState,
        snapshotState: {
            ...preloadedState.snapshotState,
            battleDataCurrent: {
                ...preloadedState.snapshotState.battleDataCurrent,
                characters: {
                    c1: seedCharacter({
                        id: 'c1',
                        period: 'current',
                        playerId: 'p1'
                    })
                },
                spells: {
                    s1: seedSpell({
                        id: 's1',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 180000,
                            attack: 12,
                            area: 4
                        },
                        characterId: 'c1'
                    }),
                    s2: seedSpell({
                        id: 's2',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 380000,
                            attack: 22,
                            area: 3
                        },
                        characterId: 'c1'
                    }),
                    s3: seedSpell({
                        id: 's3',
                        period: 'current',
                        type: 'simpleAttack',
                        feature: {
                            duration: 220000,
                            attack: 8,
                            area: 12
                        },
                        characterId: 'c1'
                    })
                }
            },
            spellActionSnapshotList: [
                seedSpellActionSnapshot('s3', {
                    startTime: now + 1000
                }),
                seedSpellActionSnapshot('s3', {
                    startTime: now + 2000
                })
            ]
        },
        cycleState: {
            ...preloadedState.cycleState,
            currentCharacterId: 'c1',
            turnDuration: 300000,
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
        gameUIChildren: <SpellPanel />
    });

    return view;
};
