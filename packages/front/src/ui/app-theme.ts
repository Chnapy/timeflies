import createMuiTheme, { Theme } from '@material-ui/core/styles/createMuiTheme';

export const appTheme: Theme = createMuiTheme({
    palette: {
        primary: {
            main: '#222',
            contrastText: '#FFF'
        }
    },
    typography: {
        htmlFontSize: 10,
        fontSize: 10,
        
    }
});
