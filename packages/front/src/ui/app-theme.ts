import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';
import iFlash705Path from '../_assets/fonts/iFlash_705.ttf';
import monogramPath from '../_assets/fonts/monogram.ttf';

const iFlash705FontFace = {
    fontFamily: '"iFlash 705"',
    fontStyle: 'normal',
    src: `
      local('iFlash 705'),
      url(${iFlash705Path}) format('truetype')
    `
};

const monogramFontFace = {
    fontFamily: '"monogram"',
    fontStyle: 'normal',
    src: `
      local('monogram'),
      url(${monogramPath}) format('truetype')
    `
};

const white = '#FFFFFF';
const primary = '#EBDE66';
const contrast = '#FFF';

const bgDark = '#181818';
const bgPanel = '#333333';
const bgMain = '#424242';

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
            // disabled: '#888',
            // disabledBackground: '#888'
        },
        text: {
            primary: white
        },
        background: {
            default: bgDark,
            paper: bgPanel
        }
    },
    shape: {
        borderRadius: 0
    },
    typography: {
        htmlFontSize: 10,
        fontSize: 12,

        fontFamily: '"iFlash 705", "Roboto", "Arial", sans-serif',

        h1: {
            fontSize: '6.4rem',
            color: primary,
            textTransform: 'uppercase'
        },
        h2: {
            fontSize: '2.4rem',
            color: primary,
            textTransform: 'uppercase'
        },
        h3: {
            fontSize: '1.6rem',
            color: primary,
            textTransform: 'uppercase'
        },
        h4: {
            fontSize: '1.6rem',
            textTransform: 'uppercase'
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
    overrides: {
        MuiCssBaseline: {
            '@global': {
                '@font-face': [ iFlash705FontFace, monogramFontFace ],
                html: {
                    fontSize: '62.5%'
                },
                body: {
                    overflow: 'hidden'
                }
            },
        },

        MuiButton: {
            // containedPrimary: {
            //     '&, &:hover': {
            //         // border: `2px solid ${main}`
            //     }
            // },
            // containedSizeLarge: {
            //     padding: '6px 20px'
            // },
            // outlined: {
            //     backgroundColor: contrast,
            //     border: '2px solid currentColor !important'
            // },
            // outlinedPrimary: {
            //     '&:hover': {
            //         backgroundColor: '#F6F6F6'
            //     }
            // },
            // outlinedSizeLarge: {
            //     padding: '6px 20px'
            // },
            // root: {
            //     "&$disabled": {
            //         pointerEvents: "all"
            //     }
            // }
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
                backgroundColor: bgDark,
                fontSize: '1rem'
            }
        }
    }
});
