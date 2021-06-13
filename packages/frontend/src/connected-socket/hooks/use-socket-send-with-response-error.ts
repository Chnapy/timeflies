import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { MessageWithResponseGetter, SocketErrorMessage } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { ErrorListAddAction } from '../../error-list/store/error-list-actions';

type OnErrorFn = (socketErrorMessage: SocketErrorMessage, dispatchError: () => void) => void;

export const useSocketSendWithResponseError = () => {
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();

    return async <G extends MessageWithResponseGetter<any, any>>(
        messageGetter: G,
        isMounted: () => boolean = () => true,
        onError: OnErrorFn = (message, dispatchError) => dispatchError()
    ): Promise<Required<G>[ "_response" ] | null> => {

        const response = await sendWithResponse(messageGetter);

        if(!isMounted()) {
            return null;
        }

        if (SocketErrorMessage.match(response!)) {
            const dispatchError = () => dispatch(ErrorListAddAction(response.payload));
            onError(response, dispatchError);
            return null;
        }

        return response;
    };
};
