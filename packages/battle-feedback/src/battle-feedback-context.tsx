import React from 'react';

type BattleFeedbackContext = {
    previewEnabled: boolean;
};

const battleFeedbackContext = React.createContext<BattleFeedbackContext>({
    previewEnabled: false
});

export const BattleFeedbackContextProvider = battleFeedbackContext.Provider;

export const useBattleFeedbackContext = () => React.useContext(battleFeedbackContext);
