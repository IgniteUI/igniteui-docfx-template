var fs = require('fs');
var path = require('path');
var slash = require('slash');
var { spawn } = require('child_process');
var del = require('del');
var preconfigs = require('./preconfig.json');
/**
 * This is the build process of a docfx instance 
 */

let getPath = p => {
    return slash(path.isAbsolute(p) ? p : path.join(process.cwd(), p));
}

let getEnvironmentVariables = conigPath => {
    return fs.existsSync(conigPath) ? JSON.parse(fs.readFileSync(conigPath)) : {};
}


exports.buildDocfx = (options = {
    projectDir: '',
    environment: '',
    siteDir: ''
}) => {

    if (!options.projectDir) {
        throw new Error("The directory of the docfx project must be specified.");
    }

    const globalPreconfigs = preconfigs;
    let docfxJsonPath = path.normalize(path.join(getPath(options.projectDir), 'docfx.json'));
    let docfxPreconfigPath = path.normalize(path.join(getPath(options.projectDir), 'environment.json'));
    let environmentConfigs = getEnvironmentVariables(docfxPreconfigPath);
    environmentConfigs.environment = options.environment || 'development';

    globalPreconfigs['variables'] = environmentConfigs[environmentConfigs.environment];

    if (fs.existsSync(getPath(options.siteDir))) {
        del.sync(getPath(options.siteDir));
    }

    fs.mkdirSync(`${getPath(options.siteDir)}`);

    fs.writeFileSync(
        getPath(`${options.siteDir}/${globalPreconfigs._configFileName}`),
        JSON.stringify(globalPreconfigs)
    );

    console.log(`Starting docfx build for: ${getPath(options.projectDir)}`);
    console.log();

    return spawn("docfx", ["build", `${path.normalize(getPath(docfxJsonPath))}`], { stdio: 'inherit' }).on('close', (err) => {
        if (err) {
            console.error(err);
        }
    });
}