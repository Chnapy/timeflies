import { Player, PlayerInfos } from './Player';
import { BattleScene } from '../scenes/BattleScene';

export interface TeamInfos {
    id: number;
    name: string;
    color: number;
    playersInfos: PlayerInfos[];
}

export class Team {

    readonly id: number;
    readonly name: string;
    readonly color: number;
    readonly players: Player[];

    constructor({id, name, color, playersInfos}: TeamInfos, scene: BattleScene) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.players = playersInfos.map(infos => new Player(infos, this, scene));
    }
}
