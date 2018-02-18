
const fse          = require('fs-extra'),
      logBox       = require('log-box'),
      parseArgs    = require('minimist'),
      { execSync } = require('child_process');

const args         = parseArgs(process.argv.slice(2), {
  alias: {
    w: 'watch'
  }
});

const appTitle     = process.env.npm_package_productName || process.env.npm_package_name,
      appVersion   = process.env.npm_package_version,
      pathBuild    = process.env.npm_package_config_pathBuild || 'app/build';

const verb         = args.watch ? 'Watching' : 'Building';

const getCmd = () => {
  if (args.watch) {
    return `webpack-dev-server --hot --inline --open`;
  } else {
    return `webpack`;
  }
};


logBox(`${verb} '${appTitle}' v${appVersion}`);

fse.removeSync(`${pathBuild}`);

execSync(getCmd(), { stdio: 'inherit' });
