var fs = require("fs");

var gulp = require("gulp");
var path = require("path");

const TEMPLATE_DIST = "/dist/template";
const WEBPACK_BUILD_DIST = `${TEMPLATE_DIST}/bundles/`;
const packageStatics = ['package.json', 'README.md', 'index.js', 'preconfig.json'];

exports.generateBundlingGlobalMetadata = (done) => {
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


const addWatcher = (done) => {

    gulp.watch(['./template/**/*', 'src/styles/**/*', './index.js', './preconfig.json', './ts-source'], this.build)
    done();
}

const buildPackageStatics = () => {
    return gulp.src(packageStatics).pipe(gulp.dest("dist"));
}

const createTemplate = () => {
    return gulp.src(['./src/**/*',
                     './template/**/*',
                     '!./src/modules',
                     '!./src/assets/images/**/*',
                     '!./src/**/*.js']).pipe(gulp.dest("dist/template"));
}
exports.createTemplate = createTemplate;

exports.wbBuild = () => {
    return require('child_process').spawn(path.normalize('./node_modules/.bin/webpack.cmd'), {stdio: 'inherit'});
}

exports.build = gulp.series(buildPackageStatics, createTemplate);
exports['build-watch'] = gulp.series(this.wbBuild, this.build, addWatcher);