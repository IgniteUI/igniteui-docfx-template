import { CodeService } from "./base-code-service";
import util from '../utils';
import { ExplicitEditor, ICodeViewFilesData, ISampleData } from "../../types";
import { compressToBase64 } from 'lz-string';
import { XHRService } from "../jqXHR-tasks";
import stackblitz from '@stackblitz/sdk';
import { sharedFiles } from './sharedFiles';

type FileDictionary = {[path: string]: string};
const PROJECT_TEMPLATE = 'node';
const PROJECT_TAGS = ['angular', 'material', 'cdk', 'web', 'example'];

export class AngularCodeService extends CodeService {

    protected samplesOrder = ['modules', 'ts', 'html', 'scss'];
    protected codeViewLiveEditingButtonClickHandler = this.createPostApiFormFromCodeView();
    protected standaloneButtonLiveEditingClickHandler = this.createPostApiFormFromStandaloneButton();
    private stackBlitzApiUrl = "https://stackblitz.com/run";
    private codesandboxApiUrl = "https://codesandbox.io/api/v1/sandboxes/define";
    private sharedFileName = "shared.json";
    private assetsFolder = "/assets/";
    private demoFilesFolderUrlPath = this.assetsFolder + "samples/";
    private demoDVFilesFolderUrlPath = this.assetsFolder + "code-viewer/";
    private crmFileMetadataName = "grid-crm";
    private assetsRegex = new RegExp(/([\.]{0,2}\/)*assets\//g);
    private sampleFilesContentByUrl: { [url: string]: any } = {};
    private demosTimeStamp: number;
    private sharedFileContent: { [url: string]: any } = {};
    private dvSamplesPaths = ['gauges/', 'maps/', 'excel/', 'charts/'];
    private baseUrl: string;

    constructor(private xhrService: XHRService) {
        super();
    }

    public init(): void {
        let $codeViewElements = $("code-view");
        let $standaloneliveEditingButtons = $("button[data-sample-src]");

        if ($standaloneliveEditingButtons.length > 0) {
            if (util.isLocalhost) {
                this.getDemosBaseUrls($standaloneliveEditingButtons);
                for (const baseUrl of this.demosUrls.keys()) {
                    let data = this.demosUrls.get(baseUrl)!;
                    this.generateLiveEditingAngularApp(baseUrl, data);
                }
            } else {
                $standaloneliveEditingButtons.on('click', this.onAngularGithubProjectStandaloneButtonClicked());
            }
            this.clearLiveEditingData();
        }

        if ($codeViewElements.length > 0) {
            this.getDemosBaseUrls($codeViewElements);
            for (const baseUrl of this.demosUrls.keys()) {
                this.baseUrl = baseUrl;
                let codeViewsData = this.demosUrls.get(baseUrl)!;
                this.generateLiveEditingAngularApp(baseUrl, codeViewsData);

                //POST API implementation
                // if (util.isLocalhost) {
                //     this.generateLiveEditingAngularApp(baseUrl, codeViewsData);
                // } else {
                //     this.getAngularSampleFiles(baseUrl, codeViewsData, () => this.renderFooters(codeViewsData));
                // }
            }
            this.clearLiveEditingData();
        }

        if ((util.isIE || util.isEdge)) {
            $standaloneliveEditingButtons.css("display", "none");
        }
    }

    private getDemosBaseUrls($elements: any) {
        $.each($elements, (index, element) => {
            let sampleUrl;
            let $liveEditingElement = $(element);
            let samplesBaseUrl = $liveEditingElement.attr(this.demosBaseUrlAttrName)!;
            element.nodeName === 'CODE-VIEW' ? sampleUrl = $liveEditingElement.attr(this.sampleUrlAttrName)! : sampleUrl = $liveEditingElement.attr(this.buttonSampleSourceAttrName)!;
            if (!this.demosUrls.has(samplesBaseUrl)) {
                this.demosUrls.set(samplesBaseUrl, [{ url: sampleUrl, codeView: $liveEditingElement }]);
            } else {
                this.demosUrls.get(samplesBaseUrl)!.push({ url: sampleUrl, codeView: $liveEditingElement });
            }
        });
    }

    private clearLiveEditingData() {
        this.demosUrls.clear();
        this.sharedFileContent = {};
        this.sampleFilesContentByUrl = {};
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

    private getAngularGitHubSampleUrl(editor: string, sampleUrl: string, branch: string, demosBaseUrl: string) {
        const dvSample = this.isDvSample(demosBaseUrl, sampleUrl);
        if (util.isLocalhost) {
            branch = dvSample ? 'vnext' : 'vNext';
        }
        const repositoryPath = dvSample ? 'igniteui-angular-examples/tree/' : 'igniteui-live-editing-samples/tree/';
        if (editor === "stackblitz") return `https://stackblitz.com/github/IgniteUI/${repositoryPath}${branch}/${sampleUrl}`;
        return `https://codesandbox.io/s/github/IgniteUI/${repositoryPath}${branch}/${sampleUrl}`;
    }

    private getGitHubSampleUrl(demosBaseUrl: string, sampleUrl: string, gitSrc?: string) {
        // Get sample application base path
        const projectPath = demosBaseUrl.substring(demosBaseUrl.lastIndexOf("/") + 1)
        let demoPath = sampleUrl.replace(demosBaseUrl + "/", projectPath + "/");

        if (this.isDvSample(demosBaseUrl, sampleUrl) && gitSrc) {
            demoPath = 'samples/' + gitSrc;
        }
        return demoPath;
    }

    private openLiveEditingSample($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) {
        const codeService = this;
        codeService.isButtonClickInProgress = true;
        let demosBaseUrl = $codeView.attr(codeService.demosBaseUrlAttrName)!;
        let sampleFileUrl = codeService.getGitHubSampleUrl(demosBaseUrl, $codeView.attr(codeService.sampleUrlAttrName)!, $codeView.attr(codeService.githubSrc)!);
        let editor = $button.hasClass(codeService.stkbButtonClass) ? "stackblitz" : "codesandbox";
        let url = new URL(demosBaseUrl);
        let branch = url.host === "staging.infragistics.com" ? "vNext" : "master";
        window.open(codeService.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch, demosBaseUrl), '_blank');
        codeService.isButtonClickInProgress = false;
    }

    private onAngularGithubProjectButtonClicked() {
        const codeService = this;

        return ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            if ($button.hasClass(codeService.stkbButtonClass)) {
                this.createPostApiFormFromCodeView()
            } else {
                this.openLiveEditingSample($button, $codeView);
            }
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
            window.open(codeService.getAngularGitHubSampleUrl(editor, sampleFileUrl, branch, demosBaseUrl), '_blank');
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
            /**
             * Selects the explicit editor for the code view and supports "csb" and "stackblitz" as values.
             * <code-view explicit-editor="csb"</code-view>
             */
            let explicitEditor: ExplicitEditor = $codeView.attr('explicit-editor') as ExplicitEditor;
            const files: ICodeViewFilesData[] = data.sampleFiles;
            codeService.replaceRelativeAssetsUrls(files, demosBaseUrl);
            url = this.url;
            url = cb(url);
            codeService.sampleFilesContentByUrl[url] = data;
            codeViewFiles = files.filter(f =>  f.isMain)
                .sort((a: any, b: any) => {
                    return codeService.samplesOrder.indexOf(a.fileHeader) - codeService.samplesOrder.indexOf(b.fileHeader);
                });
            if ($codeView[0].nodeName === 'BUTTON') {
                $codeView.on('click', codeService.standaloneButtonLiveEditingClickHandler);
            }else {
                $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
                if (codeService.isDvSample($codeView.attr(codeService.demosBaseUrlAttrName)!, $codeView.attr(codeService.sampleUrlAttrName)!)) {
                    explicitEditor = "csb";
                }
                $codeView.codeView("renderFooter", codeService.codeViewLiveEditingButtonClickHandler, explicitEditor);
            }
        }
    }

    private angularSharedFilePostProcess(demosBaseUrl: string, cb?: () => void) {
        const codeService = this;
        return function (this: JQuery.UrlAjaxSettings, data: any) {
            const files = data.files;
            codeService.replaceRelativeAssetsUrls(files, demosBaseUrl);
            codeService.sharedFileContent[demosBaseUrl] = data;


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
        let demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "")
            .replace(/\?[\w\W]+/, '').replace(/\/$/, '');
            // Replace the trailing slash coming from angular SSR in case there is so that the request for codesandbox and stackblitz works

        let demoFileMetadataPath = '';
        if (this.isDvSample(demosBaseUrl, sampleUrl)) {
            demoFileMetadataPath = `${demosBaseUrl}${this.demoDVFilesFolderUrlPath}${demoFileMetadataName}.json`;
        } else if (demosBaseUrl + "/" === sampleUrl) {
            demoFileMetadataPath = `${demosBaseUrl}${this.demoFilesFolderUrlPath}${this.crmFileMetadataName}.json`;
        } else {
            demoFileMetadataName = demoFileMetadataName.replace("/", "--");
            demoFileMetadataPath = `${demosBaseUrl}${this.demoFilesFolderUrlPath}${demoFileMetadataName}.json`;
        }

        return demoFileMetadataPath;
    }

    private createPostApiFormFromStandaloneButton() {
        const codeService = this;
        return function (this: HTMLButtonElement) {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let $button = $(this);
            let sampleFileUrl = codeService.getAngularSampleMetadataUrl($button.attr(codeService.demosBaseUrlAttrName)!, $button.attr(codeService.buttonSampleSourceAttrName)!);
            codeService.createButtonForm(codeService.sampleFilesContentByUrl[sampleFileUrl], codeService, $button)
        }
    }

    private createPostApiFormFromCodeView() {
        const codeService = this;
        return ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }

            if (!$button.hasClass(codeService.stkbButtonClass)) {
                this.openLiveEditingSample($button, $codeView);
            } else {
                codeService.isButtonClickInProgress = true;
                let sampleFileUrl = codeService.getAngularSampleMetadataUrl($codeView.attr(codeService.demosBaseUrlAttrName)!, $codeView.attr(codeService.sampleUrlAttrName)!);
                this.isDvSample($codeView.attr(codeService.demosBaseUrlAttrName)!, $codeView.attr(codeService.sampleUrlAttrName)!) ?
                    this.createDvButtonForm(codeService.sampleFilesContentByUrl[sampleFileUrl], codeService, $button) :
                    this.createButtonForm(codeService.sampleFilesContentByUrl[sampleFileUrl], codeService, $button);
            }
        }
    }

    private createButtonForm(sampleContent: { [url: string]: any }, codeService: any, $button: JQuery<HTMLButtonElement>) {
        if (sampleContent.addTsConfig) {
            codeService.sharedFileContent.files.push(codeService.sharedFileContent.tsConfig)
        }
        let codesandboxSharedFiles = [];
        if (!$button.hasClass(codeService.stkbButtonClass)) {
            codesandboxSharedFiles = this.removeCodesandboxRedundantFiles(codeService.sharedFileContent[this.baseUrl].files)
        }
        let formData = {
            dependencies: sampleContent.sampleDependencies,
            files: codesandboxSharedFiles.concat(sampleContent.sampleFiles),
            devDependencies: codeService.sharedFileContent.devDependencies
        }

        const projectFiles = codeService.sharedFileContent[this.baseUrl].files.concat(sampleContent.sampleFiles);
        this.handleFromData(projectFiles, formData, codeService, $button);
    }

    private createDvButtonForm(sampleContent: { [url: string]: any }, codeService: any, $button: JQuery<HTMLButtonElement>) {
        if (sampleContent.addTsConfig) {
            codeService.sharedFileContent.files.push(codeService.sharedFileContent.tsConfig);
        }

        const packageJsonContent = sampleContent.sampleFiles.find((e: any) => e.path === 'package.json');
        const filteredFiles: any[] = sampleContent.sampleFiles
            .filter((sample: any) => sample.path !== "package.json" && sample.path.includes("src"))
            .map((sample: any) => {
                let filePath = sample.path.substring(sample.path.indexOf("src"));
                if (!filePath.includes("/app/")) {
                    filePath = "src/app/" + filePath.split("src/")[1];
                }
                return { path: filePath, content: sample.content };
            });

        const packageJson = JSON.parse(packageJsonContent.content);
        const deps = JSON.stringify(packageJson.dependencies);
        const devDeps = JSON.stringify(packageJson.devDependencies);

        const sampleFiles = [...filteredFiles];
        const baseUrlFiles = codeService.sharedFileContent[this.baseUrl].files.filter((e: any) => !filteredFiles.some((k: any) => k.path === e.path));
        sampleFiles.push(...baseUrlFiles);

        const projectFileToAdd = Object.entries(sharedFiles)
            .filter(([key]) => !sampleFiles.some((e) => e.path === key))
            .map(([key, value]) => ({ path: key, content: value }));
        const projectFiles = projectFileToAdd.concat(sampleFiles);

        let formData = {
            dependencies: deps,
            files: projectFiles,
            devDependencies: devDeps
        };

        this.handleFromData(projectFiles, formData, codeService, $button);
    }

    private handleFromData(projectFiles: any, formData: any, codeService: any, $button: JQuery<HTMLButtonElement>) {
        const files: FileDictionary = {};
        projectFiles.forEach((f: { path: string | number; content: any; }) => {
            files[f.path] = f.content;
        });
        const exampleMainFile = `src/index.html`;
        if ($button.hasClass(codeService.stkbButtonClass)){
            this._openStackBlitz({
                files,
                title: `Infragistics Angular Components`,
                description: `Auto-generated from: https://www.infragistics.com/products/ignite-ui-angular/angular`,
                openFile: exampleMainFile,
            });
        } else {
            let form = codeService.createCodesandboxForm(formData);
            form.appendTo($("body"));
            form.submit();
            form.remove();
        }

        codeService.isButtonClickInProgress = false;
    }

    private isDvSample(demosBaseUrl: string, sampleUrl: string) {
        let demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "")
            .replace(/\?[\w\W]+/, '');

        const dvSamplePath = this.dvSamplesPaths.find(p => demoFileMetadataName.includes(p));
        return dvSamplePath ? true : false;
    }

    private replaceRelativeAssetsUrls(files: ICodeViewFilesData[], demosBaseUrl: string) {
        let assetsUrl = demosBaseUrl + this.assetsFolder;
        let productionAssetsUrl = "https://www.infragistics.com/angular-demos-lob/assets/";

        for (let i = 0; i < files.length; i++) {
            if (files[i].content.match(this.assetsRegex)) {
                files[i].content = files[i].content.replace(this.assetsRegex, productionAssetsUrl);
            }
            // if (files[i].hasRelativeAssetsUrls) {
            //     files[i].content = files[i].content.replace(this.assetsRegex, assetsUrl);
            // }
        }
    }

    private compress(input: string) {
        return compressToBase64(input)
            .replace(/\+/g, "-") // Convert '+' to '-'
            .replace(/\//g, "_") // Convert '/' to '_'
            .replace(/=+$/, ""); // Remove ending '='
    }

    private removeCodesandboxRedundantFiles(sharedFiles: any[]){
        const webContainerFiles = ['tsconfig.json', 'tsconfig.app.json', 'package.json', '.stackblitzrc', 'src/environments/environment.ts', 'src/environments/environment.prod.ts']
        const codesandboxFiles = [];
        for (let i = 0; i < sharedFiles.length; i++) {
            if (!webContainerFiles.includes(sharedFiles[i].path)){
                codesandboxFiles.push(sharedFiles[i]);
            }
        }
        return codesandboxFiles;
    }

    private _openStackBlitz({ title, description, openFile, files }: { title: string, description: string, openFile: string, files: FileDictionary }): void {
        stackblitz.openProject({
            title,
            files,
            description,
            template: PROJECT_TEMPLATE,
            tags: PROJECT_TAGS,
        }, { openFile });
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
                        "devDependencies": JSON.parse(data.devDependencies)
                    }
                }
            }
        };

        data.files.forEach((f: any) => {
            if (f.path !== 'package.json') {
                fileToSandbox.files[f.path.replace("./", "")] = {
                    content: f["content"]
                }
            }
        });
        fileToSandbox.files['src/styles.scss'] = {
            content: ''
        }

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
