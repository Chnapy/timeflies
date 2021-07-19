import React from 'react';


export function useCadencedTime<V>(memo: (time: number) => V) {
    const getMemoValue = React.useCallback(
        () => memo(Date.now()),
        [ memo ]
    );
    const [ value, setValue ] = React.useState(getMemoValue);

    const requestRef = React.useRef<number>();

    React.useEffect(() => {
        cancelAnimationFrame(requestRef.current!);

        let enable = true;

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

            requestRef.current = requestAnimationFrame(update);
        };

        requestRef.current = requestAnimationFrame(update);

        return () => {
            enable = false;
            cancelAnimationFrame(requestRef.current!);
        };
    }, [ getMemoValue, value ]);

    return value;
}
