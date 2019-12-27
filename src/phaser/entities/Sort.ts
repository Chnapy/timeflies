import { Character } from './Character';

export type SortType =
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

export class Sort {

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

}