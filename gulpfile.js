var fs = require("fs");
var gulp = require("gulp");
var path = require("path");
var del = require('del');

const TEMPLATE_DIST = "/dist/template";
const WEBPACK_BUILD_DIST = `${TEMPLATE_DIST}/bundles/`;
const packageStatics = ['package.json', 'README.md', 'index.js', 'preconfig.json'];


const addWatchers = () => {

    gulp.watch(['./template/**/*', './index.js', './preconfig.json', './src/app/**/*', './src/styles/**/*'], 
               gulp.series( buildPackageStatics, createTemplate, generateBundlingGlobalMetadata)
               )
    
    return require('child_process').spawn(
                                        path.normalize('./node_modules/.bin/webpack.cmd'),
                                        ['--config', 'webpack.dev.js', '--watch'],
                                        { stdio: 'inherit' }
                                        );
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

const webpackBuild = () => {
    return require('child_process').
        spawn(
            path.normalize('./node_modules/.bin/webpack.cmd'),
            ['--config', 'webpack.prod.js'],
            { stdio: 'inherit' }
        );
}

exports.generateBundlingGlobalMetadata = generateBundlingGlobalMetadata;
exports.webpackBuild = webpackBuild;
exports.createTemplate = createTemplate;
exports.build = gulp.series(cleanup, buildPackageStatics, createTemplate, webpackBuild, generateBundlingGlobalMetadata);
exports['build-watch'] = gulp.series(cleanup, addWatchers);