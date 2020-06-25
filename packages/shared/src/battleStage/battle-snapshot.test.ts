import { seedObjectSnapshotable } from './battle-snapshot.seed';
import { getBattleSnapshotWithHash } from './battle-snapshot';

describe('# BattleSnapshot', () => {

    it('should give same hash for 2 same objects', () => {

        expect(
            getBattleSnapshotWithHash(seedObjectSnapshotable()).battleHash
        ).toEqual(
            getBattleSnapshotWithHash(seedObjectSnapshotable()).battleHash
        );
    });

    it('should give new hash after a minor change', () => {

        const obj = seedObjectSnapshotable();

        const firstHash = getBattleSnapshotWithHash(obj).battleHash;

        obj.charactersSnapshots[0].position.y++;

        expect(
            getBattleSnapshotWithHash(obj).battleHash
        ).not.toEqual(firstHash);
    });
});
