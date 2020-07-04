import { BattleSnapshot } from './battle-snapshot';

export const seedObjectSnapshotable = (): Omit<BattleSnapshot, 'battleHash'> => ({
    "time": 1593079336988, "launchTime": -1, "charactersSnapshots": [ {
        "id": "c1", "playerId": "p1",
        "staticData": { "id": "c1", "name": "toto", "description": "", "role": "sampleChar1", "defaultSpellId": "s1", "initialFeatures": { "life": 100, "actionTime": 30000 }, "staticSpells": [] }, "position": { "id": "4:3", "x": 4, "y": 3 }, "orientation": "bottom", "features": { "life": 100, "actionTime": 30000 }
    }, {
        "id": "c2", "playerId": "p2",
        "staticData": { "id": "c2", "name": "africa", "description": "", "role": "sampleChar2", "defaultSpellId": "s3", "initialFeatures": { "life": 120, "actionTime": 25000 }, "staticSpells": [] }, "position": { "id": "6:4", "x": 6, "y": 4 }, "orientation": "bottom", "features": { "life": 120, "actionTime": 25000 }
    } ], "spellsSnapshots": [ { "id": "s1", "characterId": "c1", "staticData": { "id": "s1", "name": "name", "role": "move", "initialFeatures": { "rangeArea": -1, "attack": 10, "duration": 300 } }, "index": 1, "features": { "rangeArea": -1, "attack": 10, "duration": 300 } }, { "id": "s2", "characterId": "c1", "staticData": { "id": "s2", "name": "name", "role": "simpleAttack", "initialFeatures": { "rangeArea": 8, "attack": 20, "duration": 1000 } }, "index": 2, "features": { "rangeArea": 8, "attack": 20, "duration": 1000 } }, { "id": "s3", "characterId": "c2", "staticData": { "id": "s3", "name": "name", "role": "move", "initialFeatures": { "rangeArea": -1, "attack": 10, "duration": 600 } }, "index": 1, "features": { "rangeArea": -1, "attack": 10, "duration": 600 } }, { "id": "s4", "characterId": "c2", "staticData": { "id": "s4", "name": "name", "role": "simpleAttack", "initialFeatures": { "rangeArea": 5, "attack": 40, "duration": 1500 } }, "index": 1, "features": { "rangeArea": 5, "attack": 40, "duration": 1500 } } ]
});
