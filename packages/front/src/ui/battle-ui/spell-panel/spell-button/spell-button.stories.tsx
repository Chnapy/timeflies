import { Box, Typography } from '@material-ui/core';
import { seedSpellActionSnapshot } from '@timeflies/shared';
import React from 'react';
import { AssetLoader, createAssetLoader } from '../../../../assetManager/AssetLoader';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { useAssetLoader } from '../../../../assetManager/AssetProvider';
import { seedGameState } from '../../../../game-state.seed';
import { seedCharacter } from '../../../../stages/battle/entities/character/Character.seed';
import { seedSpell } from '../../../../stages/battle/entities/spell/Spell.seed';
import { createStoreManager } from '../../../../store-manager';
import { createView } from '../../../../view';
import { battleReducer, BattleState } from '../../../reducers/battle-reducers/battle-reducer';
import { SpellButton, SpellButtonProps } from './spell-button';
import { SpellImage } from './spell-image';
import { SpellNumber } from './spell-number';
import { UIGauge } from './ui-gauge';
import { UIIcon } from './ui-icon';
import { UIText } from './ui-text';

export default {
    component: SpellButton,
    title: 'Battle/Spell panel/Spell button'
};

const Wrapper: React.FC<SpellButtonProps & {
    title: string;
    battleState: BattleState;
}> = ({ title, battleState, ...props }) => {

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: battleState
    });

    const assetLoader = createAssetLoader();

    const storeManager = createStoreManager({
        assetLoader,
        initialState,
        middlewareList: []
    });

    const view = createView({
        storeManager,
        assetLoader,
        createPixi: async () => { },
        gameUIChildren: <Box display='inline-flex' flexDirection='column' mr={1} mb={1}>
            <Typography variant='body2'>{title}</Typography>
            <InnerWrapper {...props} loader={assetLoader} />
        </Box>
    });

    return view;
};

const InnerWrapper: React.FC<{ loader: AssetLoader } & SpellButtonProps> = ({ loader, ...props }) => {
    useAssetLoader(loader, 'spells', AssetManager.spritesheets.spells, true);

    return (
        <SpellButton {...props} />
    );
};

export const Default: React.FC = () => {

    const initialState = battleReducer(undefined, { type: '' });


    const stateDefault: BattleState = {
        ...initialState,
        snapshotState: {
            ...initialState.snapshotState,
            battleDataCurrent: {
                ...initialState.snapshotState.battleDataCurrent,
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
                        characterId: 'c1'
                    })
                }
            }
        },
        cycleState: {
            ...initialState.cycleState,
            currentCharacterId: 'c1',
            turnDuration: 300000,
            turnStartTime: Date.now()
        }
    };

    const stateSelected: BattleState = {
        ...stateDefault,
        snapshotState: {
            ...stateDefault.snapshotState,
            currentSpellAction: seedSpellActionSnapshot('s1')
        }
    };

    const stateDisabledTime: BattleState = {
        ...stateDefault,
        cycleState: {
            ...stateDefault.cycleState,
            turnDuration: 300,
        }
    };

    const stateDisabledTurn: BattleState = {
        ...stateDefault,
        snapshotState: {
            ...stateDefault.snapshotState,
            battleDataCurrent: {
                ...stateDefault.snapshotState.battleDataCurrent,
                characters: {
                    c1: seedCharacter({
                        id: 'c1',
                        period: 'current',
                        playerId: 'p2'
                    })
                },
            }
        }
    };

    const getQueueGameState = (remainsTime: boolean, firstSpellActionStartTime: number): BattleState => ({
        ...stateDefault,
        snapshotState: {
            ...stateDefault.snapshotState,
            spellActionSnapshotList: [
                seedSpellActionSnapshot('s1', {
                    duration: 10000,
                    startTime: firstSpellActionStartTime
                }),
                seedSpellActionSnapshot('s1', {
                    duration: 10000,
                    startTime: firstSpellActionStartTime + 10000
                }),
                seedSpellActionSnapshot('s1', {
                    duration: 10000,
                    startTime: firstSpellActionStartTime + 20000
                })
            ]
        },
        cycleState: {
            ...stateDefault.cycleState,
            turnDuration: remainsTime ? 300000 : 300,
        }
    });

    const stateQueue = getQueueGameState(true, Date.now() + 6000);

    const stateQueueDisabled = getQueueGameState(false, Date.now() + 6000);

    const stateQueueCurrentAction = getQueueGameState(true, Date.now() - 1500);

    return (
        <Box display='flex' flexWrap='wrap'>

            <Wrapper title='Default' battleState={stateDefault} spellId='s1' />

            <Wrapper title='Selected' battleState={stateSelected} spellId='s1' />

            <Wrapper title='Disabled (time)' battleState={stateDisabledTime} spellId='s1' />

            <Wrapper title='Disabled (not my character)' battleState={stateDisabledTurn} spellId='s1' />

            <Wrapper title='With queue' battleState={stateQueue} spellId='s1' />

            <Wrapper title='With queue, disabled (time)' battleState={stateQueueDisabled} spellId='s1' />

            <Wrapper title='With queue, current action' battleState={stateQueueCurrentAction} spellId='s1' />

            <Box width='100%'>
                <SpellNumber value={1} />
                <SpellNumber value={2} />
                <UIIcon icon='time' />
                <UIIcon icon='attack' />
                <UIIcon icon='time' strikeOut />
                <UIText variant='numeric'>12.4s</UIText>
                <SpellImage spellType={'move'} size={48} />
                <Box width={300}>
                    <UIGauge variant='dynamic' timeElapsed={3000} durationTotal={10000} />
                </Box>
            </Box>
        </Box>
    );
};
