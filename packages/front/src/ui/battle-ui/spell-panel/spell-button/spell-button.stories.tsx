import { Box, Typography } from '@material-ui/core';
import { seedSpellActionSnapshot } from '@timeflies/shared';
import React from 'react';
import { FakeBattleApi } from '../../../../../.storybook/fake-battle-api';
import { StoryProps } from '../../../../../.storybook/preview';
import { seedBattleData } from '../../../../battle-data.seed';
import { GameState } from '../../../../game-state';
import { seedGameState } from '../../../../game-state.seed';
import { seedGlobalTurn } from '../../../../stages/battle/cycle/global-turn.seed';
import { Turn } from '../../../../stages/battle/cycle/Turn';
import { seedTurn } from '../../../../stages/battle/cycle/turn.seed';
import { seedCharacter } from '../../../../stages/battle/entities/character/Character.seed';
import { UIIcon } from './ui-icon';
import { SpellButton, SpellButtonProps } from './spell-button';
import { SpellNumber } from './spell-number';
import { UIText } from './ui-text';
import { SpellImage } from './spell-image';
import { UIGauge } from './ui-gauge';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { useAssetLoader } from '../../../../assetManager/AssetProvider';

export default {
    component: SpellButton,
    title: 'Battle/Spell panel/Spell button'
};

const Wrapper: React.FC<SpellButtonProps & {
    title: string;
    fakeApi: FakeBattleApi;
    turn?: Turn;
    initialState?: GameState;
}> = ({ title, fakeApi, turn, initialState: is, ...props }) => {

    const initialState: GameState = is ?? seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({

            cycle: {
                launchTime: -1,
                globalTurn: seedGlobalTurn(1, {
                    currentTurn: turn!
                })
            }
        })
    });

    const { Provider } = fakeApi.init({ initialState });

    return (
        <Provider>
            <Box display='inline-flex' flexDirection='column' mr={1} mb={1}>
                <Typography variant='body2'>{title}</Typography>
                <InnerWrapper {...props} />
            </Box>
        </Provider>
    );
};

const InnerWrapper: React.FC<SpellButtonProps> = props => {
    useAssetLoader('spells', AssetManager.spritesheets.spells, true);

    return (
        <SpellButton {...props} />
    );
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const turnDefault = seedTurn(1, {
        getRemainingTime() { return 3000 },
        character: seedCharacter('fake', {
            id: 'c1', period: 'current', player: null,
            seedSpells: [ {
                id: 's1',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 2800,
                    attack: 12,
                    area: 4
                }
            } ]
        })
    });

    const turnSelected = seedTurn(1, {
        getRemainingTime() { return 3000 },
        currentSpellType: 'simpleAttack',
        character: seedCharacter('fake', {
            id: 'c1', period: 'current', player: null,
            seedSpells: [ {
                id: 's1',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 2800,
                    attack: 12,
                    area: 4
                }
            } ]
        })
    });

    const turnDisabledTime = seedTurn(1, {
        getRemainingTime() { return 2500 },
        character: seedCharacter('fake', {
            id: 'c1', period: 'current', player: null,
            initialFeatures: { life: 100, actionTime: 0 },
            seedSpells: [ {
                id: 's1',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 2800,
                    attack: 12,
                    area: 4
                }
            } ]
        })
    });

    const turnDisabledTurn = seedTurn(1, {
        getRemainingTime() { return 3000 },
        character: seedCharacter('fake', {
            id: 'c1', period: 'current', player: null,
            isMine: false,
            seedSpells: [ {
                id: 's1',
                type: 'simpleAttack',
                initialFeatures: {
                    duration: 2800,
                    attack: 12,
                    area: 4
                }
            } ]
        })
    });

    const getQueueGameState = (remainsTime: boolean, firstSpellActionStartTime: number): GameState => seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({
            cycle: {
                launchTime: -1,
                globalTurn: seedGlobalTurn(1, {
                    currentTurn: seedTurn(1, {
                        character: seedCharacter('fake', {
                            id: 'c1', period: 'current', player: null,
                            seedSpells: [ {
                                id: 's1',
                                type: 'simpleAttack',
                                initialFeatures: {
                                    duration: 2800,
                                    attack: 12,
                                    area: 4
                                }
                            } ]
                        }),
                        getRemainingTime() { return remainsTime ? 3000 : 2500; },
                    })
                })
            },
            future: {
                battleHash: '',
                characters: [],
                players: [],
                teams: [],
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
            }
        })
    });

    const stateQueue: GameState = getQueueGameState(true, Date.now() + 6000);

    const stateQueueDisabled: GameState = getQueueGameState(false, Date.now() + 6000);

    const stateQueueCurrentAction: GameState = getQueueGameState(true, Date.now() - 1500);

    return (
        <Box display='flex' flexWrap='wrap'>

            <Wrapper title='Default' fakeApi={fakeBattleApi} turn={turnDefault} spellId='s1' />

            <Wrapper title='Selected' fakeApi={fakeBattleApi} turn={turnSelected} spellId='s1' />

            <Wrapper title='Disabled (time)' fakeApi={fakeBattleApi} turn={turnDisabledTime} spellId='s1' />

            <Wrapper title='Disabled (not my character)' fakeApi={fakeBattleApi} turn={turnDisabledTurn} spellId='s1' />

            <Wrapper title='With queue' fakeApi={fakeBattleApi} initialState={stateQueue} spellId='s1' />

            <Wrapper title='With queue, disabled (time)' fakeApi={fakeBattleApi} initialState={stateQueueDisabled} spellId='s1' />

            <Wrapper title='With queue, current action' fakeApi={fakeBattleApi} initialState={stateQueueCurrentAction} spellId='s1' />

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
