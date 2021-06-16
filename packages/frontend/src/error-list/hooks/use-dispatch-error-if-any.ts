import { Message, SocketErrorMessage } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { ErrorListAddAction } from '../store/error-list-actions';


export const useDispatchMessageErrorIfAny = () => {
    const dispatch = useDispatch();

    return (message: Message<any>): message is ReturnType<typeof SocketErrorMessage> => {

        if (SocketErrorMessage.match(message)) {
            dispatch(ErrorListAddAction({
                reason: message.payload.reason
            }));
            return true;
        }

        return false;
    };
};
