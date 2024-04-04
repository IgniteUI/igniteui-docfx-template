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

    generateBundlingGlobalMetadata(null, true);

    return webpackBuild(true);
}

const cleanup = () => {
    return del(path.resolve(__dirname, "dist"));
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

const generateBundlingGlobalMetadata = (done, dev=false) => {
    let metadata = {}, 
        outputBuildFiles = undefined,
        bundlesToObserve = [{name:"vendor", ext: "js"}, 
                            {name:"main", ext: "js"},
                            {name:"lunr-search", ext: "js"},
                            {name:"runtime", ext: "js"},
                            {name:"igniteui", ext: "css"},
                            {name:"slingshot", ext: "css"},
                            {name:"appbuilder", ext: "css"},
                        ] 
    if(!dev) {
        outputBuildFiles = fs.readdirSync(path.join(__dirname, WEBPACK_BUILD_DIST));
    }
    metadata["_timestamp"] = new Date().getTime();
    bundlesToObserve.forEach(bundle => {
        let bundleFileName = outputBuildFiles != null ? outputBuildFiles.find((file) => file.startsWith(bundle.name) && file.endsWith(bundle.ext)) : `${bundle.name}.${bundle.ext}`;
        metadata[`_${bundle.name}`] = bundleFileName;
    });

    fs.writeFileSync(path.join(__dirname, TEMPLATE_DIST, "bundling.global.json"), JSON.stringify(metadata));

    if(done) {
        done();
    }
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
exports['build-watch'] = gulp.series(cleanup, buildPackageStatics, createTemplate, addWatchers);