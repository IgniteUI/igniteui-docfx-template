const gulp = require("gulp");
const path = require("path");
const fs = require("fs");
const util = require("gulp-util");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const saveLicense = require("uglify-save-license");
const cleanCSS = require("gulp-clean-css");
const md5File = require('md5-file')
const argv = require("yargs").argv;

const baseFolder = "template/styles/";
const outputFolder = "bundles";

const bundles = [
    {
        type: "JS",
        name: "docfx-bundle.min.js",
        files: [
            "docfx.vendor.js",
            "jquery-localize.js",
            "docfx.js"
        ],
        checksumMetadataKey: "_docFXBundleChecksum"
    },
    {
        type: "JS",
        name: "scripts-bundle.min.js",
        files: [
            "igviewer.common.js",
            "igviewer.renderingService.js",
            "nav-init.js",
            "stackblitz-handler.js",
            "lazyload.js",
            "lazysizes.js",
            "lazysizes-handler.js",
            "theming-handler.js"
        ],
        checksumMetadataKey: "_scriptsBundleChecksum"
    },
    {
        type: "CSS",
        name: "styles-bundle.min.css",
        files: [
            "docfx.vendor.css",
            "docfx.css",
            "css/main.css"
        ],
        checksumMetadataKey: "_stylesBundleFileName"
    }
];

var md5HashMap = {};

const bundleAndMinify = (done) => {
    var isDebugMode = argv.debugMode !== undefined && argv.debugMode.toLowerCase().trim() === "true";
    var promises = [];
    bundles.forEach(bundle => {
        if (bundle.type === "JS") {
            promises.push(bundleAndMinifyJS(bundle.files, bundle.name, outputFolder, isDebugMode));
        } else if (bundle.type === "CSS") {
            promises.push(bundleAndMinifyCSS(bundle.files, bundle.name, outputFolder, isDebugMode));
        }   
    });

    return Promise.all(promises).then(generateBundlingGlobalMetadata(done));
}

// gulp.task("bundle-and-minify", );

const addWatcher = (done) => {
    var allFiles = [];
    bundles.forEach(bundle => {
        allFiles = allFiles.concat(bundle.files);
    });

    gulp.watch(allFiles, { cwd: baseFolder }).on("change", function(file) {
        var filePath = path.join(`${__dirname}\\${baseFolder + file}`);
        var hash = md5File.sync(filePath);
        if (md5HashMap[filePath] !== hash) {
            md5HashMap[filePath] = hash;
            return gulp.series(bundleAndMinify, (seriesDone) => {seriesDone(); done();})()
        }

        done();
    });
}
// gulp.task("bundle-and-minify:watch", ["bundle-and-minify", "generate-file-check-sum-map"], () => {
   
// });

// Generating hash per each file in the bundles based on its content.
// It is used to generate a new bundle only if the content of a file is changed.
const generateFileCheckSumMap = (done) => {
    var allFiles = [];
    bundles.forEach(bundle => {
        allFiles = allFiles.concat(bundle.files);
    });

    allFiles.forEach(file => {
        var filePath = path.join(__dirname, baseFolder, file);
        var hash = md5File.sync(filePath);
        md5HashMap[filePath] = hash;
    });
    done();
}

// gulp.task("generate-file-check-sum-map", )

const generateBundlingGlobalMetadata = (done) => {
    var metadata = {};
    // for general cache invalidation purposes
    metadata["_timestamp"] = new Date().getTime();
    bundles.forEach(bundle => {
        var filePath = path.join(__dirname, baseFolder, outputFolder, bundle.name);
        metadata[bundle.checksumMetadataKey] = md5File.sync(filePath);        
    });

    fs.writeFileSync(path.join(__dirname, "template", "bundling.global.json"), JSON.stringify(metadata));

    done();
}

function bundleAndMinifyJS(files, fileName, outputFolder, isDebugMode) {
    return new Promise(function(resolve, reject) {
        gulp.src(files, { cwd: baseFolder })
            .pipe(concat(fileName))
            .pipe(gulp.dest(outputFolder, { cwd: baseFolder }))
            .pipe(isDebugMode ? util.noop() : uglify({
                output: {
                    comments: saveLicense
                }})
                .on('error', util.log))
            .on('error', reject)
            .pipe(gulp.dest(outputFolder, { cwd: baseFolder }))
            .on('end', resolve);
    });
}

function bundleAndMinifyCSS(files, fileName, outputFolder, isDebugMode) {
    return new Promise(function(resolve, reject) {
        gulp.src(files, { cwd: baseFolder })
            .pipe(concat(fileName))
            .pipe(gulp.dest(outputFolder, { cwd: baseFolder }))
            .pipe(isDebugMode ? util.noop() : cleanCSS()
                .on('error', util.log))
            .on('error', reject)
            .pipe(gulp.dest(outputFolder, { cwd: baseFolder }))
            .on('end', resolve);
    });
}

exports.bundleAndMinify = bundleAndMinify;
exports.bundleAndMinifyWatch = gulp.series(bundleAndMinify, generateFileCheckSumMap, addWatcher);
