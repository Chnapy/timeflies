import { Grid, makeStyles } from '@material-ui/core';
import { HealthGauge, UIText, VariableIcon, VariableValue } from '@timeflies/app-ui';
import { getCharacterCategory } from '@timeflies/common';
import { RoomListCharacter, RoomListSpell } from '@timeflies/socket-messages';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import { TimeGauge } from '@timeflies/time-gauge-panel';
import React from 'react';
import { DetailsPanelTemplate } from '../../battle-page/hud/details-panel/details-panel-template';
import { CharacterDescription } from '../../components/character-description/character-description';
import { CharacterName } from '../../components/character-description/character-name';
import { SpellCategoryLabel } from './details-components';
import { RoomSpellButton } from './room-spell-button';

type RoomCharacterCardProps = {
    character: RoomListCharacter;
    spellList: RoomListSpell[];
    onClick: () => void;
};

const spriteSize = 32;
const playerLineHeight = 12;

const useStyles = makeStyles(({ palette }) => ({
    spriteRect: {
        width: playerLineHeight,
        height: playerLineHeight
    },
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

export const RoomCharacterCard: React.FC<RoomCharacterCardProps> = React.memo(({ character, spellList, onClick }) => {
    const classes = useStyles();

    const characterCategory = getCharacterCategory(character.characterRole);
    const { health, actionTime } = character.variables;

    const state: SpritesheetsUtils.CharacterSpriteConfig = {
        role: character.characterRole,
        state: 'idle',
        orientation: 'bottom'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(state);
    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(state);
    const framesOrder = SpritesheetsUtils.getCharacterFramesOrder(state);

    return <DetailsPanelTemplate minWidth={200} maxWidth={200} onClick={onClick}>
        <Grid container direction='column' spacing={1}>

            <Grid item container justify='space-between' wrap='nowrap'>
                <Grid item>
                    <UIText variant='h3'>
                        <CharacterName characterRole={character.characterRole} />
                    </UIText>
                    <SpellCategoryLabel category={characterCategory} variant='body1' />
                </Grid>

                <Grid item container direction='column' alignItems='flex-end'>
                    <Grid item>
                        <CharacterAnimatedImage
                            size={spriteSize}
                            animationPath={animationPath}
                            framesDurations={framesDurations}
                            framesOrder={framesOrder}
                            pingPong={false}
                            scale={2}
                        />
                    </Grid>
                </Grid>
            </Grid>

            <Grid item>
                <UIText variant='body2'>
                    <CharacterDescription characterRole={character.characterRole} />
                </UIText>
            </Grid>

            <Grid item container spacing={1} alignItems='center' wrap='nowrap'>
                <Grid item>
                    <VariableIcon variableName='health' />
                </Grid>
                <Grid className={classes.healthText} item xs>
                    <VariableValue variableName='health' value={health} colored />
                </Grid>
                <Grid item xs={7}>
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
                    <VariableValue variableName='actionTime' value={actionTime} colored />
                </Grid>
                <Grid item xs={7}>
                    <div className={classes.gaugeWrapper}>
                        <TimeGauge duration={actionTime} />
                    </div>
                </Grid>
            </Grid>

            <Grid item container justify='space-between'>
                {spellList.map(spell => (
                    <RoomSpellButton key={spell.spellRole} spell={spell} />
                ))}
            </Grid>

        </Grid>
    </DetailsPanelTemplate>;
});
