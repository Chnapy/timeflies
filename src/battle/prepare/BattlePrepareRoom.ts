import path from 'path';
import { StaticCharacter, CharacterType, CharacterSnapshot } from "../../shared/Character";
import { Player, PlayerSnapshot } from "../../shared/Player";
import { Team, TeamSnapshot } from "../../shared/Team";
import { Util } from "../../Util";
import { TAction } from "../../transport/ws/WSSocket";
import { BattleRoomState, BattleSnapshot } from "../../shared/BattleRoomState";
import { SpellType, SpellSnapshot } from '../../shared/Spell';
import { MapInfos } from '../../shared/MapInfos';
import { BattleRunRoom } from '../run/BattleRunRoom';

// StoC

export interface BattleLoadSAction extends TAction<'battle-load'> {
    battleState: BattleRoomState;
}

export type BattlePrepareServerAction =
    | BattleLoadSAction;

// CtoS

export interface BattleLoadEndedCAction extends TAction<'battle-load-end'> {
}

export type BattlePrepareClientAction =
    | BattleLoadEndedCAction;

export class BattlePrepareRoom {

    readonly id: string;

    readonly minPlayer: number = 2;
    readonly maxPlayer: number = 10;

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

        if (this.players.length >= 2) {
            this.mock();
            this.launchBattle();
        }
    }

    launchBattle(): void {
        this.battleLaunched = true;

        const mapInfos: MapInfos = {
            urls: {
                schema: path.join('map', 'sample1', 'map_2.json'),
                sheet: path.join('map', 'sample1', 'map_2.png')
            },
            mapKey: 'sampleMap1',
            tilemapKey: 'map_main',
            decorLayerKey: 'decors',
            obstaclesLayerKey: 'obstacles'
        };

        const characterTypes: Set<CharacterType> = new Set(this.characters.map(c => c.type));

        const spellTypes: Set<SpellType> = new Set(this.characters.flatMap(c => c.staticSpells.map(s => s.type)));

        const battleSnapshot: BattleSnapshot = {
            teamsSnapshots: this.teams.map<TeamSnapshot>(t => {

                return {
                    id: t.id,
                    color: t.color,
                    name: t.name,
                    playersSnapshots: t.players.map<PlayerSnapshot>(p => {

                        return {
                            id: p.id,
                            name: p.name,
                            charactersSnapshots: p.staticCharacters.map<CharacterSnapshot>(c => {

                                return {
                                    staticData: c,
                                    features: c.initialFeatures,
                                    orientation: 'bottom',
                                    position: { x: 5, y: 4 }, // TODO
                                    spellsSnapshots: c.staticSpells.map<SpellSnapshot>(s => {

                                        return {
                                            staticData: s,
                                            features: s.initialFeatures
                                        };
                                    })
                                }
                            })
                        };
                    })
                };
            })
        };

        const battleState: BattleRoomState = {
            mapInfos,
            characterTypes: [...characterTypes],
            spellTypes: [...spellTypes],
            battleSnapshot
        }

        this.players.forEach(p => {
            p.socket.send<BattleLoadSAction>({
                type: 'battle-load',
                battleState
            });

            p.state = 'battle-loading';

            p.socket.on<BattleLoadEndedCAction>('battle-load-end', action => {
                p.state = 'battle-ready';

                if(this.players.every(p => p.state === 'battle-ready')) {

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

        this.characters.length = 0;
        this.characters.push(
            ...this.players.flatMap(p => p.staticCharacters)
        );

        this.teams.push(
            {
                id: '1',
                color: '#FF0000',
                name: 'Team Rocket',
                players: [this.players[0]]
            },
            {
                id: '2',
                color: '#FF00FF',
                name: 'Team Azure',
                players: [this.players[1]]
            }
        );

    }
}