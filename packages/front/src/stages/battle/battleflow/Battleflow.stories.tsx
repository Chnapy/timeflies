import React from 'react';
import { StoryProps } from '../../../../.storybook/preview';

export default {
    title: 'Battleflow'
};

export const Default: React.FC<StoryProps> = ({ fakeBattleApi: fakeApi }) => {

    const { start } = fakeApi.init({});

    const ref = React.createRef<HTMLDivElement>();

    const fns = {
        stopCycle: () => { },
        rollback: () => { },
        notify: () => { }
    };

    React.useEffect(() => {

        start(ref.current!)
            .then(api => {

                fns.stopCycle = api.stopCycleLoop;

                fns.rollback = api.rollback;

                fns.notify = api.notify;

                api.startCycleLoop();

            });

    }, [ start, fns, ref ]);

    return <div style={{
        position: 'absolute',
        width: '100%',
        height: '100vh'
    }}>
        <div ref={ref} style={{
            position: 'absolute',
            width: '100%',
            height: '100%'
        }} />
        <div style={{
            position: 'absolute',
            bottom: 0,
            right: 0
        }}>

            <button onClick={() => fns.stopCycle()}>stop cycle</button>
            <button onClick={() => fns.rollback()}>rollback</button>
            <button onClick={() => fns.notify()}>notify</button>

        </div>
    </div>;
};
