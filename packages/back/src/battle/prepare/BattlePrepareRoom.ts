import { BattleLoadEndedCAction, BattleLoadPayload, BattleLoadSAction, MapConfig, PlayerInfos, SpellType, StaticCharacter } from '@timeflies/shared';
import urlJoin from 'url-join';
import { staticURL } from '../..';
import { PlayerData } from "../../PlayerData";
import { TeamData } from "../../TeamData";
import { Util } from "../../Util";
import { BattleRunRoom } from '../run/BattleRunRoom';

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
        player.state = 'battle-prepare';
        this.players.push(player);

        player.socket.addRoom(this.id);

        console.log('player', player.name, ' => room', this.id, this.players.length);

        if (this.players.length >= this.minPlayer) {
            this.mock();
            this.launchBattle();
        }
    }

    launchBattle(): void {
        this.battleLaunched = true;

        const mapConfig: MapConfig = this.mapConfig!;

        const spellTypes: Set<SpellType> = new Set(this.characters.flatMap(c => c.staticSpells.map(s => s.type)));

        const payload: Omit<BattleLoadPayload, 'playerInfos'> = {
            mapConfig: {
                ...mapConfig,
                schemaUrl: urlJoin(staticURL, mapConfig.schemaUrl)
            },
            spellTypes: [ ...spellTypes ]
        };

        this.players.forEach(p => {

            const playerInfos: PlayerInfos = {
                id: p.id,
                name: p.name
            };

            p.socket.send<BattleLoadSAction>({
                type: 'battle-load',
                payload: {
                    ...payload,
                    playerInfos
                }
            });

            p.state = 'battle-loading';

            p.socket.on<BattleLoadEndedCAction>('battle-load-end', action => {
                p.state = 'battle-ready';

                if (this.players.every(p => p.state === 'battle-ready')) {

                    // move everybody to battlerunroom
                    console.log('lets go dudes')
                    this.battleRunRoom = BattleRunRoom(mapConfig, this.teams);
                    this.battleRunRoom.start();
                }
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
            defaultTilelayerName: 'view',
            obstacleTilelayerName: 'obstacles',
            initLayerName: 'init'
        };

        this.characters.length = 0;
        this.characters.push(
            ...this.players.flatMap(p => p.staticCharacters)
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