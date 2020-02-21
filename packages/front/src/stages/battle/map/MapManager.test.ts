import { MapManager } from './MapManager';
import { Position } from '@timeflies/shared';

describe('# MapManager', () => {

    let manager: MapManager;

    beforeEach(() => {
        manager = undefined as any;
    });

    const getManager = ({ refreshGrid, tileToWorld, worldToTile }: {
        refreshGrid?: () => void;
        tileToWorld?: (arg: Position, center?: boolean) => Position;
        worldToTile?: (arg: Position) => Position;
    }): MapManager => MapManager(
        {
            battleData: {
                characters: []
            },
            getGraphics: () => ({
                tilemap: {
                    width: -1,
                    height: -1,
                },
                hasObstacleAt: () => true,
                tileToWorld: tileToWorld ?? (() => ({
                    x: -1,
                    y: -1
                })),
                worldToTile: worldToTile ?? (() => ({
                    x: -1,
                    y: -1
                })),
            }),
            getPathfinder: () => ({
                refreshGrid: refreshGrid ?? (() => { }),
                calculatePath: () => ({ promise: Promise.resolve([]), cancel: () => true })
            })
        }
    );

    it('should call pathfinder#refreshGrid on refreshPathfinder()', () => {

        const refreshGrid = jest.fn();

        manager = getManager({ refreshGrid });

        manager.refreshPathfinder();

        expect(refreshGrid).toHaveBeenCalled();
    });

    it('should call graphic#tileToWorld on tileToWorld()', () => {

        const tileToWorld = jest.fn(() => ({
            x: -1,
            y: -1
        }));

        manager = getManager({ tileToWorld });

        const p: Position = { x: 4, y: 2 };

        manager.tileToWorld(p, true);

        expect(tileToWorld).toHaveBeenCalledWith(p, true);
        expect(tileToWorld).toReturnWith<Position>({
            x: -1,
            y: -1
        });
    });

    it('should call graphic#worldToTile on worldToTile()', () => {

        const worldToTile = jest.fn(() => ({
            x: -2,
            y: -2
        }));

        manager = getManager({ worldToTile });

        const p: Position = { x: 4, y: 2 };

        manager.worldToTile(p);

        expect(worldToTile).toHaveBeenCalledWith(p);
        expect(worldToTile).toReturnWith<Position>({
            x: -2,
            y: -2
        });
    });

});
