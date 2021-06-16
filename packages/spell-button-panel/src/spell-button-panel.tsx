import { Box, Grid, makeStyles, Paper } from '@material-ui/core';
import { useIsMobile } from '@timeflies/app-ui';
import { SpellId } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';
import { SpellButton, SpellButtonProps } from './spell-button';

export type SpellButtonPanelProps = {
    spellsProps: {
        [ spellId in SpellId ]: Omit<SpellButtonProps, 'index' | 'imageSize'>;
    };
    spellList: SpellId[];
    defaultSpellId: SpellId;
};

const buttonSizes = {
    main: 56,
    secondary: 48
};

const useStyles = makeStyles(({ spacing }) => ({
    root: {
        backdropFilter: 'blur(2px)'
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        top: 0,
        zIndex: -1,
        opacity: 0.5
    },
    mobileFirstButton: {
        marginBottom: -spacing(1),
        marginRight: (buttonSizes.main - buttonSizes.secondary) - spacing(1)
    }
}));

export const SpellButtonPanel: React.FC<SpellButtonPanelProps> = ({
    spellsProps, spellList, defaultSpellId
}) => {
    const classes = useStyles();
    const isMobile = useIsMobile();

    const spellListWithoutDefault = spellList.filter(spellId => spellId !== defaultSpellId);

    const getDesktopContent = () => (
        <Grid container spacing={2}>
            {[ defaultSpellId, ...spellListWithoutDefault ].map((spellId, index) => (
                <Grid key={spellId} item>
                    <SpellButton
                        {...spellsProps[ spellId ]}
                        index={index}
                        imageSize={buttonSizes.main}
                    />
                </Grid>
            ))}
        </Grid>
    );

    const getMobileContent = () => {
        const firstLine = spellListWithoutDefault.slice(0, 2);

        const secondLine = [ spellListWithoutDefault[ 2 ], defaultSpellId ];

        return (
            <Grid container direction='column' spacing={2}>
                {[ firstLine, secondLine ].map((line, lineIndex) => (
                    <Grid key={lineIndex} item container alignItems='flex-end' justify='flex-end' spacing={2}>
                        {line.map((spellId, index) => (
                            <Grid key={spellId} className={clsx({
                                [ classes.mobileFirstButton ]: spellId === firstLine[ 0 ]
                            })} item>
                                <SpellButton
                                    {...spellsProps[ spellId ]}
                                    index={index}
                                    imageSize={spellId === defaultSpellId ? buttonSizes.main : buttonSizes.secondary}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box className={classes.root} position='relative' display='inline-flex' p={2} zIndex={0}>
            <Paper className={classes.background} />
            {isMobile
                ? getMobileContent()
                : getDesktopContent()}
        </Box>
    );
};
