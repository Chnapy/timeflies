import { Box, Grid, makeStyles, Paper } from '@material-ui/core';
import { useIsMobile } from '@timeflies/app-ui';
import { SpellRole } from '@timeflies/common';
import clsx from 'clsx';
import React from 'react';
import { SpellButton, SpellButtonProps } from './spell-button';

export type SpellButtonPanelProps = {
    spellsProps: {
        [ spellRole in SpellRole ]: Omit<SpellButtonProps, 'imageSize'>;
    };
    spellRoleList: SpellRole[];
    defaultSpellRole: SpellRole;
};

const buttonSizes = {
    main: 56,
    secondary: 48
};

const useStyles = makeStyles(({ spacing }) => ({
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
    spellsProps, spellRoleList, defaultSpellRole
}) => {
    const classes = useStyles();
    const isMobile = useIsMobile();

    const spellRoleListWithoutDefault = spellRoleList.filter(spellRole => spellRole !== defaultSpellRole);

    const getDesktopContent = () => (
        <Grid container spacing={2}>
            {[ defaultSpellRole, ...spellRoleListWithoutDefault ].map(spellRole => (
                <Grid key={spellRole} item>
                    <SpellButton
                        {...spellsProps[ spellRole ]}
                        imageSize={buttonSizes.main}
                    />
                </Grid>
            ))}
        </Grid>
    );

    const getMobileContent = () => {
        const firstLine = spellRoleListWithoutDefault.slice(0, 2);

        const secondLine = [ spellRoleListWithoutDefault[ 2 ], defaultSpellRole ];

        return (
            <Grid container direction='column' spacing={2}>
                {[ firstLine, secondLine ].map((line, lineIndex) => (
                    <Grid key={lineIndex} item container alignItems='flex-end' justify='flex-end' spacing={2}>
                        {line.map((spellRole) => (
                            <Grid key={spellRole} className={clsx({
                                [ classes.mobileFirstButton ]: spellRole === firstLine[ 0 ]
                            })} item>
                                <SpellButton
                                    {...spellsProps[ spellRole ]}
                                    imageSize={spellRole === defaultSpellRole ? buttonSizes.main : buttonSizes.secondary}
                                />
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Grid>
        );
    };

    return (
        <Box position='relative' display='inline-flex' p={2} zIndex={0}>
            <Paper className={classes.background} />
            {isMobile
                ? getMobileContent()
                : getDesktopContent()}
        </Box>
    );
};
