const shelljs = require('shelljs');
const { version } = require('../package.json');

const name = `muse-${version}.vsix`;

shelljs.exec(`vsce package -o ${name} && code --install-extension ${name}`);
