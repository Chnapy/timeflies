import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';
import { TypographyFontFamilies } from '@material-ui/core/styles/createTypography';

const white = '#FFFFFF';
const primary = '#EBDE66';

const bgDark = '#181818';
const bgPanel = '#303030';
const bgMain = '#424242';

const fontFamilies: TypographyFontFamilies = {
    heading: '"Rubik"',
    body: '"Source Sans Pro"',
    numeric: '"Source Sans Pro"'
};

export const appTheme: Theme = createMuiTheme({
    palette: {
        type: 'dark',
        common: {
            black: bgDark,
            white
        },
        primary: {
            main: primary,
            contrastText: bgDark
        },
        secondary: {
            main: white
        },
        action: {
            disabled: '#888',
            // disabledBackground: '#888'
        },
        text: {
            primary: white
        },
        background: {
            default: bgDark,
            paper: bgPanel,
            level1: bgMain
        },
        variables: {
            health: '#EB6F6F',
            actionTime: primary,
            rangeArea: '#8875FF',
            actionArea: '#D63551',
            attack: '#FF8B66',
            duration: primary,
            // TODO
            lineOfSight: '',
            orientation: '',
            position: ''
        },
        spellCategories: {
            offensive: '#EB5757',
            support: '#80CAFF',
            placement: '#6FCF97'
        },
        timeItems: {
            tick: primary,
            tock: '#FF8C22'
        }
    },
    shape: {
        borderRadius: 0
    },
    typography: {
        htmlFontSize: 10,
        fontSize: 12,

        fontFamilies,

        fontFamily: `${fontFamilies.body}, "Roboto", "Arial", sans-serif`,

        h1: {
            fontFamily: fontFamilies.heading,
            fontSize: '6.4rem',
            color: primary,
        },
        h2: {
            fontFamily: fontFamilies.heading,
            fontSize: '3.2rem',
            color: primary,
        },
        h3: {
            fontFamily: fontFamilies.heading,
            fontSize: '2.4rem',
            color: primary,
        },
        h4: {
            fontFamily: fontFamilies.heading,
            fontSize: '2.4rem',
        },
        body1: {
            fontSize: '1.6rem'
        },
        body2: {
            fontSize: '1.2rem'
        },
        button: {
            fontSize: '1.6rem'
        }
    },
    props: {
        MuiButtonBase: {
            centerRipple: true
        },
    },
    overrides: {
        MuiCssBaseline: {
            '@global': {
                html: {
                    fontSize: '62.5%'
                },
                body: {
                    overflow: 'hidden'
                }
            },
        },

        MuiInput: {
            underline: {
                '&::before': {
                    borderWidth: 2
                }
            }
        },

        MuiFilledInput: {
            underline: {
                '&::before': {
                    borderWidth: '2px !important'
                }
            }
        },

        MuiOutlinedInput: {
            notchedOutline: {
                borderWidth: 2
            }
        },

        MuiTooltip: {
            tooltip: {
                backgroundColor: bgDark,
                fontSize: '1rem'
            }
        }
    }
});
