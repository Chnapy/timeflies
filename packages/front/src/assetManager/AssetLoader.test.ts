import { TiledMap } from '@timeflies/shared';
import { AbstractLoadStrategy, IAddOptions, ResourceType } from 'resource-loader';
import { AssetLoader } from './AssetLoader';

class MockLoadStrategy extends AbstractLoadStrategy<IAddOptions> {
    load(): void {

        const { name, url } = this.config;

        if (url === 'error') {
            throw new Error('error')
        }

        const ext = url.substr(url.lastIndexOf('.') + 1);

        const getLoadedObject = (): { type: ResourceType, value: any } => {


            switch (ext) {
                case 'json':

                    if (name === 'map') {
                        const value: Partial<TiledMap> = {
                            tilesets: [
                                {
                                    name: 'map_1',
                                    image: 'url_1.png'
                                } as any,
                                {
                                    name: 'map_2',
                                    image: 'url_2.png'
                                } as any
                            ]
                        };
                        return {
                            type: ResourceType.Json,
                            value
                        };
                    }

                    return {
                        type: ResourceType.Json,
                        value: JSON.parse('{"version": 4}')
                    };

                case 'png':
                    const img = document.createElement('img');
                    img.src = 'test';
                    return {
                        type: ResourceType.Image,
                        value: img
                    };
            }
            return { type: ResourceType.Unknown, value: null };
        };

        const { type, value } = getLoadedObject();

        this.onComplete.dispatch(type, value);
    }
    abort(): void {
        throw new Error('Method not implemented.');
    }
}

/**
 * TODO fix jest file serving: https://github.com/englercj/resource-loader/issues/149
 */
describe('# AssetLoader', () => {

    const generateAssetLoader = () => AssetLoader({ loadStrategy: MockLoadStrategy });

    it('should correctly load an image', async () => {
        const loader = generateAssetLoader();

        const { sampleImage } = await loader.newInstance()
            .add('sampleImage', 'image.png')
            .load();

        expect(sampleImage).toHaveProperty('src');
    });

    it('should correctly load a json', async () => {
        const loader = generateAssetLoader();

        const { sampleJSON } = await loader.newInstance()
            .add('sampleJSON', 'schema.json')
            .load();

        expect(sampleJSON).toEqual({ version: 4 });
    });

    it('should correctly load a tilemap', async () => {
        const loader = generateAssetLoader();

        const { map } = await loader.newInstance()
            .add('map', 'schema.json')
            .load();

        expect(map.schema).toHaveProperty('tilesets');

        expect(map.images).toHaveProperty('map_1');
        expect(map.images.map_1).toHaveProperty('src');

        expect(map.images).toHaveProperty('map_2');
        expect(map.images.map_2).toHaveProperty('src');
    });

    it.todo('should correctly load a spritesheet');

    it('should correctly load multiple resources in the same time', async () => {
        const loader = generateAssetLoader();

        const { sampleJSON, sampleImage } = await loader.newInstance()
            .addMultiple({
                sampleImage: 'image.png',
                sampleJSON: 'schema.json'
            })
            .load();

        expect(sampleImage).toHaveProperty('src');
        expect(sampleJSON).toEqual({ version: 4 });
    });

    it('should failed if one of multiple resources loading failed', async () => {
        const loader = generateAssetLoader();

        await expect(
            loader.newInstance()
                .add('sampleImage', 'error')
                .load()
        ).rejects.toBeDefined();
    });

    it('should just return requested asset if already loaded', async () => {
        const loader = generateAssetLoader();

        const { sampleJSON } = await loader.newInstance()
            .add('sampleJSON', 'schema.json')
            .load();

        const { sampleJSON: sampleJSON2 } = await loader.newInstance()
            .add('sampleJSON', 'schema.json')
            .load();

        expect(sampleJSON2).toHaveProperty('version');
        expect(sampleJSON2).toBe(sampleJSON);
    });
});
