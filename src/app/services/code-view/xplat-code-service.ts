import { ICodeViewFilesData, ISampleData } from "../../types";
import { XHRService } from "../jqXHR-tasks";
import { CodeService } from "./base-code-service";

export class XplatCodeService extends CodeService {
    protected samplesOrder: string[];

    private enableLiveEditing: boolean;
    private samplesCodeBasePath: string;
    private githubSourceAttrName: string;


    constructor(private xplat: string, private xhrService: XHRService) {
        super();
        this.xplat = this.xplat === "web-components" ? "wc" : this.xplat;
        this.samplesCodeBasePath = this.xplat === "wc" ? "/assets/code-viewer/" : "/code-viewer/";

        switch (this.xplat) {
            case "react":
            case "wc":
                this.samplesOrder = ['tsx', 'ts', 'html', 'css'];
                this.githubSourceAttrName = "github-src";
                this.enableLiveEditing = true;
            break;

            case "blazor":
                this.samplesOrder = ['razor', 'cs', 'js', 'css'];
                this.enableLiveEditing = false;
                delete this.codeViewLiveEditingButtonClickHandler;
                delete this.getGithubSampleUrl;
                delete this.onGithubProjectButtonClicked;
            break;
        }
    }

    public init() {
        let $codeViewElements = $("code-view");
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
                this.getSamplesContent(baseUrl, codeViewsData);
            }

            this.demosUrls.clear();
        }
    }


    private getSamplesContent(samplesBaseUrl: string, data: ISampleData[]) {
        for (const sampleData of data) {
            let sampleFileMedata = this.getSampleMetadataUrl(samplesBaseUrl, sampleData.url);
            let $codeView = sampleData.codeView;
            let metaFileFetch = $.get({
                                    url: sampleFileMedata,
                                    type: "GET",
                                    crossDomain: true,
                                    dataType: "json",
                                    success: (data: any) => this.sampleFilePostProcess(data, $codeView),
                                    error: () => this.sampleFilesFetchErrorHandler($codeView)
                                });
            this.xhrService.pushTask(metaFileFetch);
        }
    }

    private sampleFilePostProcess(data: any, $codeView: JQuery<HTMLElement>) {
        let codeViewFiles;
        const files: ICodeViewFilesData[] = data.sampleFiles;
        codeViewFiles = files.filter(f => f.isMain)
                                .sort( (a, b) => {
                                return this.samplesOrder.indexOf(a.fileHeader) - this.samplesOrder.indexOf(b.fileHeader);
                            });
        $codeView.codeView("createTabsWithCodeViews", codeViewFiles);
        if(this.enableLiveEditing && $codeView.is(`[${this.githubSourceAttrName}]`)) {
            $codeView.codeView("renderFooter", this.codeViewLiveEditingButtonClickHandler!, "csb", this.onGithubRepoButtonClickHandler!);
        }
    }

    private sampleFilesFetchErrorHandler($codeView: JQuery<HTMLElement>) {
        if(this.enableLiveEditing && $codeView.is("[" + this.githubSourceAttrName + "]")) {
            $codeView.codeView("renderFooter", this.codeViewLiveEditingButtonClickHandler!, "csb", this.onGithubRepoButtonClickHandler!);
        }
        throw new Error('Error on fetching sample files!');
    }

    private getSampleMetadataUrl(demosBaseUrl: string, sampleUrl: string): string {
        let demoFileMetadataName = sampleUrl.replace(demosBaseUrl + "/", "");
        let demoJsonPath = demosBaseUrl + this.samplesCodeBasePath + demoFileMetadataName + ".json";
        return demoJsonPath;
    }

    private onGithubProjectButtonClicked?() {
        const codeService = this;
        return ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let demosBaseUrl = $codeView.attr(codeService.demosBaseUrlAttrName)!;
            let sampleFileUrl = $codeView.attr(codeService.githubSourceAttrName)!;
            let editor = $button.hasClass(codeService.stkbButtonClass) ? "stackblitz" : "codesandbox";
            let branch = demosBaseUrl.includes("staging.infragistics.com") ? "vnext" : "master";
            window.open(codeService.getGithubSampleUrl!(editor, sampleFileUrl, branch), '_blank');
            codeService.isButtonClickInProgress = false;
        }
    }

    protected codeViewLiveEditingButtonClickHandler? = this.onGithubProjectButtonClicked!();

    private getGithubSampleUrl?(editor: string, sampleUrl: string, branch: string) {
        // if (editor === "stackblitz") return "https://stackblitz.com/github/IgniteUI/igniteui-$plat$-examples/tree/".replace("$plat$", this.xplat) + branch + "/samples/" + sampleUrl;
        // return "https://codesandbox.io/s/github/IgniteUI/igniteui-$plat$-examples/tree/".replace("$plat$", this.xplat) + branch + "/samples/" + sampleUrl + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
        const path = this.getGithubPath(sampleUrl, branch, this.xplat);
        if (editor === "stackblitz")
            return "https://stackblitz.com/github/" + path;
        else
            return "https://codesandbox.io/s/github/" + path + "?fontsize=14&hidenavigation=1&theme=dark&view=preview"
    }

    protected getGithubPath(sampleUrl: string, branch: string, platform: string): string {
        return "/IgniteUI/igniteui-$plat$-examples/tree/".replace("$plat$", platform) + branch + "/samples/" + sampleUrl;
    }

    private onGithubRepoButtonClicked?() {
        const codeService = this;
        return ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => {
            if (codeService.isButtonClickInProgress) {
                return;
            }
            codeService.isButtonClickInProgress = true;
            let demosBaseUrl = $codeView.attr(codeService.demosBaseUrlAttrName)!;
            let sampleFileUrl = $codeView.attr(codeService.githubSourceAttrName)!;
            let branch = demosBaseUrl.includes("staging.infragistics.com") ? "vnext" : "master";
            // e.g. https://github.com/IgniteUI/igniteui-blazor-examples/tree/vnext/samples/charts/category-chart/annotations
            let githubUrl = "https://github.com" + this.getGithubPath(sampleFileUrl, branch, this.xplat);
            console.log("CV opening: " + githubUrl);
            window.open(githubUrl, '_blank');
            codeService.isButtonClickInProgress = false;
        }
    }

    protected onGithubRepoButtonClickHandler? = this.onGithubRepoButtonClicked!();

}