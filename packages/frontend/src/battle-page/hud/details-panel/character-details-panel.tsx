import { Grid, makeStyles } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import { HealthGauge, UIText, VariableIcon, VariableValue } from '@timeflies/app-ui';
import { CharacterId, getCharacterCategory, PlayerRelation, switchUtil } from '@timeflies/common';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import { TimeGauge } from '@timeflies/time-gauge-panel';
import React from 'react';
import { CharacterDescription } from '../../../components/character-description/character-description';
import { CharacterName } from '../../../components/character-description/character-name';
import { SpellCategoryLabel } from '../../../room-page/room-character-list/details-components';
import { useCurrentEntities } from '../../hooks/use-entities';
import { usePlayerRelationFrom } from '../../hooks/use-player-relation-from';
import { useBattleSelector } from '../../store/hooks/use-battle-selector';
import { useDetailsContext, useDetailsLogic } from './details-context';
import { DetailsPanelTemplate } from './details-panel-template';
import { SpellButtonSimpleConnected } from './spell-button-simple-connected';

type InnerCharacterDetailsPanelProps = {
    characterId: CharacterId;
};

type StyleProps = {
    teamColor: string;
    playerRelation: PlayerRelation;
};

const spriteSize = 32;
const playerLineHeight = 12;

const useStyles = makeStyles(({ palette }) => ({
    teamRect: ({ teamColor }: StyleProps) => ({
        width: 2,
        height: playerLineHeight,
        backgroundColor: teamColor
    }),
    spriteRect: ({ playerRelation }: StyleProps) => ({
        width: playerLineHeight,
        height: playerLineHeight,
        backgroundColor: switchUtil(playerRelation, {
            me: palette.background.default,
            ally: palette.playerRelations.ally,
            enemy: palette.playerRelations.enemy
        })
    }),
    healthText: {
        display: 'inline-flex',
        justifyContent: 'flex-end',
        color: palette.variables.health
    },
    actionTimeText: {
        display: 'inline-flex',
        justifyContent: 'flex-end',
        color: palette.variables.actionTime
    },
    gaugeWrapper: {
        padding: 2,
        backgroundColor: palette.background.default
    }
}));

const InnerCharacterDetailsPanel: React.FC<InnerCharacterDetailsPanelProps> = React.memo(({ characterId }) => {
    const { characterClick } = useDetailsLogic();

    const { playerId, characterRole } = useBattleSelector(state => state.staticCharacters[ characterId ]);
    const { playerName, teamColor } = useBattleSelector(state => state.staticPlayers[ playerId ]);

    const initialHealth = useBattleSelector(state => state.initialSerializableState.characters.health[ characterId ]);
    const initialActionTime = useBattleSelector(state => state.initialSerializableState.characters.actionTime[ characterId ]);

    const health = useCurrentEntities(entities => entities.characters.health[ characterId ]);
    const actionTime = useCurrentEntities(entities => entities.characters.actionTime[ characterId ]);

    const spellList = useBattleSelector(state => state.spellLists[ characterId ]);

    const playerRelation = usePlayerRelationFrom()(playerId);

    const classes = useStyles({ teamColor, playerRelation });

    const characterCategory = getCharacterCategory(characterRole);

    const state: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        state: 'idle',
        orientation: 'bottom'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(state);

    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(state);

    return <DetailsPanelTemplate minWidth={200} maxWidth={200} onClose={() => characterClick(null)}>
        <Grid container direction='column' spacing={1}>

            <Grid item container justify='space-between' wrap='nowrap'>
                <Grid item>
                    <UIText variant='h3'>
                        <CharacterName characterRole={characterRole} />
                    </UIText>
                    <SpellCategoryLabel category={characterCategory} variant='body1' gutterBottom />
                </Grid>

                <Grid item container direction='column' alignItems='flex-end'>
                    <Grid item>
                        <CharacterAnimatedImage
                            size={spriteSize}
                            animationPath={animationPath}
                            framesDurations={framesDurations}
                            pingPong={false}
                            run={false}
                            scale={2}
                        />
                    </Grid>

                    <Grid item container justify='flex-end' alignItems='center' spacing={1}>
                        <Grid item>
                            <UIText variant='body2'>{playerName}</UIText>
                        </Grid>
                        <Grid item>
                            <div className={classes.teamRect} />
                        </Grid>
                        <Grid item>
                            <div className={classes.spriteRect}>
                                <PersonIcon fontSize='inherit' />
                            </div>
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Grid item>
                <UIText variant='body2'>
                    <CharacterDescription characterRole={characterRole} />
                </UIText>
            </Grid>

            <Grid item container spacing={1} alignItems='center' wrap='nowrap'>
                <Grid item>
                    <VariableIcon variableName='health' />
                </Grid>
                <Grid className={classes.healthText} item xs>
                    <VariableValue variableName='health' value={health} colored />{' / '}<VariableValue variableName='health' value={initialHealth} colored />
                </Grid>
                <Grid item xs={6}>
                    <div className={classes.gaugeWrapper}>
                        <HealthGauge direction='horizontal' health={health} />
                    </div>
                </Grid>
            </Grid>

            <Grid item container spacing={1} alignItems='center' wrap='nowrap'>
                <Grid item>
                    <VariableIcon variableName='actionTime' />
                </Grid>
                <Grid className={classes.actionTimeText} item xs>
                    <VariableValue variableName='actionTime' value={actionTime} colored />{' / '}<VariableValue variableName='actionTime' value={initialActionTime} colored />
                </Grid>
                <Grid item xs={6}>
                    <div className={classes.gaugeWrapper}>
                        <TimeGauge duration={actionTime} />
                    </div>
                </Grid>
            </Grid>

            <Grid item container justify='space-between'>
                {spellList.map(spellId => (
                    <SpellButtonSimpleConnected key={spellId} spellId={spellId} />
                ))}
            </Grid>

        </Grid>
    </DetailsPanelTemplate>;
});

export const CharacterDetailsPanel: React.FC = () => {
    const { selectedCharacterId } = useDetailsContext();

    return selectedCharacterId
        ? <InnerCharacterDetailsPanel characterId={selectedCharacterId} />
        : null;
};
