import { useSocketSendWithResponse } from '@timeflies/socket-client';
import { MessageWithResponseGetter, RoomStateData, SocketErrorMessage } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { ErrorListAddAction } from '../../error-list/store/error-list-actions';
import { RoomSetAction } from '../store/room-actions';

export const useSendRoomUpdate = () => {
    const sendWithResponse = useSocketSendWithResponse();
    const dispatch = useDispatch();

    return async <M extends MessageWithResponseGetter<any, RoomStateData>>(message: M, isMounted: () => boolean = () => true) => {
        const response = await sendWithResponse(message);

        if (!isMounted()) {
            return;
        }

        if (SocketErrorMessage.match(response!)) {
            dispatch(ErrorListAddAction({ code: response.payload.code }));
            return;
        }

        dispatch(RoomSetAction(response!.payload));
    };
};
