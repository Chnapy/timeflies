import { TiledMap } from '@timeflies/shared';
import { AbstractLoadStrategy, IAddOptions, ResourceType } from 'resource-loader';
import { seedTiledMap } from '../stages/battle/map/TiledMap.seed';

export class MockLoadStrategy extends AbstractLoadStrategy<IAddOptions> {
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
                        const value: TiledMap = seedTiledMap('map_1');

                        return {
                            type: ResourceType.Json,
                            value
                        };
                    }

                    return {
                        type: ResourceType.Json,
                        value: JSON.parse('{"version": 4}')
                    };

                case 'jpg':
                case 'jpeg':
                case 'png':
                    const img = document.createElement('img');
                    img.src = 'placeholder';
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
