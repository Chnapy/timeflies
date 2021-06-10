import { createId } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
import { AuthRequestBody, authRequestBodySchema, AuthResponseBody, PlayerCredentials, SocketQueryParams, socketQueryParamsSchema } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { RequestHandler } from 'express';
import { IncomingMessage } from 'http';
import { JWT } from 'jose';
import { URL, URLSearchParams } from 'url';
import { getEnv } from '../../utils/env';
import { Service } from '../service';

const privateKey = getEnv('JWT_PRIVATE_KEY');

export class AuthService extends Service {
    protected afterSocketConnect = () => { };

    private addPlayerCredentials = (playerCredentials: PlayerCredentials) => {
        this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerCredentials.playerId ] = playerCredentials;
        this.globalEntitiesNoServices.playerCredentialsMap.mapByToken[ playerCredentials.token ] = playerCredentials;
        this.globalEntitiesNoServices.playerCredentialsMap.mapByPlayerName[ playerCredentials.playerName ] = playerCredentials;
    };

    httpAuthRoute: RequestHandler<never, AuthResponseBody, AuthRequestBody> = (request, response, next) => {

        const validateResult = authRequestBodySchema.validate(request.body);
        if (validateResult.error) {
            response
                .status(400)
                .json({
                    success: false,
                    errors: validateResult.error.details.map(item => item.message)
                });
            return;
        }

        const { playerName } = validateResult.value as AuthRequestBody;

        if (this.globalEntitiesNoServices.playerCredentialsMap.mapByPlayerName[ playerName ]) {
            response
                .status(400)
                .json({
                    success: false,
                    errors: [ 'Player name already taken - ' + playerName ]
                });
            return;
        }

        const playerId = createId();

        const tokenPayload = {
            playerId,
            playerName
        };

        const token = JWT.sign(tokenPayload, privateKey, { algorithm: 'HS256' });

        const playerCredentials: PlayerCredentials = {
            playerId,
            playerName,
            token
        };

        this.addPlayerCredentials(playerCredentials);

        response
            .status(200)
            .json({
                success: true,
                playerCredentials
            });

        logger.info('Auth succeed:', playerId);
    };

    onSocketFirstConnect = (socketCell: SocketCell, { url }: Pick<IncomingMessage, 'url'>) => {

        // https://toto.com?token=abc
        if (!url) {
            throw new SocketError(500, 'socket url is undefined');
        }

        const token = new URLSearchParams(
            url.startsWith('/?')  // localhost
                ? url.substring(2)
                : new URL(url).search
        ).get('token')!;

        const socketQueryParams: SocketQueryParams = { token };

        const validateResult = socketQueryParamsSchema.validate(socketQueryParams);
        if (validateResult.error) {
            throw new SocketError(401, validateResult.error.message);
        }

        const playerCredentials = this.globalEntitiesNoServices.playerCredentialsMap.mapByToken[ token ];
        if (!playerCredentials) {
            throw new SocketError(401, 'Player token is invalid');
        }

        logger.info('Socket connected:', playerCredentials.playerId);

        return playerCredentials.playerId;
    };
}
