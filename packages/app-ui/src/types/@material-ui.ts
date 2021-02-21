import { EntitiesVariablesName, SpellCategory, PlayerRelation } from '@timeflies/common';

declare module '@material-ui/core/styles/createPalette' {

  interface TypeBackground {
    level1: string;
  }
}

declare module '@material-ui/core/styles/createPalette' {

  export type PaletteVariables = Record<
    EntitiesVariablesName,
    string
  >;

  export type PaletteSpellCategories = Record<SpellCategory, string>;

  export type PaletteTimeItems = {
    tick: string;
    tock: string;
  };

  export type PalettePlayerRelations = Record<PlayerRelation, string>;

  export type PaletteTileStates = {
    range: string;
    action: string;
  };

  interface Palette {
    variables: PaletteVariables;
    spellCategories: PaletteSpellCategories;
    timeItems: PaletteTimeItems;
    playerRelations: PalettePlayerRelations;
    tileStates: PaletteTileStates;
  }

  interface PaletteOptions {
    variables: PaletteVariables;
    spellCategories: PaletteSpellCategories;
    timeItems: PaletteTimeItems;
    playerRelations: PalettePlayerRelations;
    tileStates: PaletteTileStates;
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
