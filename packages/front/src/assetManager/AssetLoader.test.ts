import { AssetLoader } from './AssetLoader';

/**
 * This test suite needs special test environment because of CORS policy:
 * Local web server using the port 8887 with these files:
 *  - map.json a tiled map
 *  - life_icon.png an image
 * 
 * You can use "web-server-for-chrome".
 * In that case don't forget to enable "set CORS header" in advanced options.
 */
describe('# AssetLoader - note that this test suite needs special test environment', () => {

    it.skip('should correctly load an image', async () => {

        const loader = AssetLoader();

        const { mapImage } = await loader.newInstance()
            .add('mapImage', 'http://localhost:8887/life_icon.png')
            .load();

        expect(mapImage).toHaveProperty('src');
    });

    it('should correctly load a tiled map', async () => {
        const loader = AssetLoader();

        const { mapSchema } = await loader.newInstance()
            .add('mapSchema', 'http://localhost:8887/map.json')
            .load();

        expect(mapSchema).toHaveProperty('layers');
    });

    it.todo('should correctly load a spritesheet');

    it.skip('should correctly load multiple resources in the same time', async () => {

        const loader = AssetLoader();

        const { mapSchema, mapImage } = await loader.newInstance()
            .add('mapImage', 'http://localhost:8887/life_icon.png')
            .add('mapSchema', 'http://localhost:8887/map.json')
            .load();

        expect(mapImage).toHaveProperty('src');
        expect(mapSchema).toHaveProperty('layers');
    });

    it('should failed if one of multiple resources loading failed', async () => {

        const loader = AssetLoader();

        await expect(
            loader.newInstance()
                .add('mapImage', 'http://localhost:8887/fake_url.json')
                .load()
        ).rejects.toBeDefined();
    });

    it('should just return requested asset if already loaded', async () => {
        const loader = AssetLoader();

        const { mapSchema } = await loader.newInstance()
            .add('mapSchema', 'http://localhost:8887/map.json')
            .load();

        const { mapSchema: mapSchema2 } = await loader.newInstance()
            .add('mapSchema', 'http://localhost:8887/map.json')
            .load();

        expect(mapSchema2).toHaveProperty('layers');
        expect(mapSchema2).toBe(mapSchema);
    });
});
