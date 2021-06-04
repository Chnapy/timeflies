import { assetUrl } from './asset-url';

describe('asset url', () => {

    it('to backend', () => {
        expect(assetUrl.toBackend('foo/bar')).toEqual('static/foo/bar');
        expect(assetUrl.toBackend('/foo/bar')).toEqual('static/foo/bar');
    });

    it('to frontend', () => {
        expect(assetUrl.toFrontend('foo/bar')).toEqual('https://host.com/static/foo/bar');
        expect(assetUrl.toFrontend('/foo/bar')).toEqual('https://host.com/static/foo/bar');
    });
});
