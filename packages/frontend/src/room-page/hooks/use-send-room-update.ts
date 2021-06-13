import { MessageWithResponseGetter, RoomStateData } from '@timeflies/socket-messages';
import { useDispatch } from 'react-redux';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { RoomSetAction } from '../store/room-actions';

export const useSendRoomUpdate = () => {
    const sendWithResponse = useSocketSendWithResponseError();
    const dispatch = useDispatch();

    type SendParams = Parameters<typeof sendWithResponse>;

    return async <M extends MessageWithResponseGetter<any, RoomStateData>>(
        message: M,
        isMounted?: SendParams[ 1 ],
        onError?: SendParams[ 2 ]
    ) => {
        const response = await sendWithResponse(message, isMounted, onError);
        if (!response) {
            return;
        }

        dispatch(RoomSetAction(response!.payload));
    };
};
