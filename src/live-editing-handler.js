(function () {
    var stkbButtonClass = "stackblitz-btn";
    var cbsButtonClass = "codesandbox-btn";
    var stackBlitzApiUrl = "https://run.stackblitz.com/api/angular/v1";
    var codesandboxApiUrl = "https://codesandbox.io/api/v1/sandboxes/define";
    const angularSampleOrder = ['modules', 'ts', 'html', 'scss'];
    var buttonIframeIdAttrName = "data-iframe-id";
    var buttonSampleSourceAttrName = "data-sample-src";
    var buttonDemosUrlAttrName = "data-demos-base-url";
    var demosBaseUrlAttrName = buttonDemosUrlAttrName;
    var sampleUrlAttrName = "iframe-src";

    //Only for Angular
    var sharedFileName = "shared.json";
    //Only for Angular
    var assetsFolder = "/assets/";
    //Only for Angular
    var demoFilesFolderUrlPath = assetsFolder + "samples/";

    var isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    var isEdge = navigator.userAgent.indexOf('Edge') !== -1;

    //Only for Angular
    var assetsRegex = new RegExp("\/?assets\/", "g");
    var sampleFilesContentByUrl = {};

    var isButtonClickInProgress = false;
    var isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        ));
    var demosUrls = new MockMap();

    //Only for Angular
    var demosTimeStamp;
    //Only for Angular
    var sharedFileContent;

    var liveEditingButtonClickHandler;
    var isAngular = $("meta[property='docfx:title']").attr("content").indexOf("Angular") !== -1;
    var newInit = function(){
        var codeViewElements = $("code-view");

        if(codeViewElements.length > 0) {
            
            if(isAngular) {
                liveEditingButtonClickHandler = isLocalhost ? onProjectButtonClicked : onGithubProjectButtonClicked;
                $.each(codeViewElements, function(index, element) {
                    var $codeView = $(element);
                    var samplesBaseUrl = $codeView.attr(demosBaseUrlAttrName);
                    var sampleUrl = $codeView.attr(sampleUrlAttrName);
                    if (!demosUrls.has(samplesBaseUrl)) {
                        demosUrls.set(samplesBaseUrl, new MockSet().add({url: sampleUrl, codeView: $codeView}));
                    } else {
                        demosUrls.get(samplesBaseUrl).add({url: sampleUrl, codeView: $codeView});
                    }
                });

                var allDemosBaseUrls = demosUrls.keys();
                for (var i = 0; i < allDemosBaseUrls.length; i++) {
                    var baseUrl = allDemosBaseUrls[i];
                    var codeViewsData = demosUrls.get(baseUrl).values;
                    if(isLocalhost) {
                        generateLiveEditingAngularApp(baseUrl, codeViewsData);
                    }
                }
            }
        }
    }

    var generateLiveEditingAngularApp = function (samplesBaseUrl, data) {
        var metaFileUrl = samplesBaseUrl + demoFilesFolderUrlPath + "meta.json";
        // prevent caching 
        metaFileUrl += "?t=" + new Date().getTime();
        $.get(metaFileUrl).done(function (response) {
            demosTimeStamp = response.generationTimeStamp;
            getAngularFiles(samplesBaseUrl, data, demosTimeStamp);
        });
    }

    var getAngularFiles = function(samplesBaseUrl, data, timeStamp) {
        var sharedFileUrl = samplesBaseUrl + demoFilesFolderUrlPath + sharedFileName;
        sharedFileUrl = addTimeStamp(sharedFileUrl, timeStamp);
        $.get(sharedFileUrl, sharedFilePostProcess(samplesBaseUrl, function () {
            data.forEach(function (sample) {
                var sampleFileMedataData = getAngularSampleMetadataUrl(samplesBaseUrl, sample.url);
                var $codeView = sample.codeView;
                $.get(sampleFileMedataData, sampleFilePostProcess(samplesBaseUrl, removeQueryString, $codeView))
            });
        }));
    }

    var init = function () {
        var projectButtons = $("." + stkbButtonClass + ", ." + cbsButtonClass);

        //Get sample urls via live editing buttons
        if (projectButtons.length > 0) {
            liveEditingButtonClickHandler = isLocalhost ? onProjectButtonClicked : onGithubProjectButtonClicked;
            $.each(projectButtons, function (index, element) {
                const $button = $(element);
                const baseUrl = $button.attr(buttonDemosUrlAttrName);
                const buttonSampleUrl = getSampleUrlFromButton($button, baseUrl);
                const buttonIframeID = $button.attr(buttonIframeIdAttrName);
                const sampleData = JSON.stringify({ sampleUrl: buttonSampleUrl, iframeId: buttonIframeID });
                if (!demosUrls.has(baseUrl)) {
                    demosUrls.set(baseUrl, new MockSet().add(sampleData));
                } else {
                    demosUrls.get(baseUrl).add(sampleData);
                }
            });

            const demosBaseUrls = demosUrls.keys();
            for (var i = 0; i < demosBaseUrls.length; i++) {
                const url = demosBaseUrls[i];
                const urlSamplesData = demosUrls.get(url).values;
                if (isLocalhost) {
                    generateLiveEditingApp(url, urlSamplesData);
                } else {
                    getSampleFiles(url, urlSamplesData, function () {
                        if (isIE || isEdge) {
                            projectButtons.remove();
                        } else {
                            projectButtons.removeAttr("disabled");
                            projectButtons.css("visibility", 'visible');
                            projectButtons.on("click", onGithubProjectButtonClicked);
                        }
                    });
                }
            }
        }
    }

    var getGitHubSampleUrl = function (editor, sampleUrl, branch) {
        if (editor === "stackblitz") return "https://stackblitz.com/github/IgniteUI/igniteui-live-editing-samples/tree/" + branch + "/" + sampleUrl;
        return "https://codesandbox.io/s/github/IgniteUI/igniteui-live-editing-samples/tree/" + branch + "/" + sampleUrl + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
    }

    var getGitHubSampleUrlFromButton = function ($button, demosBaseUrl) {
        var sampleSrc = "";
        var buttonIframeId = $button.attr(buttonIframeIdAttrName);
        if (buttonIframeId) {
            var iframe = $("#" + buttonIframeId);
            if (iframe.attr("src")) {
                sampleSrc = iframe.attr("src");
            } else {
                sampleSrc = iframe.attr("data-src");
            }
        } else {
            sampleSrc = $button.attr(buttonSampleSourceAttrName);
        }
        // Get sample application base path
        const projectPath = demosBaseUrl.substring(demosBaseUrl.lastIndexOf("/") + 1)
        var demoPath = sampleSrc.replace(demosBaseUrl + "/", projectPath + "/");
        return demoPath;
    }

    var onGithubProjectButtonClicked = function (event) {
        if (isButtonClickInProgress) {
            return;
        }
        isButtonClickInProgress = true;
        var $button = $(this);
        var sampleFileUrl = getGitHubSampleUrlFromButton($button, $(this).attr(buttonDemosUrlAttrName));
        var editor = event.target.classList.value === stkbButtonClass ? "stackblitz" : "codesandbox";
        var branch = $(this).attr(buttonDemosUrlAttrName).indexOf("staging.infragistics.com") !== -1 ? "vNext" : "master";
        window.open(getGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
        isButtonClickInProgress = false;
    }

    var generateLiveEditingApp = function (demosBaseUrl, samplesData) {

        var metaFileUrl = demosBaseUrl + demoFilesFolderUrlPath + "meta.json";
        // prevent caching 
        metaFileUrl += "?t=" + new Date().getTime();

        $.get(metaFileUrl).done(function (response) {
            demosTimeStamp = response.generationTimeStamp;
            getFiles(demosBaseUrl, samplesData, demosTimeStamp);
        });
    }

    var addTimeStamp = function (url, demosTimeStamp) {
        if (!demosTimeStamp) {
            throw Error("Timestamp cannot be added.");
        }

        url += "?t=" + demosTimeStamp;
        return url;
    }

    var getFiles = function (demosBaseUrl, samplesData, demosTimeStamp) {

        var sharedFileUrl = demosBaseUrl + demoFilesFolderUrlPath + sharedFileName;
        sharedFileUrl = addTimeStamp(sharedFileUrl, demosTimeStamp);
        $.get(sharedFileUrl, sharedFilePostProcess(demosBaseUrl, function () {
            samplesData.forEach(function (sample) {
                const sampleDataObj = JSON.parse(sample);
                const sampleFileUrl = sampleDataObj.sampleUrl;
                const iframeID = sampleDataObj.iframeId;
                $.get(sampleFileUrl, sampleFilePostProcess(demosBaseUrl, removeQueryString, iframeID))
            });
        }));
    }

    var getSampleFiles = function (demosBaseUrl, samplesData, err) {
        var metaFileUrl = demosBaseUrl + demoFilesFolderUrlPath + "meta.json";
        // prevent caching 
        metaFileUrl += "?t=" + new Date().getTime();

        $.get(metaFileUrl)
            .done(function (response) {
                demosTimeStamp = response.generationTimeStamp;
                samplesData.forEach(function (sample) {
                    const sampleDataObj = JSON.parse(sample);
                    const sampleFileUrl = sampleDataObj.sampleUrl;
                    const iframeID = sampleDataObj.iframeId;
                    $.get(sampleFileUrl, sampleFilePostProcess(demosBaseUrl, removeQueryString, iframeID))
                });
            })
            .fail(function () {
                err();
                throw new Error('Error on fetching sample files!');
            });
    }

    var sampleFilePostProcess = function (demosBaseUrl, cb, $codeView) {
        return function (data) {
            var codeViewFiles, url;
            const files = data.sampleFiles;
            replaceRelativeAssetsUrls(files, demosBaseUrl);
            url = this.url;
            url = cb(url);
            sampleFilesContentByUrl[url] = data;
            codeViewFiles = files.filter(function (f) { return f.isMain })
                .sort(function (a, b) {
                    return angularSampleOrder.indexOf(a.fileHeader) - angularSampleOrder.indexOf(b.fileHeader);
                });
                $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
        }
    }

    var sharedFilePostProcess = function (demosBaseUrl, cb) {
        return function (data) {
            const files = data.files;
            replaceRelativeAssetsUrls(files, demosBaseUrl);
            sharedFileContent = data;

            if (cb) {
                cb();
            }
        }
    }

    var removeQueryString = function (url) {
        var questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex !== -1) {
            url = url.substring(0, questionMarkIndex);
        }

        return url;
    }

    var getSampleUrlFromButton = function ($button, demosBaseUrl) {
        var sampleSrc = "";
        var buttonIframeId = $button.attr(buttonIframeIdAttrName);
        if (buttonIframeId) {
            var iframe = $("#" + buttonIframeId);
            if (iframe.attr("src")) {
                sampleSrc = iframe.attr("src");
            } else {
                sampleSrc = iframe.attr("data-src");
            }
        } else {
            sampleSrc = $button.attr(buttonSampleSourceAttrName);
        }

        var demoPath = sampleSrc.replace(demosBaseUrl + "/", "");
        demoPath = demoPath.replace("/", "--");
        var demoFileUrl = demosBaseUrl +
            demoFilesFolderUrlPath.substring(0, demoFilesFolderUrlPath.length - 1) +
            "/" + demoPath + ".json";
        return demoFileUrl;
    }

    var getAngularSampleMetadataUrl = function(demosBaseUrl, sampleUrl) {
        var demoFileMetadataName= sampleUrl.replace(demosBaseUrl + "/", "");
        demoFileMetadataName = demoFileMetadataName.replace("/", "--");
        var demoFileMetadataPath = demosBaseUrl + demoFilesFolderUrlPath.substring(0, demoFilesFolderUrlPath.length - 1) + '/' + demoFileMetadataName + '.json';
        return demoFileMetadataPath;
    }

    var onProjectButtonClicked = function () {
        if (isButtonClickInProgress) {
            return;
        }

        isButtonClickInProgress = true;
        var $button = $(this);
        var sampleFileUrl = getSampleUrlFromButton($button, $(this).attr(buttonDemosUrlAttrName));
        var sampleContent = sampleFilesContentByUrl[sampleFileUrl];
        var formData = {
            dependencies: sampleContent.sampleDependencies,
            files: sharedFileContent.files.concat(sampleContent.sampleFiles),
            devDependencies: sharedFileContent.devDependencies
        }
        var form = $button.hasClass(stkbButtonClass) ? createStackblitzForm(formData) :
            createCodesandboxForm(formData);
        form.appendTo($("body"));
        form.submit();
        form.remove();
        isButtonClickInProgress = false;
    }

    var replaceRelativeAssetsUrls = function (files, demosBaseUrl) {
        var assetsUrl = demosBaseUrl + assetsFolder;
        for (var i = 0; i < files.length; i++) {
            if (files[i].hasRelativeAssetsUrls) {
                files[i].content = files[i].content.replace(assetsRegex, assetsUrl);
            }
        }
    }

    /*  a sample forms object -
        {
            description: `The greatest sample`,
            files: [{
                path: `src/index.html`,
                content: `<h1>Hello world!</h1>`
            }],
            dependencies: `"@angular/animations": "^5.2.0",
                "@angular/common": "^5.2.0"`,
            tags: ["tagA", "tagB", "tagC"]
        }
    */

    function compress(input) {
        return window.LZString.compressToBase64(input)
            .replace(/\+/g, "-") // Convert '+' to '-'
            .replace(/\//g, "_") // Convert '/' to '_'
            .replace(/=+$/, ""); // Remove ending '='
    }

    var createStackblitzForm = function (data) {
        var form = $("<form />", {
            method: "POST",
            action: stackBlitzApiUrl,
            target: "_blank",
            style: "display: none;"
        });

        // files
        for (var i = 0; i < data.files.length; i++) {
            var fileInput = $("<input />", {
                type: "hidden",
                name: "files[" + data.files[i].path + "]",
                value: data.files[i].content
            });

            fileInput.appendTo(form);
        }

        // tags
        if (data.tags) {
            for (var i = 0; i < data.tags.length; i++) {
                var tagInput = $("<input />", {
                    type: "hidden",
                    name: "tags[" + i + "]",
                    value: data.tags[i]
                });

                tagInput.appendTo(tagInput);
            }
        }

        // description
        if (data.description) {
            var descriptionInput = $("<input />", {
                type: "hidden",
                name: "description",
                value: data.description
            });

            descriptionInput.appendTo(form);
        }

        // dependencies
        var dependenciesInput = $("<input />", {
            type: "hidden",
            name: "dependencies",
            value: data.dependencies
        });

        dependenciesInput.appendTo(form);
        return form;
    }

    var createCodesandboxForm = function (data) {
        const fileToSandbox = {
            files: {
                "sandbox.config.json": {
                    "content": {
                        "infiniteLoopProtection": false,
                        "hardReloadOnChange": false,
                        "view": "browser",
                        "template": "angular-cli"
                    }
                },
                "package.json": {
                    "content": {
                        "dependencies": JSON.parse(data.dependencies),
                        "devDependencies": data.devDependencies
                    }
                }
            }
        };

        data.files.forEach(function (f) {
            fileToSandbox.files[f["path"].replace("./", "")] = {
                content: f["content"]
            }
        });

        var form = $("<form />", {
            method: "POST",
            action: codesandboxApiUrl,
            target: "_blank",
            style: "display: none;"
        });

        var fileInput = $("<input />", {
            type: "hidden",
            name: "parameters",
            value: compress(JSON.stringify(fileToSandbox))
        });

        fileInput.appendTo(form)
        return form;
    }

    $(document).ready(function () {
        newInit();
    });
    function MockMap() {
        this._keys = [];
        this.pairs = {};
    }

    MockMap.prototype.set = function (key, value) {
        if (this._keys.indexOf(key) === -1) {
            this._keys.push(key);
        }
        this.pairs[key] = value;
    }

    MockMap.prototype.get = function (key) {
        if (this.has(key)) return this.pairs[key]
        return undefined;
    }

    MockMap.prototype.has = function (key) {
        return this._keys.indexOf(key) !== -1;
    }

    MockMap.prototype.keys = function () {
        return this._keys;
    }
    function MockSet() {
        this.values = [];
    }

    MockSet.prototype.add = function (value) {
        if (this.values.indexOf(value) === -1) this.values.push(value);
        return this;
    }

}());