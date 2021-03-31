var fs = require("fs");
var gulp = require("gulp");
var path = require("path");
var del = require('del');
const os = require('os');

const TEMPLATE_DIST = "/dist/template";
const WEBPACK_BUILD_DIST = `${TEMPLATE_DIST}/bundles/`;
const packageStatics = ['package.json', 'README.md', 'index.js', 'preconfig.json'];


const addWatchers = () => {

    gulp.watch(['./template/**/*', './index.js', './preconfig.json', './src/app/**/*', './src/styles/**/*'],
        gulp.series(buildPackageStatics, createTemplate, generateBundlingGlobalMetadata)
    )

    return webpackBuild(true);
}

const cleanup = (done) => {
    del.sync(path.resolve(__dirname, "dist"));
    done();
}
const buildPackageStatics = () => {
    return gulp.src(packageStatics).pipe(gulp.dest("dist"));
}

const createTemplate = () => {
    return gulp.src([
        './src/**',
        './template/**/*',
        '!./src/app/**',
        '!./src/styles/**',
        '!./src/assets/images/**',
    ]).pipe(gulp.dest("dist/template"));
}

const generateBundlingGlobalMetadata = (done) => {
    let metadata = {};
    metadata["_timestamp"] = new Date().getTime();
    let outputBuildFiles = fs.readdirSync(path.join(__dirname, WEBPACK_BUILD_DIST));
    ["vendor", "main", "runtime", "styles"].forEach(bundle => {
        let bundleFileName = outputBuildFiles.find((file) => file.startsWith(bundle));
        metadata[`_${bundle}`] = bundleFileName;
    })

    fs.writeFileSync(path.join(__dirname, TEMPLATE_DIST, "bundling.global.json"), JSON.stringify(metadata));

    done();
}

const webpackBuild = (dev = false) => {
    let config, commandArgs = [], watch = "--watch";

    config = dev ? "webpack.dev.js" : 'webpack.prod.js';
    commandArgs.push(config);
    if (dev) {
        commandArgs.push(watch)
    }

    return require('child_process').
        spawn(
            path.normalize(`./node_modules/.bin/webpack${/^win/.test(os.platform()) ? '.cmd' : ''}`),
            ['--config'].concat(commandArgs),
            { stdio: 'inherit' }
        );
}

let buildProd;

exports.generateBundlingGlobalMetadata = generateBundlingGlobalMetadata;
exports.createTemplate = createTemplate;
exports.webpackBuildProd = buildProd = () => webpackBuild();
exports.build = gulp.series(cleanup, buildPackageStatics, createTemplate, this.webpackBuildProd, generateBundlingGlobalMetadata);
exports['build-watch'] = gulp.series(cleanup, addWatchers);