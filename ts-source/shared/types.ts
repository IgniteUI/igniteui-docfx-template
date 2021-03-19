export type IgniteUIPlatform = "angular" | "react" | "web-components" | "blazor";

export interface ICodeViewFilesData {
    isMain: true;
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
    createTabsWithCodeViews(filesData: ICodeViewFilesData): void;
    renderFooter(liveEditingButtonsClickHandler: Function, explicitEditor: string): void;
}

export interface ICodeViewMembers {
     options: Partial<ICodeViewOptions>;
     css: Readonly<ICodeViewCSS>;
    _isIE: boolean;
    _isEdge: boolean;
    _stackblitzText: string;
    _csbText: string;
}

declare global {
    interface JQuery {
        codeView(): JQuery;
        codeView(options: ICodeViewOptions): JQuery;
        codeView(methodName: 'createTabsWithCodeViews', filesData: ICodeViewFilesData): void;
        codeView(methodName: 'renderFooter', liveEditingButtonsClickHandler: Function, explicitEditor?: string): void;
    }

    class igNavigation {
        static init():void;
    }
}

export interface IThemingData {
    origin?: string;
    theme?: string;
    themeStyle?: string;
    themeName?: string;
}