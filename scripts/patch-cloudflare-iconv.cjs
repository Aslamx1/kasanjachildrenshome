const fs = require('node:fs');
const path = require('node:path');

const bodyParserPath = require.resolve('body-parser');
const iconvPackagePath = require.resolve('iconv-lite/package.json', {
  paths: [path.dirname(bodyParserPath)]
});
const iconvPackage = JSON.parse(fs.readFileSync(iconvPackagePath, 'utf8'));

if (iconvPackage.browser && typeof iconvPackage.browser === 'object') {
  let changed = false;

  for (const entry of ['./lib/extend-node', './lib/streams']) {
    if (iconvPackage.browser[entry] === false) {
      delete iconvPackage.browser[entry];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(iconvPackagePath, `${JSON.stringify(iconvPackage, null, 2)}\n`);
  }
}
