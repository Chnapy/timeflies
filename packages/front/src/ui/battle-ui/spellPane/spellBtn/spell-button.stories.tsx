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

export default {
    component: SpellButton,
    title: 'Battle/Spell button'
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
                <SpellButton {...props} />
            </Box>
        </Provider>
    );
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const turnDefault = seedTurn(1, {
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

    const stateQueue: GameState = seedGameState('p1', {
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
                        })
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
                        duration: 2000,
                        startTime: Date.now() + 6000
                    }),
                    seedSpellActionSnapshot('s1', {
                        duration: 2000,
                        startTime: Date.now() + 8000
                    }),
                    seedSpellActionSnapshot('s1', {
                        duration: 2000,
                        startTime: Date.now() + 10000
                    })
                ]
            }
        })
    });

    return (
        <Box display='flex' flexWrap='wrap'>

            <Wrapper title='Default' fakeApi={fakeBattleApi} turn={turnDefault} spellId='s1' />

            <Wrapper title='Selected' fakeApi={fakeBattleApi} turn={turnSelected} spellId='s1' />

            <Wrapper title='Disabled (time)' fakeApi={fakeBattleApi} turn={turnDisabledTime} spellId='s1' />

            <Wrapper title='Disabled (not my character)' fakeApi={fakeBattleApi} turn={turnDisabledTurn} spellId='s1' />
            
            <Wrapper title='With queue' fakeApi={fakeBattleApi} initialState={stateQueue} spellId='s1' />

            <Box>
                <SpellNumber value={1}/>
                <SpellNumber value={2}/>
                <UIIcon icon='time' />
                <UIIcon icon='attack' />
                <UIText variant='numeric'>12.4s</UIText>
                <SpellImage spellType={'move'} size={48}/>
            </Box>
        </Box>
    );
};
