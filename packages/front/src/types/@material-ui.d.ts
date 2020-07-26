import { Palette, PaletteOptions, TypeBackground } from '@material-ui/core/styles/createPalette';

declare module '@material-ui/core/styles/createPalette' {

  interface TypeBackground {
    level1: string;
  }
}

declare module '@material-ui/core/styles/createPalette' {

    export interface PaletteFeatures {
        life: string;
        time: string;
        rangeArea: string;
        actionArea: string;
        attack: string;
    }

    interface Palette {
        features: PaletteFeatures;
    }

    interface PaletteOptions {
        features: PaletteFeatures;
    }
}
