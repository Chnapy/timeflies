import { CircularProgress, Grid, InputAdornment, makeStyles, TextField } from '@material-ui/core';
import { useHotkeysKey } from '@timeflies/app-ui';
import { ArrayUtils } from '@timeflies/common';
import { useSocketListeners } from '@timeflies/socket-client';
import { ChatNotifyMessage, ChatSendMessage } from '@timeflies/socket-messages';
import React from 'react';
import useAsyncEffect from 'use-async-effect';
import { useSocketSendWithResponseError } from '../../connected-socket/hooks/use-socket-send-with-response-error';
import { useLoginSelector } from '../../login-page/hooks/use-login-selector';
import { ChatLine, ChatLineProps } from './chat-line';

type ChatPanelProps = {
    stayFocused?: boolean;
    onlyInputTouchable?: boolean;
};

type StyleProps = Pick<ChatPanelProps, 'onlyInputTouchable'>;

const useStyles = makeStyles(({ spacing }) => ({
    root: ({ onlyInputTouchable }: StyleProps) => ({
        height: '100%',
        pointerEvents: onlyInputTouchable ? 'none' : undefined
    }),
    messageWrapperParent: {
        position: 'relative'
    },
    messageWrapper: ({ onlyInputTouchable }: StyleProps) => ({
        maxHeight: '100%',
        overflow: onlyInputTouchable ? 'hidden' : 'auto',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing(0, 1)
    }),
    textField: {
        "& > .MuiInputBase-root": {
            paddingRight: 0
        },

        '& input': {
            pointerEvents: 'all',
            paddingLeft: spacing(1),
            paddingRight: spacing(1),
            paddingTop: 10,
            paddingBottom: 10
        }
    }
}));

const maxNbrLines = 40;

export const ChatPanel: React.FC<ChatPanelProps> = ({ stayFocused, onlyInputTouchable }) => {
    const classes = useStyles({ onlyInputTouchable });
    const wrapperRef = React.useRef<HTMLDivElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const addLineRef = React.useRef<(chatLine: ChatLineProps) => void>();

    const [ chatLineList, setChatLineList ] = React.useState<ChatLineProps[]>([]);
    const [ sending, setSending ] = React.useState(false);
    const playerName = useLoginSelector(credentials => credentials.playerName);
    const sendWithResponse = useSocketSendWithResponseError();
    const addSocketlisteners = useSocketListeners();

    addLineRef.current = chatLine => {
        const tempList = [
            ...chatLineList,
            chatLine
        ].sort((a, b) => a.time < b.time ? -1 : 1);
        const newList = tempList.slice(Math.max(tempList.length - maxNbrLines, 0));
        setChatLineList(newList);
    };

    useAsyncEffect(() => {
        return addSocketlisteners({
            [ ChatNotifyMessage.action ]: ({ payload }: ReturnType<typeof ChatNotifyMessage>) => {
                addLineRef.current!({
                    time: payload.time,
                    playerName: payload.playerName,
                    message: payload.message
                });
            }
        });
    },
        removeListeners => removeListeners && removeListeners(),
        [ addLineRef ]);


    // scroll to bottom on first render
    React.useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        wrapper.scrollTo({ behavior: 'auto', top: 999999 });

        return () => {
            wrapperRef.current = null;
            inputRef.current = null;
        };
    }, []);

    const lastLineTime = ArrayUtils.last(chatLineList)?.time;

    // scroll to bottom, if near from bottom
    React.useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) {
            return;
        }

        const scrollBottom = wrapper.scrollHeight - wrapper.scrollTop - wrapper.clientHeight;
        if (!onlyInputTouchable && scrollBottom > 100) {
            return;
        }

        wrapper.scrollTo({ behavior: 'smooth', top: 999999 });

    }, [ lastLineTime, onlyInputTouchable ]);

    // focus input
    useHotkeysKey('enter', React.useCallback(() => {
        const input = inputRef.current?.querySelector('input');
        if (!input) {
            return;
        }

        input.focus();

    }, [ inputRef ]), { keyup: true });

    return <Grid className={classes.root} container direction='column' wrap='nowrap'>

        <Grid className={classes.messageWrapperParent} item xs>
            <div ref={wrapperRef} className={classes.messageWrapper}>
                {chatLineList.map(messageProps =>
                    <ChatLine key={messageProps.time} {...messageProps} />
                )}
            </div>
        </Grid>

        <Grid item>
            <TextField
                ref={inputRef}
                className={classes.textField}
                variant='filled'
                fullWidth
                disabled={sending}
                hiddenLabel
                placeholder='press enter to focus'
                InputProps={{
                    endAdornment: sending
                        ? (
                            <InputAdornment position="start">
                                <CircularProgress size={18} color='inherit' />
                            </InputAdornment>
                        )
                        : undefined,
                }}
                onKeyUp={async e => {
                    const input = e.currentTarget.querySelector('input') as HTMLInputElement;

                    // unfocus input
                    if (e.key === 'Escape') {
                        input.blur();
                        input.value = '';
                        return;
                    }

                    // send
                    if (e.key === 'Enter') {
                        if (!stayFocused) {
                            input.blur();
                        }

                        const messageGetter = ChatSendMessage({
                            time: Date.now(),
                            message: input.value
                        });
                        const message = messageGetter.get();

                        const result = ChatSendMessage.schema.validate(message);
                        if (result.error) {
                            return;
                        }

                        setSending(true);

                        const response = await sendWithResponse(messageGetter, () => !!inputRef.current);

                        setSending(false);

                        if (response?.payload.success) {
                            input.value = '';
                            addLineRef.current!({
                                time: message.payload.time,
                                message: message.payload.message,
                                playerName
                            });
                        }

                        if (stayFocused) {
                            input.focus();
                        }
                    }
                }}
            />
        </Grid>
    </Grid>;
};
