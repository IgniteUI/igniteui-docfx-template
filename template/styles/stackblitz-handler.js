(function () {
	var buttonClass = "stackblitz-btn";
    var buttonIframeIdAttrName = "data-iframe-id";
    var buttonSampleSourceAttrName = "data-sample-src";
    var buttonDemosUrlAttrName = "data-demos-base-url";
    var stackBlitzApiUrl = "https://run.stackblitz.com/api/angular/v1";
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

    $(document).ready(function() {
        init();
    });
}());