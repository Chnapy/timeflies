import React from 'react';
import { StoryProps } from '../../../../../.storybook/preview';
import { CharacterItem } from './character-item';
import { Box } from '@material-ui/core';
import { seedGameState } from '../../../../game-state.seed';
import { seedBattleData } from '../../../../battle-data.seed';
import { seedCharacter } from '../../../../stages/battle/entities/character/Character.seed';
import { seedPlayer } from '../../../../stages/battle/entities/player/Player.seed';
import { seedTeam } from '../../../../stages/battle/entities/team/Team.seed';
import { seedGlobalTurn } from '../../../../stages/battle/cycle/global-turn.seed';
import { seedTurn } from '../../../../stages/battle/cycle/turn.seed';

export default {
    title: 'Battle/Character list panel/Character item',
    component: CharacterItem
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const now = Date.now();

    const teamA = seedTeam('fake', {
        id: 't1',
        period: 'current',
        letter: 'A',
        seedPlayers: []
    });

    const playerP1 = seedPlayer('fake', {
        id: 'p1',
        period: 'current',
        name: 'chnapy',
        team: teamA
    });

    teamA.players.push(playerP1);

    const characterC5 = seedCharacter('fake', {
        id: 'c5',
        period: 'current',
        type: 'sampleChar1',
        initialFeatures: {
            life: 100,
            actionTime: 12400
        },
        player: playerP1
    });

    const initialState = seedGameState('p1', {
        step: 'battle',
        battle: seedBattleData({
            current: {
                battleHash: '',
                players: [],
                teams: [],
                characters: [
                    seedCharacter('fake', {
                        id: 'c1',
                        period: 'current',
                        type: 'sampleChar1',
                        initialFeatures: {
                            life: 100,
                            actionTime: 12400
                        },
                        player: playerP1
                    }),
                    seedCharacter('fake', {
                        id: 'c2',
                        period: 'current',
                        type: 'sampleChar2',
                        initialFeatures: {
                            life: 100,
                            actionTime: 13400
                        },
                        player: seedPlayer('fake', {
                            id: 'p2',
                            period: 'current',
                            name: 'yoshi2oeuf',
                            team: teamA
                        })
                    }),
                    seedCharacter('fake', {
                        id: 'c3',
                        period: 'current',
                        type: 'sampleChar1',
                        initialFeatures: {
                            life: 110,
                            actionTime: 18100
                        },
                        player: seedPlayer('fake', {
                            id: 'p3',
                            period: 'current',
                            name: 'toto',
                            team: seedTeam('fake', {
                                id: 't2',
                                period: 'current',
                                letter: 'B',
                                seedPlayers: []
                            })
                        })
                    }),
                    seedCharacter('fake', {
                        id: 'c4',
                        period: 'current',
                        type: 'sampleChar1',
                        initialFeatures: {
                            life: 100,
                            actionTime: 12400
                        },
                        player: seedPlayer('fake', {
                            id: 'p1',
                            period: 'current',
                            name: 'chnapy',
                            team: teamA
                        })
                    }),
                    characterC5,
                ]
            },
            cycle: {
                launchTime: -1,
                globalTurn: seedGlobalTurn(1, {
                    currentTurn: seedTurn(1, {
                        character: characterC5,
                        startTime: now,
                        getRemainingTime() {
                            return Math.max(12400 - (Date.now() - now), 0);
                        },
                        turnDuration: 12400
                    })
                })
            }
        })
    });

    (initialState.battle!.current.characters[ 0 ].features.life as number) = 80;

    (initialState.battle!.current.characters[ 3 ].features.life as number) = 0;

    const { Provider } = fakeBattleApi.init({ initialState });

    return <>
        <Box width={215}>
            <Provider>
                <CharacterItem characterId='c1' />
                <CharacterItem characterId='c2' />
                <CharacterItem characterId='c3' />
                <CharacterItem characterId='c4' />

                <Box bgcolor='#222' p={1}>

                    <CharacterItem characterId='c5' />

                </Box>
            </Provider>
        </Box>
    </>;
};
