import { ISampleData } from "../../types";

export abstract class CodeService {

    protected stkbButtonClass = "stackblitz-btn";
    protected buttonSampleSourceAttrName = "data-sample-src";
    protected demosBaseUrlAttrName = "data-demos-base-url";
    protected sampleUrlAttrName = "iframe-src";
    protected isButtonClickInProgress = false;
    protected demosUrls: Map<string, ISampleData[]> = new Map();

    protected abstract samplesOrder: string[];
    protected abstract codeViewLiveEditingButtonClickHandler?($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>): void;

    public abstract init(): void;
}

