import { timerTester } from '@timeflies/devtools';
import { AuthRequestBody, AuthResponseBody } from '@timeflies/socket-messages';
import { SocketError } from '@timeflies/socket-server';
import { Request } from 'express';
import { PlayerCredentialsTimed } from '../../main/global-entities';
import { createFakeGlobalEntitiesNoService, createFakeSocketCell } from '../service-test-utils';
import { AuthService } from './auth-service';

describe('auth service', () => {

    const getEntities = () => {
        const globalEntities = createFakeGlobalEntitiesNoService();
        const service = new AuthService(globalEntities);
        return { service, globalEntities };
    };

    describe('on http route', () => {

        it('answers with error if wrong request body', () => {
            const { service } = getEntities();

            const response = {
                status: jest.fn(() => response),
                json: jest.fn(() => response)
            } as any;

            service.httpAuthRoute(
                { body: { toto: '' } } as Request<never>,
                response,
                jest.fn()
            );

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith<[ AuthResponseBody ]>({
                success: false,
                errors: expect.arrayContaining([ expect.any(String) ])
            });
        });

        it('answers with error if player name already taken', () => {
            const { service, globalEntities } = getEntities();

            const response = {
                status: jest.fn(() => response),
                json: jest.fn(() => response)
            } as any;

            globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ] = {
                playerId: 'p1',
                playerName: 'player',
                token: '',
                lastConnectedTime: timerTester.now(),
                isOnline: true
            };

            service.httpAuthRoute(
                { body: { playerName: 'player' } } as Request<never, any, AuthRequestBody>,
                response,
                jest.fn()
            );

            expect(response.status).toHaveBeenCalledWith(400);
            expect(response.json).toHaveBeenCalledWith<[ AuthResponseBody ]>({
                success: false,
                errors: expect.arrayContaining([ expect.any(String) ]),
            });
        });

        it('answers with player credentials', () => {
            const { service } = getEntities();

            const response = {
                status: jest.fn(() => response),
                json: jest.fn(() => response)
            } as any;

            service.httpAuthRoute(
                { body: { playerName: 'player' } } as Request<never, any, AuthRequestBody>,
                response,
                jest.fn()
            );

            expect(response.status).toHaveBeenCalledWith(200);
            expect(response.json).toHaveBeenCalledWith<[ AuthResponseBody ]>({
                success: true,
                playerCredentials: {
                    playerId: expect.any(String),
                    playerName: 'player',
                    token: expect.any(String)
                }
            });
        });

        it('add player credentials to global map', () => {
            const { service, globalEntities } = getEntities();

            const response = {
                status: jest.fn(() => response),
                json: jest.fn(() => response)
            } as any;

            service.httpAuthRoute(
                { body: { playerName: 'player' } } as Request<never, any, AuthRequestBody>,
                response,
                jest.fn()
            );

            const credentials = globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ];

            expect(credentials).toEqual<PlayerCredentialsTimed>({
                playerId: expect.any(String),
                playerName: 'player',
                token: expect.any(String),
                lastConnectedTime: timerTester.now(),
                isOnline: false
            });
            expect(globalEntities.playerCredentialsMap.mapById[ credentials.playerId ]).toBe(credentials);
            expect(globalEntities.playerCredentialsMap.mapByToken[ credentials.token ]).toBe(credentials);
        });

        it('replace previous credentials if expired', () => {
            const { service, globalEntities } = getEntities();

            const response = {
                status: jest.fn(() => response),
                json: jest.fn(() => response)
            } as any;

            const previousCredentials: PlayerCredentialsTimed = {
                playerId: 'p1',
                playerName: 'player',
                token: '',
                lastConnectedTime: -1,
                isOnline: false
            };

            globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ] = previousCredentials;

            service.httpAuthRoute(
                { body: { playerName: 'player' } } as Request<never, any, AuthRequestBody>,
                response,
                jest.fn()
            );

            expect(globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ]).not.toEqual(previousCredentials);
        });
    });

    describe('on socket first connect', () => {

        it('throw error if wrong params format', () => {
            const { service } = getEntities();

            const socketCell = createFakeSocketCell();

            expect(() =>
                service.onSocketFirstConnect(socketCell, { url: 'http://foo.com?toto=0' })
            ).toThrowError(SocketError);
        });

        it('throw error if wrong token', () => {
            const { service } = getEntities();

            const socketCell = createFakeSocketCell();

            expect(() =>
                service.onSocketFirstConnect(socketCell, { url: 'http://foo.com?token=foo' })
            ).toThrowError(SocketError);
        });

        it('throw error if expired credentials', () => {
            const { service, globalEntities } = getEntities();

            globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ] = {
                playerId: 'p1',
                playerName: 'player',
                token: 'token',
                lastConnectedTime: -1,
                isOnline: false
            };
            globalEntities.playerCredentialsMap.mapByToken[ 'token' ] = globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ];
            globalEntities.playerCredentialsMap.mapById[ 'p1' ] = globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ];

            const socketCell = createFakeSocketCell();

            expect(() =>
                service.onSocketFirstConnect(socketCell, { url: 'http://foo.com?token=token' })
            ).toThrowError(SocketError);
        });

        it('change credentials timed data on disconnect', async () => {
            const { service, globalEntities } = getEntities();

            const credentials: PlayerCredentialsTimed = {
                playerId: 'p1',
                playerName: 'player',
                token: 'token',
                lastConnectedTime: timerTester.now(),
                isOnline: false
            };

            globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ] = credentials;
            globalEntities.playerCredentialsMap.mapByToken[ 'token' ] = credentials;
            globalEntities.playerCredentialsMap.mapById[ 'p1' ] = credentials;

            const socketCell = createFakeSocketCell();

            service.onSocketFirstConnect(socketCell, { url: 'http://foo.com?token=token' });
            expect(credentials.isOnline).toEqual(true);

            await timerTester.advance(1000);

            socketCell.getDisconnectListener()!();
            expect(credentials.isOnline).toEqual(false);
            expect(credentials.lastConnectedTime).toEqual(timerTester.now());
        });

        it('returns player id', () => {
            const { service, globalEntities } = getEntities();

            globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ] = {
                playerId: 'p1',
                playerName: 'player',
                token: 'token',
                lastConnectedTime: timerTester.now(),
                isOnline: false
            };
            globalEntities.playerCredentialsMap.mapByToken[ 'token' ] = globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ];
            globalEntities.playerCredentialsMap.mapById[ 'p1' ] = globalEntities.playerCredentialsMap.mapByPlayerName[ 'player' ];

            const socketCell = createFakeSocketCell();

            expect(
                service.onSocketFirstConnect(socketCell, { url: 'http://foo.com?token=token' })
            ).toEqual('p1');
        });
    });
});
