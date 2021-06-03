import { applySetupTests } from '@timeflies/devtools';

applySetupTests();

process.env.PORT = '1234';
process.env.HOST_URL = 'foo';
process.env.JWT_PRIVATE_KEY = 'foo';
