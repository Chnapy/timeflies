import { ImageLoadStrategy } from 'resource-loader';
import { seedTiledMapAssetsWithImg } from '../stages/battle/map/TiledMap.seed';
import { AppLoader, createAssetLoader } from './AssetLoader';


/**
 * TODO fix jest file serving: https://github.com/englercj/resource-loader/issues/149
 */
describe('# AssetLoader', () => {

    const generateAssetLoader = (loader: Partial<AppLoader> = {}) => createAssetLoader({
        getLoader: () => ({
            add() { return this as any; },
            use() { return this as any; },
            resources: {},
            load(cb) {
                cb && cb(this as any, {})
                return this as any;
            },
            reset() { return this as any; },
            ...loader
        })
    });

    it('should correctly load a tilemap', async () => {
        const resources = {};

        const addFn = jest.fn(props => {
            resources[ props.name ] = true;
            return null as any;
        });

        let mapMiddleware;

        const useFn = jest.fn((middleware) => {
            mapMiddleware = middleware;
            return null as any;
        });

        const assets = seedTiledMapAssetsWithImg('map_1');

        const loaderProps = {
            resources,
            add: addFn,
            use: useFn,

            load: jest.fn(cb => {

                mapMiddleware.bind(loaderProps)({
                    name: 'map',
                    url: 'http://placeholder.com/map.json',
                    data: assets.schema
                }, () => { });

                cb && cb(null as any, {
                    map: {
                        data: assets.schema
                    } as any,
                    'map:map': {
                        url: 'http://placeholder.com/map.png',
                        data: document.createElement('img')
                    } as any
                });

                return null as any;
            })
        };

        const loader = generateAssetLoader(loaderProps);

        const { map } = await loader.newInstance()
            .add('map', 'schema.json')
            .load();

        expect(addFn).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'map:map',
                url: 'http://placeholder.com/map.png',
                strategy: ImageLoadStrategy
            })
        );

        expect(map.schema).toHaveProperty('tilesets');

        expect(map.images).toMatchObject({
            map: 'http://placeholder.com/map.png'
        });
    });

    it.todo('should correctly load a spritesheet');

    it('should correctly load multiple resources in the same time', async () => {
        const resources = {};

        const addFn = jest.fn(props => {
            resources[ props.name ] = true;
            return null as any;
        });

        const loaderProps = {
            resources,
            add: addFn,

            load: jest.fn(cb => {

                cb && cb(null as any, {
                });

                return null as any;
            })
        };

        const loader = generateAssetLoader(loaderProps);

        await loader.newInstance()
            .addMultiple({
                sampleImage: 'image.png',
                sampleJSON: 'schema.json'
            })
            .load();

        expect(addFn).toHaveBeenCalledWith({ name: 'sampleImage', url: 'image.png' });
        expect(addFn).toHaveBeenCalledWith({ name: 'sampleJSON', url: 'schema.json' });
    });

    it('should fail if one of multiple resources loading failed', async () => {
        const loader = generateAssetLoader({
            load(cb) {
                cb && cb(null as any, {
                    sampleImage: {
                        error: new Error()
                    } as any
                });
                return null as any;
            }
        });

        await expect(
            loader.newInstance()
                .add('sampleImage', 'error')
                .load()
        ).rejects.toBeDefined();
    });

    it('should just return requested asset if already loaded', async () => {

        const resources = {};

        const addFn = jest.fn(props => {
            resources[ props.name ] = true;
            return null as any;
        });

        const loader = generateAssetLoader({
            resources,
            add: addFn,
            load: jest.fn(cb => {
                cb && cb(null as any, {
                    sampleJSON: {
                        data: ''
                    } as any
                });
                return null as any;
            })
        });

        await loader.newInstance()
            .add('sampleJSON', 'schema.json')
            .load();

        await loader.newInstance()
            .add('sampleJSON', 'schema.json')
            .load();

        expect(addFn).toHaveBeenCalledTimes(1);
    });
});
