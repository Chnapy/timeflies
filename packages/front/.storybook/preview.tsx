import { addDecorator } from '@storybook/react';
// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/sokoban.png';
import { FakeBattleApi } from './fake-battle-api';

export interface StoryProps {
    fakeBattleApi: ReturnType<typeof FakeBattleApi>;
    // fakeApiStart: (container: Element) => Promise<FakeApiRunner>;
}

addDecorator((storyFn, context) => {

    const fakeBattleApi = FakeBattleApi();

    // const { start } = fakeApi.init({});

    const props: StoryProps = {
        fakeBattleApi,
        // fakeApiStart: start
    };

    return storyFn({
        ...context,
        ...props
    });
})
