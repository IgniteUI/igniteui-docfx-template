var fs = require("fs");
var cleanCSS = require("gulp-clean-css");
var concat = require("gulp-concat");
var autoprefixer = require('gulp-autoprefixer');
var uglify = require("gulp-uglify-es").default;
var gulp = require("gulp");
var path = require("path");
var sass = require('gulp-dart-sass');
var util = require("gulp-util");
var saveLicense = require("uglify-save-license");
var md5File = require('md5-file')
var argv = require("yargs").argv;

const SRC = "./src";
const DOCFX_STYLES = `${SRC}/styles`;
const TEMPLATE_STATIC = "./template/styles";
const TEMPLATE_DIST = "/dist/template";
const MODULES = `${SRC}/modules`;

const packageStatics = ['package.json', 'README.md', 'index.js', 'preconfig.json'];

const bundles = [
    {
        type: "JS",
        name: "docfx-bundle.min.js",
        files: [
            `${TEMPLATE_STATIC}/docfx.vendor.js`,
            `${MODULES}/jquery-ui-1.12.0.js`,
            `${MODULES}/jquery-localize.js`,
            `${SRC}/docfx.js`
        ],
        checksumMetadataKey: "_docFXBundleChecksum"
    },
    {
        type: "JS",
        name: "scripts-bundle.min.js",
        files: [
            `${SRC}/igviewer.common.js`,
            `${SRC}/igviewer.renderingService.js`,
            `${MODULES}/lz-string.js`,
            `${MODULES}/resize-sensor.js`,
            `${SRC}/nav-init.js`,
            `${SRC}/code-view.js`,
            `${SRC}/live-editing-handler.js`,
            `${MODULES}/lazyload.js`,
            `${MODULES}/lazysizes.js`,
            `${SRC}/lazysizes-handler.js`,
            `${SRC}/theming-handler.js`,
            `${SRC}/sample-iframe-handler.js`
        ],
        checksumMetadataKey: "_scriptsBundleChecksum"
    },
    {
        type: "CSS",
        name: "styles-bundle.min.css",
        files: [
            `${TEMPLATE_STATIC}/docfx.vendor.css`,
            `${TEMPLATE_STATIC}/docfx.css`,
            `${TEMPLATE_STATIC}/css/main.css`
        ],
        checksumMetadataKey: "_stylesBundleFileName"
    }
];

var md5HashMap = {};
  
const styles = () => {
   return gulp.src(path.join(__dirname, `${DOCFX_STYLES}/main.scss`))
            .pipe(sass().on('error', sass.logError))
            .pipe(
                autoprefixer({
                    overrideBrowserslist: ['last 2 versions'],
                    cascase: false
                })
            )
            .pipe(gulp.dest(`${TEMPLATE_STATIC}/css`));
}

// Generating hash per each file in the bundles based on its content.
// It is used to generate a new bundle only if the content of a file is changed.
const generateFileCheckSumMap = (done) => {
    var allFiles = [];
    bundles.forEach(bundle => {
        allFiles = allFiles.concat(bundle.files);
    });

    allFiles.forEach(file => {
        var filePath = path.join(__dirname, file);
        var hash = md5File.sync(filePath);
        md5HashMap[filePath] = hash;
    });
    done();
}

const generateBundlingGlobalMetadata = (done) => {
    var metadata = {};
    // for general cache invalidation purposes
    metadata["_timestamp"] = new Date().getTime();
    bundles.forEach(bundle => {
        var filePath = path.join(__dirname, `${TEMPLATE_DIST}/bundles`, bundle.name);
        metadata[bundle.checksumMetadataKey] = md5File.sync(filePath);        
    });

    fs.writeFileSync(path.join(__dirname, TEMPLATE_DIST, "bundling.global.json"), JSON.stringify(metadata));

    done();
}

const bundleAndMinify = async (done) => {
    var isDebugMode = argv.debugMode !== undefined && argv.debugMode.toLowerCase().trim() === "true";
    var promises = [];
    bundles.forEach(bundle => {
        if (bundle.type === "JS") {
            promises.push(bundleAndMinifyJS(bundle.files, bundle.name, `.${TEMPLATE_DIST}/bundles`, isDebugMode));
        } else if (bundle.type === "CSS") {
            promises.push(bundleAndMinifyCSS(bundle.files, bundle.name, `.${TEMPLATE_DIST}/bundles`, isDebugMode));
        }   
    });
    return await Promise.all(promises).then(() => generateBundlingGlobalMetadata(done));
}

function bundleAndMinifyJS(files, fileName, outputFolder, isDebugMode) {
    return new Promise(function(resolve, reject) {
        gulp.src(files)
            .pipe(concat(fileName))
            .pipe(isDebugMode ? util.noop() : uglify({
                output: {
                    comments: saveLicense
                }})
                .on('error', util.log))
            .pipe(gulp.dest(outputFolder))
            .on('error', reject)
            .on('end', resolve);
    });
}

function bundleAndMinifyCSS(files, fileName, outputFolder, isDebugMode) {
    return new Promise(function(resolve, reject) {
        gulp.src(files)
            .pipe(concat(fileName))
            .pipe(isDebugMode ? util.noop() : cleanCSS()
                .on('error', util.log))
            .on('error', reject)
            .pipe(gulp.dest(outputFolder))
            .on('end', resolve);
    });
}

const addWatcher = (done) => {
    var allFiles = [];
    bundles.forEach(bundle => {
        allFiles = allFiles.concat(bundle.files);
    });
    gulp.watch(allFiles.concat(['./template/**/*', './src/**/*', '!./template/styles/css/main.css', './index.js', './preconfig.json']), gulp.series(buildPackageStatics, styles, bundleAndMinify)).on("change", function(file) {
        var filePath = path.join(`${__dirname}\\${file}`);
        var hash = md5File.sync(filePath);
        if (md5HashMap[filePath] !== hash) {
            md5HashMap[filePath] = hash;
        }
    });
    done();
}

const buildPackageStatics = () => {
    return gulp.src(packageStatics).pipe(gulp.dest("dist"));
}

const createTemplate = () => {
    return gulp.src(['./src/**/*',
                     './template/**/*',
                     '!./template/styles/**',
                     '!./src/modules',
                     '!./src/**/*.js',
                     '!./src/styles/**/**']).pipe(gulp.dest("dist/template"));
}

exports.createTemplate = createTemplate;
exports.styles = styles;
exports.bundleAndMinify = bundleAndMinify;
exports.build = gulp.series(buildPackageStatics, createTemplate, styles, bundleAndMinify);
exports['build-watch'] = gulp.series(this.build, generateFileCheckSumMap, addWatcher);

