import requestRaw from 'supertest';
import { expressApp } from '../../express-app';
import { Auth, playerNameConstraints } from './auth';
import { AuthResponseBody, AuthServerAction, ErrorServerAction, PlayerCredentials } from '@timeflies/shared';
import { seedWebSocket } from '../../transport/ws/WSSocket.seed';

const supertest = (
    fn: (request: typeof requestRaw) => requestRaw.Test,
    endCallback: requestRaw.CallbackHandler = () => { }
) => {
    return new Promise((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        fn(requestRaw)
            .end((err, res) => {
                if (err && res.error) {
                    console.error(res.error);
                }
                if (err) {
                    reject(err);
                } else {
                    endCallback(err, res);
                    resolve();
                }
            });
    });
};

describe('# auth', () => {

    const initHttpApp = (...authArgs: Parameters<typeof Auth>) => {

        const app = expressApp();

        const auth = Auth(...authArgs);

        app.post('/auth', auth.route());

        return { app, auth };
    };

    describe('on http auth with player name', () => {

        describe('should fail if player name', () => {

            it('not defined', async () => {

                const { app } = initHttpApp();

                await supertest(request => request(app)
                    .post('/auth')
                    .expect(400));
            });

            it('length under ' + playerNameConstraints.length.min, async () => {

                const { app } = initHttpApp();

                await supertest(request => request(app)
                    .post('/auth')
                    .send({ playerName: 'ch' })
                    .expect(400));
            });

            it('length over ' + playerNameConstraints.length.max, async () => {

                const { app } = initHttpApp();

                await supertest(request => request(app)
                    .post('/auth')
                    .send({ playerName: 'chnapy-chnapy' })
                    .expect(400));
            });

            it('already exist, with correct error type', async () => {

                const { app } = initHttpApp({
                    initialPlayerCredList: [ {
                        id: '',
                        name: 'chnapy',
                        token: ''
                    } ]
                });

                await supertest(request => request(app)
                    .post('/auth')
                    .send({ playerName: 'chnapy' })
                    .set('Accept', 'application/json')
                    .expect('Content-Type', /json/)
                    .expect(400),
                    (err, { body }) => {
                        expect(body).toEqual<AuthResponseBody>({
                            success: false,
                            error: 'player-name-exist'
                        });
                    }
                );
            });
        });

        it('should succeed sending generated token', async () => {

            const { app } = initHttpApp();

            const jwtRegex = /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.[A-Za-z0-9-_.+/=]*$/;

            await supertest(request => request(app)
                .post('/auth')
                .send({ playerName: 'chnapy' })
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(200),
                (err, { body }) => {
                    expect(body).toEqual<AuthResponseBody>({
                        success: true,
                        token: expect.any(String)
                    });
                    expect(body.token).toMatch(jwtRegex);
                }
            );
        });
    });

    describe('on websocket connection with token', () => {

        describe('should fail if', () => {

            const expectBadToken = (url: string) => {
                const auth = Auth();

                const { ws, sendList } = seedWebSocket();

                ws.url = url;
                ws.close = jest.fn();

                auth.onClientSocket(ws);

                expect(sendList).toContainEqual<ErrorServerAction>({
                    type: 'error',
                    sendTime: expect.anything(),
                    code: 401
                });
                expect(ws.close).toHaveBeenCalledTimes(1);
            };

            it('token not defined', () => {
                expectBadToken('https://toto.com');
            });

            it('token is invalid', () => {
                expectBadToken('https://toto.com/?token=abc.toto.tutu');
            });
        });

        it('should succeed sending player credentials', () => {
            const initialCredentials: PlayerCredentials = {
                id: 'id',
                name: 'chnapy',
                token: 'abc.toto.tutu'
            };

            const auth = Auth({
                initialPlayerCredList: [ initialCredentials ]
            });

            const { ws, sendList } = seedWebSocket();

            ws.url = 'https://toto.com/?token=abc.toto.tutu';
            ws.close = jest.fn();

            auth.onClientSocket(ws);

            expect(sendList).toContainEqual<AuthServerAction.Credentials>({
                type: 'auth/credentials',
                sendTime: expect.anything(),
                credentials: initialCredentials
            });
            expect(ws.close).not.toHaveBeenCalled();
        });
    });

    it('should auth with player name, then connect to websocket with token', async () => {

        const { app, auth } = initHttpApp();

        await supertest(request => request(app)
            .post('/auth')
            .send({ playerName: 'chnapy' })
            .set('Accept', 'application/json'),
            (err, { body }) => {

                const { token } = body;

                const { ws, sendList } = seedWebSocket();

                ws.url = 'https://toto.com/?token=' + token;
                ws.close = jest.fn();

                auth.onClientSocket(ws);

                expect(sendList).toContainEqual<AuthServerAction.Credentials>({
                    type: 'auth/credentials',
                    sendTime: expect.anything(),
                    credentials: {
                        id: expect.any(String),
                        name: 'chnapy',
                        token
                    }
                });
                expect(ws.close).not.toHaveBeenCalled();
            }
        )

    });
});
