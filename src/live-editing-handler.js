(function () {
    $(document).ready(function () {
        var platformMeta = $("meta[property='docfx:platform']");
        if (!platformMeta) {
            return;
        }
        setTimeout(function () {
            var service, platform, 
            platform = platformMeta.attr("content");
            if (platform === "angular") {
                service = new AngularCodeService();
            } else {
                service = new XplatCodeService(platform)
            }
            service.init();
        })
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

    function CodeService() { }

    CodeService.prototype.stkbButtonClass = "stackblitz-btn";
    CodeService.prototype.buttonSampleSourceAttrName = "data-sample-src";
    CodeService.prototype.demosBaseUrlAttrName = "data-demos-base-url";
    CodeService.prototype.sampleUrlAttrName = "iframe-src";
    CodeService.prototype.isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    CodeService.prototype.isEdge = navigator.userAgent.indexOf('Edge') !== -1;
    CodeService.prototype.isButtonClickInProgress = false;
    CodeService.prototype.isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        ));
    CodeService.prototype.demosUrls = new MockMap();
    CodeService.prototype.codeViewLiveEditingButtonClickHandler;
    CodeService.prototype.samplesOrder = [];
    CodeService.prototype.init = function () { };

    function AngularCodeService() {
        this.stackBlitzApiUrl = "https://run.stackblitz.com/api/angular/v1";
        this.codesandboxApiUrl = "https://codesandbox.io/api/v1/sandboxes/define";
        this.samplesOrder = ['modules', 'ts', 'html', 'scss'];
        this.sharedFileName = "shared.json";
        this.assetsFolder = "/assets/";
        this.demoFilesFolderUrlPath = this.assetsFolder + "samples/";
        this.assetsRegex = new RegExp("\/?assets\/", "g");
        this.sampleFilesContentByUrl = {};
        this.demosTimeStamp;
        this.sharedFileContent = {};

        this.init = function () {
            var $codeViewElements = $("code-view");
            var $standaloneliveEditingButtons = $("button[data-sample-src]");
            var _this = this;
            if ($codeViewElements.length > 0) {

                this.codeViewLiveEditingButtonClickHandler = this.isLocalhost ? this.createPostApiFormFromCodeView() : this.onAngularGithubProjectButtonClicked();
                $.each($codeViewElements, function (index, element) {
                    var $codeView = $(element);
                    var samplesBaseUrl = $codeView.attr(_this.demosBaseUrlAttrName);
                    var sampleUrl = $codeView.attr(_this.sampleUrlAttrName);
                    if (!_this.demosUrls.has(samplesBaseUrl)) {
                        _this.demosUrls.set(samplesBaseUrl, new MockSet().add({ url: sampleUrl, codeView: $codeView }));
                    } else {
                        _this.demosUrls.get(samplesBaseUrl).add({ url: sampleUrl, codeView: $codeView });
                    }
                });

                var allDemosBaseUrls = this.demosUrls.keys();
                for (var i = 0; i < allDemosBaseUrls.length; i++) {
                    var baseUrl = allDemosBaseUrls[i];
                    var codeViewsData = this.demosUrls.get(baseUrl).values;
                    if (this.isLocalhost) {
                        this.generateLiveEditingAngularApp(baseUrl, codeViewsData);
                    } else {
                        this.getAngularSampleFiles(baseUrl, codeViewsData, this.renderFooters.bind(this, codeViewsData));
                    }
                }
                if (!(this.isIE || this.isEdge)) {
                    $standaloneliveEditingButtons.on('click', this.onAngularGithubProjectStandaloneButtonClicked);
                } else {
                    $standaloneliveEditingButtons.css("display", "none");
                }
            }
        }

        this.renderFooters = function (codeViewsData) {
            codeViewsData.forEach(function (cvD) {
                cvD.codeView.codeView("renderFooter", this.onAngularGithubProjectButtonClicked());
            })
        }

        //Create a post API form after fetching samples files
        this.generateLiveEditingAngularApp = function (samplesBaseUrl, data) {
            var metaFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + "meta.json";
            // prevent caching 
            metaFileUrl += "?t=" + new Date().getTime();
            var _this = this;
            $.get(metaFileUrl).done(function (response) {
                _this.demosTimeStamp = response.generationTimeStamp;
                _this.getAngularFiles(samplesBaseUrl, data, _this.demosTimeStamp);
            });
        }

        //Fetch angular samples files
        this.getAngularFiles = function (samplesBaseUrl, data, timeStamp) {
            var sharedFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + this.sharedFileName;
            sharedFileUrl = this.addTimeStamp(sharedFileUrl, timeStamp);
            var _this = this;
            $.get(sharedFileUrl, this.angularSharedFilePostProcess(samplesBaseUrl, function () {
                data.forEach(function (sample) {
                    var sampleFileMedata = _this.getAngularSampleMetadataUrl(samplesBaseUrl, sample.url);
                    var $codeView = sample.codeView;
                    $.get(sampleFileMedata, _this.angularSampleFilePostProcess(samplesBaseUrl, _this.removeQueryString, $codeView))
                });
            }));
        }

        this.getAngularGitHubSampleUrl = function (editor, sampleUrl, branch) {
            if (editor === "stackblitz") return "https://stackblitz.com/github/IgniteUI/igniteui-live-editing-samples/tree/" + branch + "/" + sampleUrl;
            return "https://codesandbox.io/s/github/IgniteUI/igniteui-live-editing-samples/tree/" + branch + "/" + sampleUrl + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
        }

        this.getGitHubSampleUrl = function (demosBaseUrl, sampleUrl) {
            // Get sample application base path
            const projectPath = demosBaseUrl.substring(demosBaseUrl.lastIndexOf("/") + 1)
            var demoPath = sampleUrl.replace(demosBaseUrl + "/", projectPath + "/");
            return demoPath;
        }

        this.onAngularGithubProjectButtonClicked = function () {
            _this = this;
            return function ($codeView) {
                if (_this.isButtonClickInProgress) {
                    return;
                }
                _this.isButtonClickInProgress = true;
                var $button = this;
                var demosBaseUrl = $codeView.attr(_this.demosBaseUrlAttrName);
                var sampleFileUrl = _this.getGitHubSampleUrl(demosBaseUrl, $codeView.attr(_this.sampleUrlAttrName));
                var editor = $button.hasClass(_this.stkbButtonClass) ? "stackblitz" : "codesandbox";
                var branch = demosBaseUrl.indexOf("staging.infragistics.com") !== -1 ? "vNext" : "master";
                window.open(_this.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
                _this.isButtonClickInProgress = false;
            }
        }

        this.onAngularGithubProjectStandaloneButtonClicked = function () {
            if (isButtonClickInProgress) {
                return;
            }
            isButtonClickInProgress = true;
            var $button = $(this);
            var demosBaseUrl = $button.attr(demosBaseUrlAttrName);
            var sampleFileUrl = getGitHubSampleUrl(demosBaseUrl, $button.attr(buttonSampleSourceAttrName));
            var editor = $button.hasClass(stkbButtonClass) ? "stackblitz" : "codesandbox";
            var branch = demosBaseUrl.indexOf("staging.infragistics.com") !== -1 ? "vNext" : "master";
            window.open(getAngularGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
            isButtonClickInProgress = false;
        }

        this.addTimeStamp = function (url, demosTimeStamp) {
            if (!demosTimeStamp) {
                throw Error("Timestamp cannot be added.");
            }

            url += "?t=" + demosTimeStamp;
            return url;
        }

        this.getAngularSampleFiles = function (samplesBaseUrl, data, err) {
            var metaFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + "meta.json";
            // prevent caching 
            metaFileUrl += "?t=" + new Date().getTime();
            var _this = this;
            $.get(metaFileUrl)
                .done(function (response) {
                    demosTimeStamp = response.generationTimeStamp;
                    data.forEach(function (sample) {
                        var sampleFileMedata = _this.getAngularSampleMetadataUrl(samplesBaseUrl, sample.url);
                        var $codeView = sample.codeView;
                        $.get(sampleFileMedata, _this.angularSampleFilePostProcess(samplesBaseUrl, _this.removeQueryString, $codeView))
                    });
                })
                .fail(function () {
                    err();
                    throw new Error('Error on fetching sample files!');
                });
        }

        this.angularSampleFilePostProcess = function (demosBaseUrl, cb, $codeView) {
            var _this = this;
            return function (data) {
                var codeViewFiles, url;
                const files = data.sampleFiles;
                _this.replaceRelativeAssetsUrls(files, demosBaseUrl);
                url = this.url;
                url = cb(url);
                _this.sampleFilesContentByUrl[url] = data;
                codeViewFiles = files.filter(function (f) { return f.isMain })
                    .sort(function (a, b) {
                        return _this.samplesOrder.indexOf(a.fileHeader) - _this.samplesOrder.indexOf(b.fileHeader);
                    });
                $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
                $codeView.codeView("renderFooter", _this.codeViewLiveEditingButtonClickHandler);
            }
        }

        this.angularSharedFilePostProcess = function (demosBaseUrl, cb) {
            var _this = this;
            return function (data) {
                const files = data.files;
                _this.replaceRelativeAssetsUrls(files, demosBaseUrl);
                _this.sharedFileContent = data;

                if (cb) {
                    cb();
                }
            }
        }

        this.removeQueryString = function (url) {
            var questionMarkIndex = url.indexOf('?');
            if (questionMarkIndex !== -1) {
                url = url.substring(0, questionMarkIndex);
            }

            return url;
        }

        this.getAngularSampleMetadataUrl = function (demosBaseUrl, sampleUrl) {
            var demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "");
            demoFileMetadataName = demoFileMetadataName.replace("/", "--");
            var demoFileMetadataPath = demosBaseUrl + this.demoFilesFolderUrlPath.substring(0, this.demoFilesFolderUrlPath.length - 1) + '/' + demoFileMetadataName + '.json';
            return demoFileMetadataPath;
        }

        this.createPostApiFormFromCodeView = function () {
            var _this = this;
            return function ($codeView) {
                if (_this.isButtonClickInProgress) {
                    return;
                }
                $button = this;
                _this.isButtonClickInProgress = true;
                var sampleFileUrl = _this.getAngularSampleMetadataUrl($codeView.attr(_this.demosBaseUrlAttrName), $codeView.attr(_this.sampleUrlAttrName));
                var sampleContent = _this.sampleFilesContentByUrl[sampleFileUrl];
                var formData = {
                    dependencies: sampleContent.sampleDependencies,
                    files: _this.sharedFileContent.files.concat(sampleContent.sampleFiles),
                    devDependencies: _this.sharedFileContent.devDependencies
                }
                var form = $button.hasClass(_this.stkbButtonClass) ? _this.createStackblitzForm(formData) :
                    _this.createCodesandboxForm(formData);
                form.appendTo($("body"));
                form.submit();
                form.remove();
                _this.isButtonClickInProgress = false;
            }
        }

        this.replaceRelativeAssetsUrls = function (files, demosBaseUrl) {
            var assetsUrl = demosBaseUrl + this.assetsFolder;
            for (var i = 0; i < files.length; i++) {
                if (files[i].hasRelativeAssetsUrls) {
                    files[i].content = files[i].content.replace(this.assetsRegex, assetsUrl);
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
        this.compress = function (input) {
            return window.LZString.compressToBase64(input)
                .replace(/\+/g, "-") // Convert '+' to '-'
                .replace(/\//g, "_") // Convert '/' to '_'
                .replace(/=+$/, ""); // Remove ending '='
        }

        this.createStackblitzForm = function (data) {
            var form = $("<form />", {
                method: "POST",
                action: this.stackBlitzApiUrl,
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

        this.createCodesandboxForm = function (data) {
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
                action: this.codesandboxApiUrl,
                target: "_blank",
                style: "display: none;"
            });

            var fileInput = $("<input />", {
                type: "hidden",
                name: "parameters",
                value: this.compress(JSON.stringify(fileToSandbox))
            });

            fileInput.appendTo(form)
            return form;
        }
    }

    function XplatCodeService(plat) {
        this.xplat = plat === "web-components" ? "wc" : plat;
        this.samplesCodeBasePath = "/code-viewer/";

        this.init = function () {
            var $codeViewElements = $("code-view");
            var _this = this;
            if ($codeViewElements.length > 0) {

                if(this.enableLiveEditing){
                    this.codeViewLiveEditingButtonClickHandler = this.onGithubProjectButtonClicked();
                }

                $.each($codeViewElements, function (index, element) {
                    var $codeView = $(element);
                    var samplesBaseUrl = $codeView.attr(_this.demosBaseUrlAttrName);
                    var sampleUrl = $codeView.attr(_this.sampleUrlAttrName);
                    if (!_this.demosUrls.has(samplesBaseUrl)) {
                        _this.demosUrls.set(samplesBaseUrl, new MockSet().add({ url: sampleUrl, codeView: $codeView }));
                    } else {
                        _this.demosUrls.get(samplesBaseUrl).add({ url: sampleUrl, codeView: $codeView });
                    }
                });

                var allDemosBaseUrls = this.demosUrls.keys();
                for (var i = 0; i < allDemosBaseUrls.length; i++) {
                    var baseUrl = allDemosBaseUrls[i];
                    var codeViewsData = this.demosUrls.get(baseUrl).values;
                    this.getSamplesContent(baseUrl, codeViewsData);
                }
            }
        }

        this.getSamplesContent = function (samplesBaseUrl, data) {
            var _this = this;

            data.forEach(function (sample) {
                var sampleFileMedata = _this.getSampleMetadataUrl(samplesBaseUrl, sample.url);
                var $codeView = sample.codeView;
                $.ajax({
                    url: sampleFileMedata,
                    type: "GET",
                    crossDomain: true,
                    dataType: "json",
                    success: _this.sampleFilePostProcess($codeView),
                    error: _this.sampleFilesFetchErrorHandler($codeView)
                })
            });
        }

        this.sampleFilePostProcess = function ($codeView) {
            var _this = this;
            return function (data) {
                var codeViewFiles;
                const files = data.sampleFiles;
                codeViewFiles = files.filter(function (f) { return f.isMain })
                    .sort(function (a, b) {
                        return _this.samplesOrder.indexOf(a.fileHeader) - _this.samplesOrder.indexOf(b.fileHeader);
                    });
                $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
                if(_this.enableLiveEditing && $codeView.is("[" + _this.githubSourceAttrName + "]")) {
                    $codeView.codeView("renderFooter", _this.codeViewLiveEditingButtonClickHandler);
                }
            }
        }

        this.sampleFilesFetchErrorHandler = function ($codeView) {
            var _this = this;
            return function (){
                if(_this.enableLiveEditing && $codeView.is("[" + _this.githubSourceAttrName + "]")) {
                    $codeView.codeView("renderFooter", _this.codeViewLiveEditingButtonClickHandler);
                }
                throw new Error('Error on fetching sample files!');
            }
        }

        this.getSampleMetadataUrl = function (demosBaseUrl, sampleUrl) {
            var demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "");
            var demoJsonPath = demosBaseUrl + this.samplesCodeBasePath + demoFileMetadataName + ".json";
            return demoJsonPath;
        }

        switch (this.xplat) {
            case "react":
            case "wc":
                this.samplesOrder = ['tsx', 'ts', 'css'];
                this.githubSourceAttrName = "github-src";
                this.enableLiveEditing = true;
                this.onGithubProjectButtonClicked = function () {
                    _this = this;
                    return function ($codeView) {
                        if (_this.isButtonClickInProgress) {
                            return;
                        }
                        _this.isButtonClickInProgress = true;
                        var $button = this;
                        var demosBaseUrl = $codeView.attr(_this.demosBaseUrlAttrName);
                        var sampleFileUrl = $codeView.attr(_this.githubSourceAttrName);
                        var editor = $button.hasClass(_this.stkbButtonClass) ? "stackblitz" : "codesandbox";
                        var branch = demosBaseUrl.indexOf("staging.infragistics.com") !== -1 ? "vnext" : "master";
                        window.open(_this.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
                        _this.isButtonClickInProgress = false;
                    }
                }

                this.getAngularGitHubSampleUrl = function (editor, sampleUrl, branch) {
                    if (editor === "stackblitz") return "https://stackblitz.com/github/IgniteUI/igniteui-$plat$-examples/tree/".replace("$plat$", this.xplat) + branch + "/samples/" + sampleUrl;
                    return "https://codesandbox.io/s/github/IgniteUI/igniteui-$plat$-examples/tree/".replace("$plat$", this.xplat) + branch + "/samples/" + sampleUrl + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
                }
            break;

            case "blazor":
                this.samplesOrder = ['razor', 'js', 'css'];
                this.enableLiveEditing = false;
            break;
        }
    }

    AngularCodeService.prototype = CodeService.prototype;
    XplatCodeService.prototype = CodeService.prototype;

}());