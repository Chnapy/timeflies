import { Grid, makeStyles } from '@material-ui/core';
import { HealthGauge, UIText } from '@timeflies/app-ui';
import { CharacterRole, CharacterUtils, PlayerRelation, switchUtil } from '@timeflies/common';
import { CharacterAnimatedImage } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import clsx from 'clsx';
import React from 'react';

export type CharacterItemProps = {
    playerName: string;
    characterRole: CharacterRole;
    playerRelation: PlayerRelation;
    teamColor: string;
    health: number;
    isPlaying: boolean;
};

type CharacterItemExtraProps = {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onClick: () => void;
};

const height = 48;
const spriteSize = 32;
const teamRectWidth = 4;
const healthGaugeWidth = 8;
const width = teamRectWidth + height + healthGaugeWidth;

type StyleProps = Pick<CharacterItemProps, 'teamColor' | 'playerRelation' | 'isPlaying'> & {
    isAlive: boolean;
};

const useStyles = makeStyles(({ palette }) => ({
    root: {
        width
    },
    playerName: {
        maxWidth: width,
        textOverflow: 'clip'
    },
    content: ({ isPlaying }: StyleProps) => ({
        display: 'inline-flex',
        height,
        cursor: 'pointer',
        outlineColor: isPlaying ? palette.common.white : 'transparent',
        outlineWidth: 2,
        outlineStyle: 'solid',
    }),
    teamRect: ({ teamColor }: StyleProps) => ({
        width: teamRectWidth,
        height: '100%',
        backgroundColor: teamColor
    }),
    spriteRect: ({ playerRelation }: StyleProps) => ({
        width: height,
        height: '100%',
        backgroundColor: switchUtil(playerRelation, {
            me: palette.background.paper,
            ally: palette.playerRelations.ally,
            enemy: palette.playerRelations.enemy
        }),
        padding: (height - spriteSize) / 2
    }),
    disabled: ({ isAlive }: StyleProps) => ({
        opacity: isAlive ? 1 : 0.5
    }),
    healthGauge: {
        width: healthGaugeWidth,
        padding: 2,
        backgroundColor: palette.background.default
    }
}));

export const CharacterItem: React.FC<CharacterItemProps & CharacterItemExtraProps> = ({
    playerName, teamColor, playerRelation, characterRole, health, isPlaying, onMouseEnter, onMouseLeave, onClick
}) => {
    const isAlive = CharacterUtils.isAlive(health);
    const classes = useStyles({ teamColor, playerRelation, isPlaying, isAlive });

    const state: SpritesheetsUtils.CharacterSpriteConfig = {
        role: characterRole,
        state: 'idle',
        orientation: 'bottom'
    };

    const animationPath = SpritesheetsUtils.getCharacterAnimationPath(state);

    const framesDurations = SpritesheetsUtils.getCharacterFramesDurations(state);

    return <Grid className={classes.root} container direction='column'>

        <Grid item>
            <UIText className={clsx(classes.playerName, classes.disabled)} variant='body2' noWrap>
                {playerName}
            </UIText>
        </Grid>

        <Grid item>
            <div
                className={classes.content}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onClick={onClick}
            >
                <div className={classes.teamRect} />

                <div className={classes.spriteRect}>
                    <div className={classes.disabled}>
                        <CharacterAnimatedImage
                            size={spriteSize}
                            animationPath={animationPath}
                            framesDurations={framesDurations}
                            pingPong={false}
                            run={false}
                            scale={2}
                        />
                    </div>
                </div>

                <div className={classes.healthGauge}>
                    <HealthGauge
                        direction='vertical'
                        health={health}
                    />
                </div>
            </div>
        </Grid>

    </Grid>;
};
