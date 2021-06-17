import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { MessageWithResponseGetter, SocketErrorMessage } from '@timeflies/socket-messages';
import { useDispatchMessageErrorIfAny } from '../../error-list/hooks/use-dispatch-error-if-any';

type OnErrorFn = (socketErrorMessage: SocketErrorMessage, dispatchError: () => void) => void;

export const useSocketSendWithResponseError = () => {
    const sendWithResponse = useSocketSendWithResponse();
    const dispatchMessageErrorIfAny = useDispatchMessageErrorIfAny();

    return async <G extends MessageWithResponseGetter<any, any>>(
        messageGetter: G,
        isMounted: () => boolean = () => true,
        onError: OnErrorFn = (message, dispatchError) => dispatchError()
    ): Promise<Required<G>[ "_response" ] | null> => {

        const response = await sendWithResponse(messageGetter);

        if (!isMounted()) {
            return null;
        }

        if (SocketErrorMessage.match(response!)) {
            const dispatchError = () => dispatchMessageErrorIfAny(response!);
            onError(response, dispatchError);
            return null;
        }

        return response;
    };
};
