import { AssetLoader } from './AssetLoader';


/**
 * TODO fix jest file serving: https://github.com/englercj/resource-loader/issues/149
 */
describe('# AssetLoader', () => {

    const generateAssetLoader = () => AssetLoader();

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

        expect(map.images).toHaveProperty('map');
        expect(map.images.map).toHaveProperty('src');

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
