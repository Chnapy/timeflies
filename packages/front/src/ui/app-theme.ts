import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';

const main = '#222';
const contrast = '#FFF';

export const appTheme: Theme = createMuiTheme({
    palette: {
        common: {
            black: main,
            white: contrast
        },
        primary: {
            main,
            contrastText: contrast
        },
        action: {
            disabled: '#888',
            disabledBackground: '#888'
        },
        text: {
            primary: main
        }
    },
    typography: {
        htmlFontSize: 10,
        fontSize: 10,

        button: {
            textTransform: 'none'
        }
    },
    overrides: {
        MuiButton: {
            containedPrimary: {
                '&, &:hover': {
                    border: `2px solid ${main}`
                }
            },
            containedSizeLarge: {
                padding: '6px 20px'
            },
            outlined: {
                backgroundColor: contrast,
                border: '2px solid currentColor !important'
            },
            outlinedPrimary: {
                '&:hover': {
                    backgroundColor: '#F6F6F6'
                }
            },
            outlinedSizeLarge: {
                padding: '6px 20px'
            },
            root: {
                "&$disabled": {
                    pointerEvents: "all"
                }
            }
        },
        MuiChip: {
            root: {
                borderRadius: 4
            },
            sizeSmall: {
                height: 16
            },
            outlined: {
                backgroundColor: contrast,
            }
        },
        MuiTooltip: {
            tooltip: {
                backgroundColor: main,
                fontSize: '1rem'
            }
        }
    }
});
