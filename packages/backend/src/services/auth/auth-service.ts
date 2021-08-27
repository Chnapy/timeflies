import { createId, PlayerId } from '@timeflies/common';
import { logger } from '@timeflies/devtools';
import { AuthRequestBody, authRequestBodySchema, AuthResponseBody, PlayerCredentials, SocketQueryParams, socketQueryParamsSchema } from '@timeflies/socket-messages';
import { SocketCell, SocketError } from '@timeflies/socket-server';
import { RequestHandler } from 'express';
import { IncomingMessage } from 'http';
import { JWT } from 'jose';
import { URL, URLSearchParams } from 'url';
import { PlayerCredentialsTimed } from '../../main/global-entities';
import { getEnv } from '../../utils/env';
import { Service } from '../service';

const privateKey = getEnv('JWT_PRIVATE_KEY');

export class AuthService extends Service {
    protected afterSocketConnect = () => { };

    private addPlayerCredentials = (rawPlayerCredentials: PlayerCredentials) => {
        const playerCredentials: PlayerCredentialsTimed = {
            ...rawPlayerCredentials,
            lastConnectedTime: Date.now(),
            isOnline: false
        };

        this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerCredentials.playerId ] = playerCredentials;
        this.globalEntitiesNoServices.playerCredentialsMap.mapByToken[ playerCredentials.token ] = playerCredentials;
        this.globalEntitiesNoServices.playerCredentialsMap.mapByPlayerName[ playerCredentials.playerName ] = playerCredentials;
    };

    private removePlayerCredentials = (playerId: PlayerId) => {
        const credentials = this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerId ];

        delete this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerId ];
        delete this.globalEntitiesNoServices.playerCredentialsMap.mapByToken[ credentials.token ];
        delete this.globalEntitiesNoServices.playerCredentialsMap.mapByPlayerName[ credentials.playerName ];
    };

    httpAuthRoute: RequestHandler<never, AuthResponseBody, AuthRequestBody> = (request, response, next) => {
logger.info('AUTh RECEIVED');
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

        const existingCredentials = this.globalEntitiesNoServices.playerCredentialsMap.mapByPlayerName[ playerName ];
        if (existingCredentials) {
            if (this.isCredentialsValid(existingCredentials)) {
                response
                    .status(400)
                    .json({
                        success: false,
                        errors: [ 'Player name already taken - ' + playerName ]
                    });
                return;
            } else {
                this.removePlayerCredentials(existingCredentials.playerId);
            }
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
            throw new SocketError('internal-error', 'socket url is undefined');
        }

        const token = new URLSearchParams(
            url.startsWith('/?')  // localhost
                ? url.substring(2)
                : new URL(url).search
        ).get('token')!;

        const socketQueryParams: SocketQueryParams = { token };

        const validateResult = socketQueryParamsSchema.validate(socketQueryParams);
        if (validateResult.error) {
            throw new SocketError('bad-request', validateResult.error.message);
        }

        const playerCredentials = this.globalEntitiesNoServices.playerCredentialsMap.mapByToken[ token ];
        if (!playerCredentials) {
            throw new SocketError('token-invalid', 'Player token is invalid');
        }

        this.checkIfCredentialsExpired(playerCredentials.playerId);

        playerCredentials.isOnline = true;
        socketCell.addDisconnectListener(() => {
            playerCredentials.lastConnectedTime = Date.now();
            playerCredentials.isOnline = false;
        });

        logger.info('Socket connected:', playerCredentials.playerId);

        return playerCredentials.playerId;
    };

    checkIfCredentialsExpired = (playerId: PlayerId) => {
        const playerCredentials = this.globalEntitiesNoServices.playerCredentialsMap.mapById[ playerId ];

        if (!this.isCredentialsValid(playerCredentials)) {
            throw new SocketError('token-expired', 'Player credentials expired');
        }
    };

    private isCredentialsValid = ({ lastConnectedTime, isOnline }: PlayerCredentialsTimed) => {
        return isOnline || Date.now() - lastConnectedTime < 10_000;
    };
}
