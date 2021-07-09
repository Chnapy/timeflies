import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import { createFakeGlobalEntitiesNoService } from './service-test-utils';
import { createServices } from './services';

const lstat = promisify(fs.lstat);
const readdir = promisify(fs.readdir);

describe('all services', () => {

    const getFilesFrom = async (rawPath: string, basepath = ''): Promise<string[]> => {
        const path = join(basepath, rawPath);

        const stat = await lstat(path);

        if (stat.isFile()) {
            return [ path ];
        }

        const content = await readdir(path);

        return (
            await Promise.all(content
                .map(p => getFilesFrom(p, path)))
        ).flatMap(c => c);
    };

    it('contains all services', async () => {
        const servicesPathList = (await getFilesFrom('./src/services'))
            .filter(path => path.endsWith('-service.ts') && !path.endsWith('abstract-service.ts'))
            .map(path => path.replace(/\\/g, '/'))
        // .map(path => ArrayUtils.last(path.split('/')));

        console.log('Services found:', servicesPathList);

        const services = createServices(createFakeGlobalEntitiesNoService());

        expect(Object.keys(services)).toHaveLength(servicesPathList.length);
    });

});
