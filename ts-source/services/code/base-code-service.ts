import { ISampleData } from "../../shared/types";

export abstract class CodeService {

    protected stkbButtonClass = "stackblitz-btn";
    protected buttonSampleSourceAttrName = "data-sample-src";
    protected demosBaseUrlAttrName = "data-demos-base-url";
    protected sampleUrlAttrName = "iframe-src";
    protected isIE = navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > 0;
    protected isEdge = navigator.userAgent.indexOf('Edge') !== -1;
    protected isButtonClickInProgress = false;
    protected demosUrls: Map<string, Set<ISampleData>> = new Map();

    protected abstract samplesOrder: string[];
    protected abstract codeViewLiveEditingButtonClickHandler($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>): void;

    public abstract init(): void;
}

