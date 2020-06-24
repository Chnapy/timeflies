import { AnyAction, Dispatch } from '@reduxjs/toolkit';
import { BatchActions } from './batch-middleware';

export type Batch = (action: AnyAction) => void; 

export const createActionBatch = () => {

    let batchActionList: AnyAction[] = [];

    return {
        batch: (action: AnyAction) => {
            batchActionList.push(action);
        },
        dispatchWith: (dispatcher: Dispatch) => {

            const actionList = [ ...batchActionList ];

            batchActionList = [];

            if (actionList.length) {
                if (actionList.length === 1) {
                    return dispatcher(actionList[ 0 ]);
                } else {
                    return dispatcher(BatchActions(actionList));
                }
            }
        }
    }
};
