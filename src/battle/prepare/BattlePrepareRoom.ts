import urlJoin from 'url-join';
import { staticURL } from '../..';
import { BattleLoadEndedCAction, BattleLoadSAction } from '../../shared/action/BattlePrepareAction';
import { BattleLoadPayload } from '../../shared/BattleLoadPayload';
import { CharacterType, StaticCharacter } from "../../shared/Character";
import { MapInfos } from '../../shared/MapInfos';
import { Player } from "../../shared/Player";
import { SpellType } from '../../shared/Spell';
import { Team } from "../../shared/Team";
import { Util } from "../../Util";
import { BattleRunRoom } from '../run/BattleRunRoom';
import { PlayerInfos } from '../../shared/PlayerInfos';

export class BattlePrepareRoom {

    readonly id: string;

    readonly minPlayer: number = 2;
    readonly maxPlayer: number = 10;

    private mapInfos?: MapInfos;
    readonly players: Player[];
    readonly teams: Team[];
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

    addPlayer(player: Player): void {
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

        const mapInfos: MapInfos = this.mapInfos!;

        const characterTypes: Set<CharacterType> = new Set(this.characters.map(c => c.type));

        const spellTypes: Set<SpellType> = new Set(this.characters.flatMap(c => c.staticSpells.map(s => s.type)));

        const payload: Omit<BattleLoadPayload, 'playerInfos'> = {
            mapInfos: {
                ...mapInfos,
                urls: {
                    schema: urlJoin(staticURL, mapInfos.urls.schema),
                    sheet: urlJoin(staticURL, mapInfos.urls.sheet)
                }
            },
            characterTypes: [...characterTypes],
            spellTypes: [...spellTypes]
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
                    this.battleRunRoom = new BattleRunRoom(mapInfos, this.teams);
                    this.battleRunRoom.init();
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

        this.mapInfos = {
            urls: {
                schema: 'map/sample1/map_2.json',
                sheet: 'map/sample1/map_2.png'
            },
            mapKey: 'sampleMap1',
            tilemapKey: 'map_main',
            decorLayerKey: 'decors',
            obstaclesLayerKey: 'obstacles',
            initLayerKey: 'init'
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
                players: [this.players[0]]
            },
            this.players[1] && {
                id: '2',
                color: '#FF00FF',
                name: 'Team Azure',
                players: [this.players[1]]
            }
        ].filter(Boolean));

    }
}