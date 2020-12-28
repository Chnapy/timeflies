import React from 'react';


export function useCadencedTime<V>(memo: (time: number) => V) {
    const getMemoValue = () => memo(Date.now());
    const [ value, setValue ] = React.useState(getMemoValue);

    React.useEffect(() => {

        let enable = true;
        let request: number;

        // handle time between setValue() and next render
        let tempValue = value;

        const update = () => {
            if (!enable) {
                return;
            }

            const memoNow = getMemoValue();

            if (memoNow !== tempValue) {
                tempValue = memoNow;
                setValue(memoNow);
            }

            request = requestAnimationFrame(update);
        };

        request = requestAnimationFrame(update);

        return () => {
            enable = false;
            cancelAnimationFrame(request);
        };
    }, [  ]);

    return value;
};
