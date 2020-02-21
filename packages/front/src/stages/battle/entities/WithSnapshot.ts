
export interface WithSnapshot<S> {
    getSnapshot(): S;
    updateFromSnapshot(snapshot: S): void;
}
