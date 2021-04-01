export type IgniteUIPlatform = "angular" | "react" | "web-components" | "blazor";

export type StoredActiveElement = string | IActiveTocElement | null;

export type DimensionChangeType = 'increase' | 'decrease';

export type DimensionType = 'height' | 'width';

type Merge<T, TT> = {
    [K in keyof T]: T[K]
} & TT;

export type HTMLHighlightedCodeElement = Merge<HTMLElement, IHighlighted>;
export interface ICodeViewFilesData {
    isMain: boolean;
    path: string;
    hasRelativeAssetsUrls: boolean;
    content: string;
    fileExtension:string;
    fileHeader: string;
}

export interface ICodeViewCSS {
    navbar:string;
    tab:string;
    viewContainer:string;
    tabContent:string,
    footer:string
    stackblitz:string
    csb:string
}

export interface ICodeViewElements {
    $navbar: JQuery<HTMLElement>,
    $codeViewsContainer: JQuery<HTMLElement>,
    $activeTab: JQuery<HTMLElement>,
    $activeView: JQuery<HTMLElement>,
    $footer: JQuery<HTMLElement>
}

export interface ICodeViewOptions {
    files?: ICodeViewFilesData[],
    iframeId?: string | number,
    onLiveEditingButtonClick?: Function
}

export interface ICodeViewEvents {
    _create(): void;
    _codeViewTabClick(event: MouseEvent): void;
    createTabsWithCodeViews(filesData: ICodeViewFilesData[]): void;
    renderFooter(liveEditingButtonsClickHandler: Function, explicitEditor?: string): void;
}

export interface ICodeViewMembers {
     options: Partial<ICodeViewOptions>;
     css: Readonly<ICodeViewCSS>;
    _stackblitzText: string;
    _csbText: string;
}

export interface IThemingData {
    origin?: string;
    theme?: string;
    themeStyle?: string;
    themeName?: string;
}

export abstract class RenderingService {
    protected active = "active";
    protected expanded = "in";
    protected filtered = "filtered";
    protected show = "show";
    protected hide = "hide";
    public abstract render(): void;
}

export interface IHighlighted {
    result: {
        language: string;
        re?: number;
    }
}

export interface IActiveTocElement {
    id: string;
    top: number
}

export interface ResizableObservable {
    readonly $element: JQuery<HTMLElement>;
    initialDimension: number;
    dimensionToObserve: DimensionType;
    reset: () => void;
    handleChange: (change: DimensionChangeType, newValue: number) => void;
}

export interface TOCHeaderElement {
    header: JQuery<HTMLLIElement>,
    children: JQuery<HTMLLIElement>[]
}

export interface IListNodeStart{
    items: IListNode[]
}

export interface IListNode {
    name: string;
    href: string;
    items?: IListNode[];
}

export interface IPageInfo {
    pageName?: string;
    title?: string;
    fileName?: string;
    path?: IPageInfoPath
    isContentPage?: boolean;
}

export interface IPageInfoPath {
    navigation?: string;
    service?: string;
    noExt?: string;
    api?: string;
    ext?: string;
}

export interface ISampleData {
    url: string,
    codeView: JQuery<HTMLElement>
}

declare global {
    interface JQuery {
        codeView(): JQuery;
        codeView(options: ICodeViewOptions): JQuery;
        codeView(methodName: 'createTabsWithCodeViews', filesData: ICodeViewFilesData[]): void;
        codeView(methodName: 'renderFooter', liveEditingButtonsClickHandler: ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => void, explicitEditor?: string): void;
    }

    class igNavigation {
        static init():void;
    }
}
