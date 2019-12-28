import { Player, PlayerInfos } from './Player';
import { BattleScene } from '../scenes/BattleScene';
import { WithInfos } from './WithInfos';

export interface TeamInfos {
    id: number;
    name: string;
    color: number;
    playersInfos: PlayerInfos[];
}

export class Team implements WithInfos<TeamInfos> {

    readonly id: number;
    readonly name: string;
    readonly color: number;
    readonly players: Player[];

    constructor({ id, name, color, playersInfos }: TeamInfos, scene: BattleScene) {
        this.id = id;
        this.name = name;
        this.color = color;
        this.players = playersInfos.map(infos => new Player(infos, this, scene));
    }

    getInfos(): TeamInfos {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            playersInfos: this.players.map(p => p.getInfos())
        };
    }

    updateInfos(infos: TeamInfos): void {
        infos.playersInfos.forEach(pInfos => {
            const player = this.players.find(p => p.id === pInfos.id);

            player!.updateInfos(pInfos);
        });
    }
}
