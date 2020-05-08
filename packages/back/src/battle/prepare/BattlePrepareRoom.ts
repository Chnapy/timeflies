import { BattleLoadEndedCAction, BattleLoadPayload, BattleLoadSAction, MapConfig, PlayerInfos, StaticCharacter } from '@timeflies/shared';
import urlJoin from 'url-join';
import { staticURL } from '../../config';
import { PlayerData } from "../../PlayerData";
import { TeamData } from "../../TeamData";
import { Util } from "../../Util";
import { BattleRunRoom } from '../run/BattleRunRoom';
import { WSSocketPool } from '../../transport/ws/WSSocket';

export class BattlePrepareRoom {

    readonly id: string;

    readonly minPlayer: number = 2;
    readonly maxPlayer: number = 10;

    private mapConfig?: MapConfig;
    readonly players: PlayerData[];
    readonly teams: TeamData[];
    readonly characters: StaticCharacter[];

    private battleLaunched: boolean;
    private battleRunRoom?: BattleRunRoom;

    constructor() {
        this.id = this.generateID();
        this.players = [];
        this.teams = [];
        this.characters = [];
        this.battleLaunched = false;
    }

    addPlayer(player: PlayerData): void {
        this.players.push(player);

        console.log('player', player.name, ' => room', this.id, this.players.length);

        if (this.players.length >= this.minPlayer) {
            this.mock();
            this.launchBattle();
        }
    }

    launchBattle(): void {
        this.battleLaunched = true;

        const mapConfig: MapConfig = this.mapConfig!;

        const payload: Omit<BattleLoadPayload, 'playerInfos'> = {
            mapConfig: {
                ...mapConfig,
                schemaUrl: urlJoin(staticURL, mapConfig.schemaUrl)
            },
        };

        this.players.forEach(p => {

            const playerInfos: PlayerInfos = {
                id: p.id,
                name: p.name
            };

            const socket: WSSocketPool = (p.socket as any).createPool();

            socket.send<BattleLoadSAction>({
                type: 'battle-load',
                payload: {
                    ...payload,
                    playerInfos
                }
            });

            socket.on<BattleLoadEndedCAction>('battle-load-end', action => {

                // if (this.players.every(p => p.state === 'battle-ready')) {

                //     // move everybody to battlerunroom
                //     console.log('lets go dudes')
                //     this.battleRunRoom = BattleRunRoom(mapConfig, this.teams);
                //     this.battleRunRoom.start();
                // }
            });
        });
    }

    isOpen(): boolean {
        return !this.battleLaunched && this.players.length < this.maxPlayer;
    }

    canBeLaunch(): boolean {
        const isNbPlayersOK = this.players.length >= this.minPlayer;

        // check also map and other settings

        return !this.battleLaunched && isNbPlayersOK;
    }

    private generateID(): string {
        return Util.getUnique(8);
    }

    private mock(): void {

        this.mapConfig = {
            id: 'map-1',
            schemaUrl: 'map/sample2/map.json',
            name: 'm1',
            height: 10,
            nbrCharactersPerTeam: 1,
            nbrTeams: 1,
            previewUrl: '',
            width: 10
        };

        this.characters.length = 0;
        this.characters.push(
            // ...this.players.flatMap(p => p.staticCharacters)
        );

        this.teams.push(...[
            {
                id: '1',
                color: '#FF0000',
                name: 'Team Rocket',
                players: [ this.players[ 0 ] ]
            },
            this.players[ 1 ] && {
                id: '2',
                color: '#FF00FF',
                name: 'Team Azure',
                players: [ this.players[ 1 ] ]
            }
        ].filter(Boolean));

    }
}