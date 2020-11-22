import React from 'react';

export type ContextBridgeProps = {
    contexts: React.Context<any>[];
    barrierRender: (children: React.ReactElement | null) => React.ReactElement | null;
};

export const ContextBridge: React.FC<ContextBridgeProps> = (({ barrierRender, contexts, children }) => {

    const providers = (values: any[]) => {

        const getValue = (i: number) => values[ values.length - 1 - i ];

        return <>{contexts.reduce((children, Context, i) => (
            <Context.Provider value={getValue(i)}>
                {children}
            </Context.Provider>
        ), children)}</>;
    };

    const consumers = contexts.reduce((getChildren, Context) => (
        (values: any[]) => <Context.Consumer>
            {value => getChildren([ ...values, value ])}
        </Context.Consumer>
    ), (values: any[]) => barrierRender(providers(values)));

    return consumers([]);
});
