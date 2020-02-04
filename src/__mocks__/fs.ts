
const fs: any = jest.genMockFromModule('fs');

let mockFiles: Record<string, string> = {};

function __setMockFiles(data: Record<string, string>) {
    mockFiles = { ...data };
}

function readFileSync(key: string) {
    if (!mockFiles[key]) throw new Error('key not handled ' + key);
    return mockFiles[key];
}

fs.__setMockFiles = __setMockFiles;
fs.readFileSync = readFileSync;

module.exports = fs;