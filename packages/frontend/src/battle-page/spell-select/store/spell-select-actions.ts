import { createAction } from '@reduxjs/toolkit';
import { BattleState } from '../../store/battle-state';

export type SpellSelectAction = ReturnType<typeof SpellSelectAction>;
export const SpellSelectAction = createAction<BattleState['selectedSpellId']>('battle/spell-select');
