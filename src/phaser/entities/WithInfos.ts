
export interface WithInfos<I> {
    getInfos(): I;
    updateInfos(infos: I): void;
}
