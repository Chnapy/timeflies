import React from 'react';


export const usePromise = (promise: Promise<unknown>) => {
    const [ finished, setFinished ] = React.useState(false);

    React.useEffect(() => {
        promise
            .finally(() => setFinished(true))
            .catch(console.error);
    }, [promise]);

    return finished;
};
