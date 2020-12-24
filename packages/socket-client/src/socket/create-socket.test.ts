import { createSocket } from './create-socket';

describe('# create socket', () => {

    it('connect to correct endpoint', () => {
        const socket = createSocket('http://myendpoint.foo.bar/toto')('my_token');

        expect(socket.url).toEqual('ws://myendpoint.foo.bar/toto?token=my_token');

        socket.close();
    });
});
