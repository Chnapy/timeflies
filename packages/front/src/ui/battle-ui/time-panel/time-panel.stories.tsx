import { Box } from '@material-ui/core';
import { seedSpellActionSnapshot } from '@timeflies/shared';
import React from 'react';
import { createAssetLoader } from '../../../assetManager/AssetLoader';
import { seedGameState } from '../../../game-state.seed';
import { seedCharacter } from '../../../stages/battle/entities/character/Character.seed';
import { seedSpell } from '../../../stages/battle/entities/spell/Spell.seed';
import { createStoreManager } from '../../../store/store-manager';
import { createView } from '../../../view';
import { battleReducer, BattleState } from '../../reducers/battle-reducers/battle-reducer';
import { TimePanel } from './time-panel';

export default {
    title: 'Battle/Time panel',
    component: TimePanel
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
                        type: 'move',
                        feature: {
                            duration: 800,
                            attack: 12,
                            area: 4
                        },
                        index: 1,
                        characterId: 'c1'
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
                        characterId: 'c1'
                    }),
                }
            },
            spellActionSnapshotList: [
                seedSpellActionSnapshot('sa0', {
                    spellId: 's1',
                    duration: 2000,
                    startTime: now,
                    characterId: 'c1'
                }),
                seedSpellActionSnapshot('sa1', {
                    spellId: 's1',
                    duration: 2000,
                    startTime: now + 2000,
                    characterId: 'c1'
                }),
                seedSpellActionSnapshot('sa1', {
                    spellId: 's2',
                    duration: 2000,
                    startTime: now + 4000,
                    characterId: 'c1'
                })
            ]
        },
        cycleState: {
            ...preloadedState.cycleState,
            currentCharacterId: 'c1',
            turnDuration: 10000,
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
        gameUIChildren: <Box width={600}>
            <TimePanel />
        </Box>
    });

    return view;
};
