import { addDecorator } from '@storybook/react';
// deploy files for AssetLoader
import '../src/_assets/map/map.png';
import '../src/_assets/spritesheets/sokoban.png';
import { FakeApi, FakeApiRunner } from './fake-api';


export interface StoryProps {
    fakeApi: ReturnType<typeof FakeApi>;
    fakeApiStart: (container: Element) => Promise<FakeApiRunner>;
}

addDecorator((storyFn, context) => {

    const fakeApi = FakeApi();

    const { start } = fakeApi.init({});

    const props: StoryProps = {
        fakeApi,
        fakeApiStart: start
    };

    return storyFn({
        ...context,
        ...props
    });
})

export { };
