import { Pathfinder } from './Pathfinder';
import { Position } from '@timeflies/shared';

describe('# Pathfinder', () => {

    let finder: Pathfinder;

    beforeEach(() => {
        finder = undefined as any;
    });

    it.each<[
        string,
        {
            map: number[][],
            charPos?: Position[],
            startEnd: [Position, Position],
            path: Position[]
        }
    ]>([
        [
            'no obstacles',
            {
                map: [
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0]
                ],
                startEnd: [
                    { x: 1, y: 2 },
                    { x: 3, y: 2 }
                ],
                path: [
                    { x: 1, y: 2 },
                    { x: 2, y: 2 },
                    { x: 3, y: 2 }
                ]
            }
        ],
        [
            'some obstacles',
            {
                map: [
                    [0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0]
                ],
                startEnd: [
                    { x: 1, y: 2 },
                    { x: 3, y: 2 }
                ],
                path: [
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 2, y: 3 },
                    { x: 3, y: 3 },
                    { x: 3, y: 2 }
                ]
            }
        ],
        [
            'unattainable target',
            {
                map: [
                    [0, 1, 0, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 1, 0, 0]
                ],
                startEnd: [
                    { x: 1, y: 2 },
                    { x: 3, y: 2 }
                ],
                path: []
            }
        ],
        [
            'characters presence',
            {
                map: [
                    [0, 1, 0, 0, 0],
                    [0, 0, 1, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0],
                    [0, 0, 1, 0, 0]
                ],
                charPos: [
                    { x: 2, y: 2 }
                ],
                startEnd: [
                    { x: 1, y: 2 },
                    { x: 3, y: 2 }
                ],
                path: [
                    { x: 1, y: 2 },
                    { x: 1, y: 3 },
                    { x: 2, y: 3 },
                    { x: 3, y: 3 },
                    { x: 3, y: 2 }
                ]
            }
        ]
    ])('should find correct path with: %s', async (_, { map, charPos = [], startEnd, path }) => {

        const width = map[0].length;
        const height = map.length;

        const hasObstacleAt = ({ x, y }: Position): boolean => !!map[y][x];

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

        await expect(finder.calculatePath(...startEnd).promise)
            .resolves
            .toEqual<Position[]>(path);
    });
});
