import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(({ palette, spacing }) => ({
    root: {
        position: 'relative',
        display: 'inline-block',
        backdropFilter: 'blur(2px)',
        padding: spacing(1, 2)
    },
    background: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: palette.background.paper,
        opacity: 0.25,
        zIndex: -1
    }
}));

export const BattleAnnouncement: React.FC = ({ children }) => {
    const classes = useStyles();

    return <div className={classes.root}>
        <div className={classes.background} />

        {children}
    </div>;
};
