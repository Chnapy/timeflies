import { Pathfinder } from './Pathfinder';
import { Position, TileType } from '@timeflies/shared';

describe('# Pathfinder', () => {

    it('should throw error on trying to calculate path without refresh grid before', async () => {

        const finder = Pathfinder(
            {
                width: 10,
                height: 10,
                getTileType: () => 'default'
            },
            () => ([])
        );

        expect(
            finder.calculatePath({ x: 0, y: 0 }, { x: 1, y: 0 }).promise
        ).rejects.toBeDefined();
    });

    it.each<[
        string,
        {
            map: number[][],
            charPos?: Position[],
            startEnd: [ Position, Position ],
            path: Position[]
        }
    ]>([
        [
            'no obstacles',
            {
                map: [
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ]
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
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ]
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
                    [ 0, 1, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ]
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
                    [ 0, 1, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 0, 0, 0 ],
                    [ 0, 0, 1, 0, 0 ]
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

        const width = map[ 0 ].length;
        const height = map.length;

        const getTileType = ({ x, y }: Position): TileType => map[ y ][ x ] ? 'obstacle' : 'default';

        const finder = Pathfinder(
            {
                width,
                height,
                getTileType
            },
            () => charPos
        );

        finder.refreshGrid();

        await expect(finder.calculatePath(...startEnd).promise)
            .resolves
            .toEqual<Position[]>(path);
    });
});
