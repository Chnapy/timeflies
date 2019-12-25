
export type SortType =
    | 'sampleSort1'
    | 'sampleSort2'
    | 'sampleSort3';

export interface SortInfos {
    name: string;
    type: SortType;
    zone: number;
    time: number;
    attaque: number;
}

export class Sort {

    readonly name: string;
    readonly type: SortType;
    readonly zone: number;
    readonly time: number;
    readonly attaque: number;

    constructor({ name, type, zone, time, attaque }: SortInfos) {
        this.name = name;
        this.type = type;
        this.zone = zone;
        this.time = time;
        this.attaque = attaque;
    }

}