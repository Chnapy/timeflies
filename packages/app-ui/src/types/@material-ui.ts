import { SpellCategory } from '@timeflies/common';

declare module '@material-ui/core/styles/createPalette' {

  interface TypeBackground {
    level1: string;
  }
}

declare module '@material-ui/core/styles/createPalette' {

  export interface PaletteVariables {
    life: string;
    time: string;
    rangeArea: string;
    actionArea: string;
    attack: string;
  }

  export type PaletteSpellCategories = Record<SpellCategory, string>;

  interface Palette {
    variables: PaletteVariables;
    spellCategories: PaletteSpellCategories;
  }

  interface PaletteOptions {
    variables: PaletteVariables;
    spellCategories: PaletteSpellCategories;
  }
}

declare module '@material-ui/core/styles/createTypography' {

  export type TypographyFontFamilies = {
    heading: string;
    body: string;
    numeric: string;
  };

  interface Typography {
    fontFamilies: TypographyFontFamilies;
  }

  interface TypographyOptions {
    fontFamilies: TypographyFontFamilies;
  }
}
