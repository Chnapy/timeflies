import { CharacterType } from "@shared/Character";
import { SpellType } from "@shared/Spell";
import classNames from "classnames";
import React from "react";
import { connect } from "react-redux";
import { AssetManager } from "../../../../assetManager/AssetManager";
import spriteCss from '../../../../_assets/spritesheets/spells_spritesheet.module.css';
import { UIState } from "../../../UIState";
import css from './characterItem.module.css';

export interface CharacterItemExternProps {
    characterId: string;
}

interface CharacterItemInnerProps {
    isCurrent: boolean;
    isMine: boolean;
    name: string;
    type: CharacterType;
    playerName: string;
    teamName: string;
    teamColor: string;
    lifePresent: number;
    lifeMax: number;
    actionTime: number;
    spells: SpellType[];
}

export const CharacterItem = connect<CharacterItemInnerProps, {}, CharacterItemExternProps, UIState<'battle'>>(
    ({ data: { battleData: { characters, globalTurn } } }, { characterId }) => {
        const character = characters.find(c => c.id === characterId)!;

        return {
            isCurrent: character.id === globalTurn?.currentTurn?.currentCharacter.id,
            isMine: character.isMine,
            name: character.staticData.name,
            type: character.staticData.type,
            playerName: character.player.name,
            teamName: character.team.name,
            teamColor: character.team.color,
            lifePresent: character.features.life,
            lifeMax: character.staticData.initialFeatures.life,
            actionTime: character.features.actionTime,
            spells: character.spells.map(s => s.staticData.type)
        };
    }
)(({
    isCurrent,
    isMine,
    name,
    type,
    playerName,
    teamName,
    teamColor,
    lifePresent,
    lifeMax,
    actionTime,
    spells
}: CharacterItemInnerProps & CharacterItemExternProps) => {

    const lifeBarFrontWidth = `${lifePresent / lifeMax * 100}%`;

    return <div className={classNames(css.root, {
        [css.current]: isCurrent,
        [css.mine]: isMine
    })} style={{ borderColor: teamColor }}>

        <div className={css.title}>

            <div className={css.name}>{name}</div>

            <div className={css.type}>{type}</div>

        </div>

        <div className={css.subtitle}>

            <div className={css.playerName}>{playerName}</div>

            <div className={css.teamName} style={{ borderColor: teamColor }}>{teamName}</div>

        </div>

        <div className={css.content}>

            <div className={css.face} style={{ backgroundColor: teamColor }} />

            <div className={css.details}>

                <div className={css.lifeBar}>
                    <div className={css.lifeBarFront} style={{ width: lifeBarFrontWidth }} />
                </div>

                <div className={css.lifeText}>
                    {lifePresent} / {lifeMax}
                </div>

                <div className={css.others}>

                    <div className={css.actionTime}>{(actionTime / 1000).toFixed(1)}</div>

                    <div className={css.spells}>
                        {spells.map(type => {
                            const typeName = AssetManager.spells.spellsMap[type];

                            return <div key={type} className={css.spellIcon}>
                                <div className={css.spriteWrapper}>
                                    <div className={classNames(spriteCss.sprite, spriteCss[typeName])} />
                                </div>
                            </div>;
                        })}
                    </div>

                </div>

            </div>

        </div>

    </div>;
});
