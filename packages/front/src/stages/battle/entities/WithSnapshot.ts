
export interface WithSnapshot<S extends { id: string; }> {
    readonly id: string;
    getSnapshot(): S;
    updateFromSnapshot(snapshot: S): void;
}
