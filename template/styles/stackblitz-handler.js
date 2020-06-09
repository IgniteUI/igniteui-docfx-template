(function () {
    console.log(window.LZString);
	var buttonClass = "stackblitz-btn";
    var buttonIframeIdAttrName = "data-iframe-id";
    var buttonSampleSourceAttrName = "data-sample-src";
    var buttonDemosUrlAttrName = "data-demos-base-url";
    var stackBlitzApiUrl = "https://codesandbox.io/api/v1/sandboxes/define";
    var sharedFileName = "shared.json";
    var assetsFolder = "/assets/";
    var demoFilesFolderUrlPath =  assetsFolder + "samples/";
    var demoFilesCSSSupportFolderUrlPath = demoFilesFolderUrlPath + "css-support/";
    var assetsRegex = new RegExp("\/?assets\/", "g");
    var sampleFilesContentByUrl = {};
    var isIE = navigator.userAgent.indexOf('MSIE')!==-1 || navigator.appVersion.indexOf('Trident/') > 0;
    var isEdge = navigator.userAgent.indexOf('Edge')!==-1;

    var isButtonClickInProgress = false;

    var demosTimeStamp;
       
    var sharedFileContent;
	var init = function () {
        var stackblitzButtons = $("." + buttonClass);  

        if (stackblitzButtons.length > 0) {
            var demosBaseUrls = new Set();

            $.each(stackblitzButtons, function(index, element){
                demosBaseUrls.add($(element).attr(buttonDemosUrlAttrName))
            });

            var hasMultipleUrls = demosBaseUrls.size > 1;

            if (hasMultipleUrls) {
                demosBaseUrls.forEach(function(url) {
                    var currentDemoUrlButtons = $(stackblitzButtons).filter(function(index, element) {
                        return $(element).attr(buttonDemosUrlAttrName) === url;
                    });
                    generateStackBlitz(url, currentDemoUrlButtons)
                });

            } else {
                demosBaseUrl = $(stackblitzButtons[0]).attr(buttonDemosUrlAttrName);
                generateStackBlitz(demosBaseUrl, stackblitzButtons)
            }
        } 
    }
    
    var generateStackBlitz = function(demosBaseUrl, $buttons) {
        var samplesFilesUrls = []; 

        $.each($buttons, function(index, element) {

            var $button = $(element);
            var sampleFileUrl = getSampleUrlByStackBlitzButton($button, demosBaseUrl);

            if (samplesFilesUrls.indexOf(sampleFileUrl) === -1) {
                samplesFilesUrls.push(sampleFileUrl);
            }

            $button.on("click", onStackblitzButtonClicked);
        });
           
        var metaFileUrl = demosBaseUrl + getDemoFilesFolderUrlPath() + "meta.json";
        // prevent caching 
        metaFileUrl += "?t=" + new Date().getTime();
 
        $.get(metaFileUrl).done(function(response) {
            demosTimeStamp = response.generationTimeStamp;
            getFiles($buttons, demosBaseUrl, samplesFilesUrls, demosTimeStamp);
        });
    }

   var getFiles = function($buttons, demosBaseUrl, samplesFilesUrls, demosTimeStamp) {

        var sharedFileUrl = demosBaseUrl + getDemoFilesFolderUrlPath() + sharedFileName;
        sharedFileUrl = addTimeStamp(sharedFileUrl, demosTimeStamp);

        var requests = [$.get(sharedFileUrl)];

        $.each(samplesFilesUrls, function(index, url) {
            url = addTimeStamp(url, demosTimeStamp);
            var ajax = $.get(url);
            requests.push(ajax);
        });

        $.when.apply($, requests).done(function() {
            replaceRelativeAssetsUrls(arguments[0][0].files, demosBaseUrl);
            sharedFileContent = arguments[0][0];
            
            for(var i = 1; i < arguments.length; i++) {
                replaceRelativeAssetsUrls(arguments[i][0].sampleFiles, demosBaseUrl);
                var url = this[i].url;
                url = removeQueryString(url);
                sampleFilesContentByUrl[url] = arguments[i][0];
            }

            $buttons.removeAttr("disabled");
        });
    }

    var addTimeStamp = function(url, demosTimeStamp) {
        if (!demosTimeStamp) {
            throw Error("Timestamp cannot be added.");
        }

        url += "?t=" + demosTimeStamp;
        return url;
    }

    var removeQueryString = function(url) {
        var questionMarkIndex = url.indexOf('?');
        if (questionMarkIndex !== -1) {
            url = url.substring(0, questionMarkIndex);
        }

        return url;
    }

    var getDemoFilesFolderUrlPath = function() {
        if (isIE || isEdge) {
            return demoFilesCSSSupportFolderUrlPath;
        }

        return demoFilesFolderUrlPath;
    }

    var getSampleUrlByStackBlitzButton = function ($button, demosBaseUrl) {
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
        demoPath = demoPath.replace("/", "-");
        var demoFileUrl = demosBaseUrl  +
            getDemoFilesFolderUrlPath().substring(0, getDemoFilesFolderUrlPath().length - 1) +
                "/" + demoPath + ".json";
        return demoFileUrl;
    }

    var onStackblitzButtonClicked = function (event) {
		if (isButtonClickInProgress) {
			return;
        } 

        isButtonClickInProgress = true;
        var $button = $(this);
        var sampleFileUrl = getSampleUrlByStackBlitzButton($button, $(this).attr(buttonDemosUrlAttrName));
        var sampleContent = sampleFilesContentByUrl[sampleFileUrl];
        var formData = {
            dependencies: sampleContent.sampleDependencies,
            files: sharedFileContent.files.concat(sampleContent.sampleFiles)
        }

        var form = createStackblitzForm(formData);
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
   var  toObject = function (arr) {
    var rv = {};
    for (var i = 0; i < arr.length; ++i)
    rv[arr[i]] = arr[i]
    return rv;
  }

  function compress(input) {
    return window.LZString.compressToBase64(input)
      .replace(/\+/g, `-`) // Convert '+' to '-'
      .replace(/\//g, `_`) // Convert '/' to '_'
      .replace(/=+$/, ``); // Remove ending '='
  }
  
    var createStackblitzForm = function (data) {
        const fileToSandbox = { files: {
            "package.json": {
                "content": {
                    "dependencies": JSON.parse(data.dependencies),
                    "devDependencies": {
                        "@angular-devkit/build-angular": "^0.901.7",
                        "@angular/cli": "9.1.7",
                        "@angular/compiler-cli": "9.1.9",
                        "@angular/language-service": "9.1.9",
                        "@igniteui/angular-schematics": "^9.1.510",
                        "@types/jasmine": "^3.5.10",
                        "@types/jasminewd2": "^2.0.8",
                        "@types/node": "^13.9.3",
                        "codelyzer": "^5.2.1",
                        "fs-extra": "^8.1.0",
                        "gulp": "^4.0.2",
                        "jasmine-core": "~3.5.0",
                        "jasmine-spec-reporter": "~4.2.1",
                        "karma": "^4.4.1",
                        "karma-chrome-launcher": "~3.1.0",
                        "karma-cli": "~2.0.0",
                        "karma-coverage-istanbul-reporter": "^2.1.1",
                        "karma-jasmine": "^3.1.1",
                        "karma-jasmine-html-reporter": "^1.5.2",
                        "node-sass": "^4.13.1",
                        "protractor": "^5.4.3",
                        "sass.js": "0.11.1",
                        "ts-node": "^8.8.1",
                        "tslint": "5.12.1",
                        "typescript": "3.6.4"
                      }
                }
            }
        }};
        const f = data.files.forEach(f => {
            fileToSandbox.files[f["path"]] = {
                content: f["content"]
            }
        });
        console.log(fileToSandbox)

        var form = $("<form />", {
                method: "POST",
                action: stackBlitzApiUrl,
                target: "_blank",
                style: "display: none;"
        });

        var fileInput = $("<input />", {
            type: "hidden",
            name: "parameters",
            value: compress(JSON.stringify(fileToSandbox))
        });

        fileInput.appendTo(form)

        // // files
        // for (var i = 0; i < data.files.length; i++) {

        // }
    
        // // tags
        // if (data.tags) {
        //     for (var i = 0; i < data.tags.length; i++) {
        //         var tagInput = $("<input />", {
        //             type: "hidden",
        //             name: "tags[" + i + "]",
        //             value: data.tags[i]
        //         });

        //         tagInput.appendTo(tagInput);
        //     }
        // } 
  
        // // description
        // if (data.description) {
        //     var descriptionInput = $("<input />", {
        //         type: "hidden",
        //         name: "description",
        //         value: data.description
        //     });

        //     descriptionInput.appendTo(form);
        // }

        // // dependencies
        // var dependenciesInput = $("<input />", {
        //     type: "hidden",
        //     name: "dependencies",
        //     value: data.dependencies
        // });

        // dependenciesInput.appendTo(form);
        return form;
    }

    $(document).ready(function() {
        init();
    });
}());