import classNames from 'classnames';
import React from 'react';
import { connect } from "react-redux";
import { CurrentSpellState } from "../../../phaser/spellEngine/SpellEngine";
import { UIState } from "../../UIState";
import css from './spellBtn.module.css';
import spriteCss from '../../../_assets/spritesheets/spells_spritesheet.module.css';
import { AssetManager } from '../../../assetManager/AssetManager';
import { Controller } from '../../../Controller';
import { BattleSpellPrepareAction } from '../../../phaser/battleReducers/BattleReducerManager';
import { SpellType } from '../../../phaser/entities/Spell';

export interface SpellBtnExternProps {
    spellId: number;
}

interface SpellBtnInnerProps {
    activeState: 'none' | CurrentSpellState;
    disabled: boolean;
    spellType: SpellType;
}

export const SpellBtn = connect<SpellBtnInnerProps, {}, SpellBtnExternProps, UIState<'battle'>>(
    ({
        data: { battleData: { currentCharacter, currentSpell } }
    }, {
        spellId
    }) => {
        const spell = currentCharacter!.spells.find(s => s.id === spellId)!;
        const activeState = currentSpell?.spell.id === spellId ? currentSpell.state : 'none';
        return {
            activeState,
            disabled: activeState === 'none' && currentSpell?.state === 'launch',
            spellType: spell.type
        }
    }
)(({
    activeState,
    disabled,
    spellType
}: SpellBtnExternProps & SpellBtnInnerProps) => {

    const typeName = AssetManager.spells.spellsMap[spellType];

    const onBtnClick = (e: React.MouseEvent): void => {
        e.preventDefault();
        if (disabled || activeState === 'launch') {
            return;
        }

        Controller.dispatch<BattleSpellPrepareAction>({
            type: 'battle/spell/prepare',
            spellType
        });
    };

    return <div className={classNames(css.root, {
        [css.active]: activeState !== 'none',
        [css.disabled]: disabled
    })}>

        <button className={classNames(css.btn)} onMouseUp={onBtnClick}>
            <div className={classNames(spriteCss.sprite, spriteCss[typeName])} />
        </button>

    </div>;
});