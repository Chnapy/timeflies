import React from 'react';
import { seedBattleData } from '../../../battle-data.seed';
import { seedGameState } from '../../../game-state.seed';
import { seedGlobalTurn } from '../../../stages/battle/cycle/global-turn.seed';
import { seedTurn } from '../../../stages/battle/cycle/turn.seed';
import { seedCharacter } from '../../../stages/battle/entities/character/Character.seed';
import { SpellPanel } from './spell-panel';
import { StoryProps } from '../../../../.storybook/preview';
import { seedSpellActionSnapshot } from '@timeflies/shared';

export default {
    title: 'Battle/Spell panel',
    component: SpellPanel
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi }) => {

    const now = Date.now();

    const initialState = seedGameState('p1', {
        step: 'battle',
        currentPlayer: {
            id: 'p1',
            name: 'p1'
        },
        battle: seedBattleData({
            cycle: {
                launchTime: -1,
                globalTurn: seedGlobalTurn(1, {
                    currentTurn: seedTurn(1, {
                        character: seedCharacter('fake', {
                            id: 'c1', period: 'current',
                            player: null,
                            seedSpells: [
                                {
                                    id: 's1',
                                    type: 'simpleAttack',
                                    initialFeatures: {
                                        duration: 2800,
                                        attack: 12,
                                        area: 4
                                    }
                                },
                                {
                                    id: 's2',
                                    type: 'simpleAttack',
                                    initialFeatures: {
                                        duration: 3800,
                                        attack: 22,
                                        area: 3
                                    }
                                },
                                {
                                    id: 's3',
                                    type: 'simpleAttack',
                                    initialFeatures: {
                                        duration: 2200,
                                        attack: 8,
                                        area: 12
                                    }
                                }
                            ]
                        }),
                        getRemainingTime() { return 3000 }
                    })
                })
            },
            future: {
                battleHash: '',
                characters: [],
                players: [],
                teams: [],
                spellActionSnapshotList: [
                    seedSpellActionSnapshot('s3', {
                        startTime: now + 1000
                    }),
                    seedSpellActionSnapshot('s3', {
                        startTime: now + 2000
                    }),
                ]
            }
        })
    });

    const { Provider } = fakeBattleApi.init({ initialState });

    return (
        <Provider>
            <SpellPanel />
        </Provider>
    )
};
