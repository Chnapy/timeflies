import { logger } from '@timeflies/devtools';
import { authEndpoint, AuthRequestBody, authRequestBodySchema, AuthResponseBody } from '@timeflies/socket-messages';
import { CharacterAnimatedImageProps } from '@timeflies/sprite-image';
import { SpritesheetsUtils } from '@timeflies/static-assets';
import React from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { routes } from '../../routes';
import { CredentialsLoginAction } from '../store/credentials-actions';

const authUrl = new URL(
    authEndpoint,
    process.env.REACT_APP_SERVER_URL    // TODO use getEnv() like in backend
).href;

const playerNameInputName = 'playerName';

export const useLoginFormState = () => {
    const [ errors, setErrorsRaw ] = React.useState<string[]>([]);
    const [ loading, setLoading ] = React.useState(false);
    const [ writing, setWriting ] = React.useState(false);
    const [ characterIgnoreErrors, setCharacterIgnoreErrors ] = React.useState(false);
    const history = useHistory();
    const dispatch = useDispatch();

    const setErrors: typeof setErrorsRaw = errors => {
        setErrorsRaw(errors);
        setCharacterIgnoreErrors(false);
    };

    const onFormSubmit: React.FormEventHandler<HTMLFormElement> = React.useCallback(async (e) => {
        e.preventDefault();

        if (loading) {
            return;
        }

        const formData = new FormData(e.currentTarget);

        const authRequestBody: AuthRequestBody = {
            playerName: formData.get(playerNameInputName)!.toString()
        };

        const validateResult = authRequestBodySchema.validate(authRequestBody);

        setErrors(validateResult.error
            ? [ validateResult.error.message ]
            : []);

        if (validateResult.error) {
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(authRequestBody),
            });
            const responseData: AuthResponseBody = await response.json();

            setLoading(false);

            if (!responseData.success) {
                setErrors(responseData.errors);
                return;
            }

            dispatch(CredentialsLoginAction(responseData.playerCredentials));

            history.push(routes.roomListPage);

        } catch (e) {
            logger.error(e);

            setLoading(false);
            setErrors([ 'An unknown error happen...' ]);
        }

    }, [ loading ]);

    const onTextFieldChange: React.ChangeEventHandler<HTMLInputElement> = e => {
        setWriting(true);
    };

    const getCharacterConfigState = (): SpritesheetsUtils.CharacterSpriteState => {
        if (loading) {
            return 'walk';
        }

        if (errors.length && !characterIgnoreErrors) {
            return 'hit';
        }

        if (writing) {
            return 'attack';
        }

        return 'idle';
    };

    const characterConfig: SpritesheetsUtils.CharacterSpriteConfig = {
        role: 'tacka',
        state: getCharacterConfigState(),
        orientation: 'bottom'
    };

    const characterImageProps: Omit<CharacterAnimatedImageProps, 'size' | 'scale'> = {
        animationPath: SpritesheetsUtils.getCharacterAnimationPath(characterConfig),
        framesDurations: SpritesheetsUtils.getCharacterFramesDurations(characterConfig),
        framesOrder: SpritesheetsUtils.getCharacterFramesOrder(characterConfig),
        pingPong: characterConfig.state === 'idle',
        onLoop: () => {
            if (characterConfig.state === 'hit') {
                setCharacterIgnoreErrors(true);
            } else if (characterConfig.state === 'attack') {
                setWriting(false);
            }
        }
    };

    return {
        errors,
        loading,
        onFormSubmit,
        onTextFieldChange,
        playerNameInputName,
        characterImageProps
    };
};
