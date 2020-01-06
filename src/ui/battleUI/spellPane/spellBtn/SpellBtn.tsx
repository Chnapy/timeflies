import classNames from 'classnames';
import React from 'react';
import { connect } from "react-redux";
import { CurrentSpellState } from "../../../../phaser/spellEngine/SpellEngine";
import { UIState } from "../../../UIState";
import css from './spellBtn.module.css';
import spriteCss from '../../../../_assets/spritesheets/spells_spritesheet.module.css';
import { AssetManager } from '../../../../assetManager/AssetManager';
import { Controller } from '../../../../Controller';
import { BattleSpellPrepareAction } from '../../../../phaser/battleReducers/BattleReducerManager';
import { SpellType } from '../../../../phaser/entities/Spell';
import { SpellBtnInfos, SpellBtnInfosProps } from './SpellBtnInfos';

export interface SpellBtnExternProps {
    spellId: number;
}

interface SpellBtnInnerProps {
    activeState: 'none' | CurrentSpellState;
    disabled: boolean;
    spellType: SpellType;
    spellInfos: SpellBtnInfosProps;
}

export const SpellBtn = connect<SpellBtnInnerProps, {}, SpellBtnExternProps, UIState<'battle'>>(
    ({
        data: { battleData: { currentTurn } }
    }, {
        spellId
    }) => {
        const spell = currentTurn!.currentCharacter.spells.find(s => s.id === spellId)!;
        const activeState = currentTurn!.currentSpell.spell.id === spellId ? currentTurn!.currentSpell.state : 'none';
        return {
            activeState,
            disabled: activeState === 'none' && currentTurn!.currentSpell.state === 'launch',
            spellType: spell.type,
            spellInfos: {
                time: spell.time,
                attack: spell.attaque
            }
        }
    }
)(({
    activeState,
    disabled,
    spellType,
    spellInfos
}: SpellBtnExternProps & SpellBtnInnerProps) => {

    const typeName = AssetManager.spells.spellsMap[spellType];

    const onBtnClick = (): void => {
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

        <div className={css.btnWrapper}>

            <button className={classNames(css.btn)} onClick={onBtnClick}>
                <div className={classNames(spriteCss.sprite, spriteCss[typeName])} />
            </button>

        </div>

        <SpellBtnInfos {...spellInfos}/>

    </div>;
});