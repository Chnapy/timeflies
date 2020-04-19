
export interface Entity<S extends { readonly id: string }> {
    readonly id: string;

    toSnapshot(): S;
    updateFromSnapshot(snapshot: S): void;
}
