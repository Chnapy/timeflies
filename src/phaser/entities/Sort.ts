import { Character } from './Character';
import { WithInfos } from './WithInfos';

export type SortType =
    | 'move'
    | 'orientate'
    | 'sampleSort1'
    | 'sampleSort2'
    | 'sampleSort3';

export interface SortInfos {
    id: number;
    name: string;
    type: SortType;
    zone: number;
    time: number;
    attaque: number;
}

export class Sort implements WithInfos<SortInfos> {

    readonly id: number;
    readonly name: string;
    readonly type: SortType;
    readonly zone: number;
    readonly time: number;
    readonly attaque: number;

    readonly character: Character;

    constructor({ id, name, type, zone, time, attaque }: SortInfos, character: Character) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.zone = zone;
        this.time = time;
        this.attaque = attaque;

        this.character = character;
    }

    getInfos(): SortInfos {
        return {
            id: this.id,
            type: this.type,
            name: this.name,
            time: this.time,
            zone: this.zone,
            attaque: this.attaque
        };
    }

    updateInfos(infos: SortInfos) {
    }
}