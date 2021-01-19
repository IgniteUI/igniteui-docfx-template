var fs = require('fs');
var path = require('path');
var slash = require('slash');
var { spawn } = require('child_process');
var del = require('del');

var environmentVariablesPreConfig = require('./preconfig.json');

const getPath = p => {
    return slash(path.isAbsolute(p) ? p : path.join(process.cwd(), p));
}

const supportedLanguages = Object.freeze({
    en: 'en',
    jp: 'jp',
    kr: 'kr'
});

exports.buildDocfx = (options = {
    language: 'en',
    environment: '',
    docfxSite: '',
    docfxJson: '',
}) => {


    const environmentConfig = JSON.parse(JSON.stringify(environmentVariablesPreConfig));
    if (!(options.language in supportedLanguages)) {
        throw new Error(`${language} is not supported`);
    }

    if (fs.existsSync(getPath(options.docfxSite))) {
        del.sync(getPath(options.docfxSite));
    }
    environmentConfig.environment = options.environment || 'development';

    environmentConfig.variables =
        environmentConfig.variables[options.language.trim()][environmentConfig.environment];

    fs.mkdirSync(`${getPath(options.docfxSite)}`);

    fs.writeFileSync(
        getPath(`${options.docfxSite}/${environmentConfig._configFileName}`),
        JSON.stringify(environmentConfig)
    );

    console.log(`Starting docfx for: ${getPath(options.docfxJson)}`);
    console.log()
    return spawn("docfx", ["build", `${path.normalize(getPath(options.docfxJson))}`], { stdio: 'inherit' }).on('close', (err) => {
        if (err) {
            console.error(err);
        }
    });
}