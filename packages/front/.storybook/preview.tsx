import { addParameters } from '@storybook/react';
// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/spritesheet-characters.png';


addParameters({
    options: {
        storySort: (a, b) =>
            a[ 1 ].kind === b[ 1 ].kind ? 0 : a[ 1 ].id.localeCompare(b[ 1 ].id, { numeric: true }),
    },
});
