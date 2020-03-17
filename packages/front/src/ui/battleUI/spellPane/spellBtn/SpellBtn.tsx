import { SpellType } from '@timeflies/shared';
import classNames from 'classnames';
import React from 'react';
import { connect } from "react-redux";
import { AssetManager } from '../../../../assetManager/AssetManager';
import { Controller } from '../../../../Controller';
import { CurrentSpellState } from "../../../../phaser/spellEngine/SpellEngine";
import { BStateSpellPrepareAction } from '../../../../stages/battle/battleState/BattleStateSchema';
import spriteCss from '../../../../_assets/spritesheets/spells_spritesheet.module.css';
import { UIState } from "../../../UIState";
import css from './spellBtn.module.css';
import { SpellBtnInfos, SpellBtnInfosProps } from './SpellBtnInfos';

export interface SpellBtnExternProps {
    spellId: string;
}

interface SpellBtnInnerProps {
    activeState: 'none' | CurrentSpellState;
    disabled: boolean;
    spellType: SpellType;
    spellInfos: SpellBtnInfosProps;
}

export const SpellBtn = connect<SpellBtnInnerProps, {}, SpellBtnExternProps, UIState<'battle'>>(
    ({
        data: { battleData: { globalTurn } }
    }, {
        spellId
    }) => {
        const { character: currentCharacter, currentSpell } = globalTurn!.currentTurn;

        const spell = currentCharacter.spells.find(s => s.id === spellId)!;
        const activeState = currentSpell?.spell.id === spellId ? currentSpell.state : 'none';
        const disabled = currentCharacter.isMine
            ? activeState === 'none' && currentSpell?.state === 'launch'
            : true;

        return {
            activeState,
            disabled,
            spellType: spell.staticData.type,
            spellInfos: {
                time: spell.feature.duration,
                attack: spell.feature.attack
            }
        }
    }
)(({
    activeState,
    disabled,
    spellType,
    spellInfos
}: SpellBtnExternProps & SpellBtnInnerProps) => {

    const typeName = AssetManager.spells.spellsMap[ spellType ];

    const onBtnClick = (): void => {
        if (disabled || activeState === 'launch') {
            return;
        }

        Controller.dispatch<BStateSpellPrepareAction>({
            type: 'battle/state/event',
            eventType: 'SPELL-PREPARE',
            payload: {
                spellType
            }
        });
    };

    return <div className={classNames(css.root, {
        [ css.active ]: activeState !== 'none',
        [ css.disabled ]: disabled
    })}>

        <div className={css.btnWrapper}>

            <button className={classNames(css.btn)} onClick={onBtnClick}>
                <div className={classNames(spriteCss.sprite, spriteCss[ typeName ])} />
            </button>

        </div>

        <SpellBtnInfos {...spellInfos} />

    </div>;
});