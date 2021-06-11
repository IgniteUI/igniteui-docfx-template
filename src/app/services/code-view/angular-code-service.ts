import { CodeService } from "./base-code-service";
import util from '../utils';
import { ICodeViewFilesData, ISampleData } from "../../types";
import { compressToBase64 } from 'lz-string';
import { XHRService } from "../jqXHR-tasks";

export class AngularCodeService extends CodeService {

    protected samplesOrder = ['modules', 'ts', 'html', 'scss'];
    protected codeViewLiveEditingButtonClickHandler = util.isLocalhost ? this.createPostApiFormFromCodeView() : this.onAngularGithubProjectButtonClicked();
    private stackBlitzApiUrl = "https://stackblitz.com/run";
    private codesandboxApiUrl = "https://codesandbox.io/api/v1/sandboxes/define";
    private sharedFileName = "shared.json";
    private assetsFolder = "/assets/";
    private demoFilesFolderUrlPath = this.assetsFolder + "samples/";
    private assetsRegex = new RegExp(/([\.]{0,2}\/)*assets\//g);
    private sampleFilesContentByUrl: { [url: string]: any } = {};
    private demosTimeStamp: number;
    private sharedFileContent: { [url: string]: any } = {};

    constructor(private xhrService: XHRService) {
        super();
    }

    public init(): void {
        let $codeViewElements = $("code-view");
        let $standaloneliveEditingButtons = $("button[data-sample-src]");

        if ($codeViewElements.length > 0) {

            $.each($codeViewElements, (index, element) => {
                let $codeView = $(element);
                let samplesBaseUrl = $codeView.attr(this.demosBaseUrlAttrName)!;
                let sampleUrl = $codeView.attr(this.sampleUrlAttrName)!;
                if (!this.demosUrls.has(samplesBaseUrl)) {
                    this.demosUrls.set(samplesBaseUrl, [{ url: sampleUrl, codeView: $codeView }]);
                } else {
                    this.demosUrls.get(samplesBaseUrl)!.push({ url: sampleUrl, codeView: $codeView });
                }
            });

            let allDemosBaseUrls = this.demosUrls.keys();
            for (const baseUrl of allDemosBaseUrls) {
                let codeViewsData = this.demosUrls.get(baseUrl)!;
                if (util.isLocalhost) {
                    this.generateLiveEditingAngularApp(baseUrl, codeViewsData);
                } else {
                    this.getAngularSampleFiles(baseUrl, codeViewsData, () => this.renderFooters(codeViewsData));
                }
            }
            if (!(util.isIE || util.isEdge)) {
                $standaloneliveEditingButtons.on('click', this.onAngularGithubProjectStandaloneButtonClicked());
            } else {
                $standaloneliveEditingButtons.css("display", "none");
            }
        }

        this.demosUrls.clear();
        this.sharedFileContent = {};
    }

    private renderFooters(codeViewsData: ISampleData[]) {
        for (const data of codeViewsData) {
            data.codeView.codeView("renderFooter", this.onAngularGithubProjectButtonClicked);
        }
    }

    //Create a post API form after fetching samples files
    private generateLiveEditingAngularApp(samplesBaseUrl: string, data: ISampleData[]) {
        let metaFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + "meta.json";
        // prevent caching
        metaFileUrl += "?t=" + new Date().getTime();
        let metaFileFetch = $.get(metaFileUrl).done((response) => {
            this.demosTimeStamp = response.generationTimeStamp;
            this.getAngularFiles(samplesBaseUrl, data, this.demosTimeStamp);
        });
        this.xhrService.pushTask(metaFileFetch);
    }

    //Fetch angular samples files
    private getAngularFiles(samplesBaseUrl: string, data: ISampleData[], timeStamp: number) {
        let sharedFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + this.sharedFileName;
        sharedFileUrl = this.addTimeStamp(sharedFileUrl, timeStamp);
        let sharedFileFetch = $.get(sharedFileUrl, this.angularSharedFilePostProcess(samplesBaseUrl, () => {
            for (const sampleData of data) {
                let sampleFileMedata = this.getAngularSampleMetadataUrl(samplesBaseUrl, sampleData.url);
                let $codeView = sampleData.codeView;
                let sampleMetadataFetch = $.get(sampleFileMedata, this.angularSampleFilePostProcess(samplesBaseUrl, this.removeQueryString, $codeView));
                this.xhrService.pushTask(sampleMetadataFetch)
            }
        }))
        this.xhrService.pushTask(sharedFileFetch);
    }

    private getAngularGitHubSampleUrl(editor: string, sampleUrl: string, branch: string) {
        // if (editor === "stackblitz") return `https://stackblitz.com/github/IgniteUI/igniteui-live-editing-samples/tree/${branch}/${sampleUrl}`;
        // return `https://codesandbox.io/s/github/IgniteUI/igniteui-live-editing-samples/tree/${branch}/${sampleUrl}?fontsize=14&hidenavigation=1&theme=dark&view=preview`
        const path = this.getGithubPath(sampleUrl, branch, "angular");
        if (editor === "stackblitz")
            return "https://stackblitz.com/github/" + path;
        else
            return "https://codesandbox.io/s/github/" + path + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
    }

    protected getGithubPath(sampleUrl: string, branch: string, platform: string): string {
        return `igniteui-live-editing-samples/tree/${branch}/${sampleUrl}`;
    }

    private getGitHubSampleUrl(demosBaseUrl: string, sampleUrl: string) {
        // Get sample application base path
        const projectPath = demosBaseUrl.substring(demosBaseUrl.lastIndexOf("/") + 1)
        let demoPath = sampleUrl.replace(demosBaseUrl + "/", projectPath + "/");
        return demoPath;
    }

    private onAngularGithubProjectButtonClicked() {
        const codeService = this;

        return  ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let demosBaseUrl = $codeView.attr(codeService.demosBaseUrlAttrName)!;
            let sampleFileUrl = codeService.getGitHubSampleUrl(demosBaseUrl, $codeView.attr(codeService.sampleUrlAttrName)!);
            let editor = $button.hasClass(codeService.stkbButtonClass) ? "stackblitz" : "codesandbox";
            let branch = demosBaseUrl.indexOf("staging.infragistics.com") !== -1 ? "vNext" : "master";
            window.open(codeService.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
            codeService.isButtonClickInProgress = false;
        }
    }

    private onAngularGithubProjectStandaloneButtonClicked() {
        const codeService = this;
        return function (this: HTMLButtonElement) {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let $button = $(this);
            let demosBaseUrl = $button.attr(codeService.demosBaseUrlAttrName)!;
            let sampleFileUrl = codeService.getGitHubSampleUrl(demosBaseUrl, $button.attr(codeService.buttonSampleSourceAttrName)!);
            let editor = $button.hasClass(codeService.stkbButtonClass) ? "stackblitz" : "codesandbox";
            let branch = demosBaseUrl.indexOf("staging.infragistics.com") !== -1 ? "vNext" : "master";
            window.open(codeService.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch), '_blank');
            codeService.isButtonClickInProgress = false;
        }
    }

    private addTimeStamp(url: string, demosTimeStamp?: number): string {
        if (!demosTimeStamp) {
            throw Error("Timestamp cannot be added.");
        }

        url += "?t=" + demosTimeStamp;
        return url;
    }

    private getAngularSampleFiles(samplesBaseUrl: string, data: ISampleData[], err: () => void) {
        let metaFileUrl = samplesBaseUrl + this.demoFilesFolderUrlPath + "meta.json";
        // prevent caching
        metaFileUrl += "?t=" + new Date().getTime();
        let metaFileFetch = $.get(metaFileUrl)
        .done((response: any) => {
            this.demosTimeStamp = response.generationTimeStamp;
            for (const sampleData of data) {
                let sampleFileMedata = this.getAngularSampleMetadataUrl(samplesBaseUrl, sampleData.url);
                let $codeView = sampleData.codeView;
                let sampleMetadataFetch = $.get(sampleFileMedata, this.angularSampleFilePostProcess(samplesBaseUrl, this.removeQueryString, $codeView));
                this.xhrService.pushTask(sampleMetadataFetch);
            }
        })
        .fail(() => {
            err();
            throw new Error('Error on fetching sample files!');
        })
        this.xhrService.pushTask(metaFileFetch);
    }

    private angularSampleFilePostProcess(demosBaseUrl: string, cb: (url: string) => string, $codeView: JQuery<HTMLElement>) {
        const codeService = this;
        return function (this: JQuery.UrlAjaxSettings, data: any) {
            let codeViewFiles: ICodeViewFilesData[], url: string;
            const files: ICodeViewFilesData[] = data.sampleFiles;
            codeService.replaceRelativeAssetsUrls(files, demosBaseUrl);
            url = this.url;
            url = cb(url);
            codeService.sampleFilesContentByUrl[url] = data;
            codeViewFiles = files.filter(f =>  f.isMain)
                                 .sort((a: any, b: any) => {
                                    return codeService.samplesOrder.indexOf(a.fileHeader) - codeService.samplesOrder.indexOf(b.fileHeader);
                                 });
            $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
            $codeView.codeView("renderFooter", codeService.codeViewLiveEditingButtonClickHandler);
        }
    }

    private angularSharedFilePostProcess(demosBaseUrl: string, cb?: () => void) {
        const codeService = this;
        return function (this: JQuery.UrlAjaxSettings, data: any) {
            const files = data.files;
            codeService.replaceRelativeAssetsUrls(files, demosBaseUrl);
            codeService.sharedFileContent = data;

            if (cb) {
                cb();
            }
        }
    }

    private removeQueryString(url: string): string {
        if (url.includes('?')) {
            url = url.substring(0, url.indexOf('?'));
        }
        return url;
    }

    private getAngularSampleMetadataUrl(demosBaseUrl: string, sampleUrl: string) {
        let demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "");
        demoFileMetadataName = demoFileMetadataName.replace("/", "--");
        let demoFileMetadataPath = `${demosBaseUrl}${this.demoFilesFolderUrlPath}${demoFileMetadataName}.json`;
        return demoFileMetadataPath;
    }

    private createPostApiFormFromCodeView() {
        const codeService = this;

        return ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let sampleFileUrl = codeService.getAngularSampleMetadataUrl($codeView.attr(codeService.demosBaseUrlAttrName)!, $codeView.attr(codeService.sampleUrlAttrName)!);
            let sampleContent = codeService.sampleFilesContentByUrl[sampleFileUrl];
            if(sampleContent.addTsConfig) {
                codeService.sharedFileContent.files.push(codeService.sharedFileContent.tsConfig)
            }
            let formData = {
                dependencies: sampleContent.sampleDependencies,
                files: codeService.sharedFileContent.files.concat(sampleContent.sampleFiles),
                devDependencies: codeService.sharedFileContent.devDependencies
            }
            let form = $button.hasClass(codeService.stkbButtonClass) ? codeService.createStackblitzForm(formData) :
                codeService.createCodesandboxForm(formData);
            form.appendTo($("body"));
            form.submit();
            form.remove();
            codeService.isButtonClickInProgress = false;
        }
    }

    private replaceRelativeAssetsUrls(files: ICodeViewFilesData[], demosBaseUrl: string) {
        let assetsUrl = demosBaseUrl + this.assetsFolder;
        for (let i = 0; i < files.length; i++) {
            if (files[i].hasRelativeAssetsUrls) {
                files[i].content = files[i].content.replace(this.assetsRegex, assetsUrl);
            }
        }
    }

    private compress(input: string) {
        return compressToBase64(input)
            .replace(/\+/g, "-") // Convert '+' to '-'
            .replace(/\//g, "_") // Convert '/' to '_'
            .replace(/=+$/, ""); // Remove ending '='
    }

    private createStackblitzForm(data: any) {
        let form = $("<form />", {
            method: "POST",
            action: this.stackBlitzApiUrl,
            target: "_blank",
            style: "display: none;"
        });

        // files
        for (let i = 0; i < data.files.length; i++) {
            let fileInput = $("<input />", {
                type: "hidden",
                name: "project[files][" + data.files[i].path + "]",
                value: data.files[i].content
            });

            fileInput.appendTo(form);
        }

        // tags
        if (data.tags) {
            for (let i = 0; i < data.tags.length; i++) {
                let tagInput = $("<input />", {
                    type: "hidden",
                    name: "project[tags][" + i + "]",
                    value: data.tags[i]
                });

                tagInput.appendTo(tagInput);
            }
        }

        // description
        if (data.description) {
            let descriptionInput = $("<input />", {
                type: "hidden",
                name: "project[description]",
                value: data.description
            });

            descriptionInput.appendTo(form);
        }

        // dependencies
        let dependenciesInput = $("<input />", {
            type: "hidden",
            name: "project[dependencies]",
            value: data.dependencies
        });

        let templateInput  = $("<input />", {
            type: "hidden",
            name: "project[template]",
            value: "angular-cli"
        });



        dependenciesInput.appendTo(form);
        templateInput.appendTo(form);
        return form;
    }

    private createCodesandboxForm(data: any) {
        const fileToSandbox: any = {
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

        data.files.forEach((f: any) => {
            fileToSandbox.files[f["path"].replace("./", "")] = {
                content: f["content"]
            }
        });

        let form = $("<form />", {
            method: "POST",
            action: this.codesandboxApiUrl,
            target: "_blank",
            style: "display: none;"
        });

        let fileInput = $("<input />", {
            type: "hidden",
            name: "parameters",
            value: this.compress(JSON.stringify(fileToSandbox))
        });

        fileInput.appendTo(form)
        return form;
    }
}