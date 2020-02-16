import { Pathfinder } from './Pathfinder';
import { Position } from '@timeflies/shared';

describe('# Pathfinder', () => {

    let finder: Pathfinder;

    beforeEach(() => {
        finder = undefined as any;
    });

    it.each<[
        string, // name
        number[][], // map
        Position[], // characters pos
        [ Position, Position ],   // start, end
        Position[]  // path expected
    ]>([
        [
            'no obstacles',
            [
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0 ]
            ],
            [],
            [
                { x: 1, y: 2 },
                { x: 3, y: 2 }
            ],
            [
                { x: 1, y: 2 },
                { x: 2, y: 2 },
                { x: 3, y: 2 }
            ]
        ],
        [
            'some obstacles',
            [
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 1, 0, 0 ]
            ],
            [],
            [
                { x: 1, y: 2 },
                { x: 3, y: 2 }
            ],
            [
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 2, y: 3 },
                { x: 3, y: 3 },
                { x: 3, y: 2 }
            ]
        ],
        [
            'unattainable target',
            [
                [ 0, 1, 0, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 1, 0, 0 ]
            ],
            [],
            [
                { x: 1, y: 2 },
                { x: 3, y: 2 }
            ],
            []
        ],
        [
            'characters presence',
            [
                [ 0, 1, 0, 0, 0 ],
                [ 0, 0, 1, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 0, 0, 0 ],
                [ 0, 0, 1, 0, 0 ]
            ],
            [
                { x: 2, y: 2 }
            ],
            [
                { x: 1, y: 2 },
                { x: 3, y: 2 }
            ],
            [
                { x: 1, y: 2 },
                { x: 1, y: 3 },
                { x: 2, y: 3 },
                { x: 3, y: 3 },
                { x: 3, y: 2 }
            ]
        ]
    ])('should find correct path with: %s', async (_, map, charPos, calculateParams, expected) => {

        const width = map[ 0 ].length;
        const height = map.length;

        const hasObstacleAt = ({ x, y }: Position): boolean => !!map[ y ][ x ];

        finder = Pathfinder(
            {
                tilemap: {
                    width,
                    height
                },
                hasObstacleAt
            },
            () => charPos
        );

        finder.refreshGrid();

        await expect(finder.calculatePath(...calculateParams).promise)
            .resolves
            .toEqual<Position[]>(expected);
    });
});
