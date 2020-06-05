import { addDecorator, addParameters } from '@storybook/react';
import React from 'react';
import { UIProvider } from '../src/ui/ui-provider';
// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/sokoban.png';

export interface StoryProps {
    // fakeBattleApi: ReturnType<typeof FakeBattleApi>;
}

// addDecorator((storyFn, context) => {

//     // const fakeBattleApi = FakeBattleApi();

//     // const props: StoryProps = {
//     //     fakeBattleApi
//     // };

//     return (

//         <UIProvider>

//             {storyFn({
//                 ...context,
//             })}

//         </UIProvider>
//     );
// });

addParameters({
    options: {
        storySort: (a, b) =>
            a[ 1 ].kind === b[ 1 ].kind ? 0 : a[ 1 ].id.localeCompare(b[ 1 ].id, { numeric: true }),
    },
});
