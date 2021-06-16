export type IgniteUIPlatform = "angular" | "react" | "web-components" | "blazor";

export type DimensionChangeType = 'increase' | 'decrease';

export type DimensionType = 'height' | 'width';

export type HistoryStateAction = "push" | "replace" | "none";

export type ExplicitEditor = "csb" | "stackblitz";

type Merge<T, TT> = {
    [K in keyof T]: T[K]
} & TT;

export type NavigationHandler = (adjustTocScrollPosition: boolean, scrollPosition?: number) => Promise<void>;

export interface INavigationOptions {
    stateAction: HistoryStateAction,
    adjustTocScrollPosition?: boolean
    scrollPosition?: number,
    navigationPostProcess?: () => void
}

export type HTMLHighlightedCodeElement = Merge<HTMLElement, IHighlighted>;

export interface IScrollPosition{
    toc: number;
    article: number
}
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
    renderFooter(liveEditingButtonsClickHandler: Function, explicitEditor?: ExplicitEditor): void;
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

export interface IHeadEl {
    tag: string;
    attributeSelector: string,
    valueSelector: string,
    attributeSelectorValue?: string
}

// More information about the twbs pagination options - https://josecebe.github.io/twbs-pagination/
interface TwbsPaginationOptions {
    totalPages: number,
    startPage: number,
    visiblePages: number,
    initiateStartPageClick: boolean,
    hideOnlyOnePage: boolean,
    href: boolean,
    pageVariable: string,
    totalPagesVariable: string,
    page: Function,
    first: string,
    prev: string,
    next: string,
    last: string,
    loop: boolean,
    beforePageClick: Function,
    onPageClick: Function,
    paginationClass: string,
    nextClass: string,
    prevClass: string,
    lastClass: string,
    firstClass: string,
    pageClass: string,
    activeClass: string,
    disabledClass: string,
    anchorClass: string,
}


//More information about the mark.js options - https://markjs.io/
interface IMarkJsOptions{
  element?: string,
  className?: string,
  exclude?: string[],
  iframes?: boolean,
  iframesTimeout?: number,
  separateWordSearch?: boolean,
  diacritics?: boolean,
  synonyms?: {[key: string]: string},
  accuracy?: 'partially' | 'exactly' | 'complementary' ,
  acrossElements?: boolean,
  caseSensitive?: boolean,
  ignoreJoiners?: boolean,
  ignoreGroups?: number,
  ignorePunctuation?: string[],
  wildcards?: 'disabled' | 'enabled' | 'withSpaces',
  each?: () => {},
  noMatch?: () => {},
  filter?: () => true,
  done?: () => {},
  debug?: boolean,
  log?: typeof console.log
}

declare global {
    interface JQuery {
        codeView(): JQuery;
        codeView(options: ICodeViewOptions): JQuery;
        codeView(methodName: 'createTabsWithCodeViews', filesData: ICodeViewFilesData[]): void;
        codeView(methodName: 'renderFooter', liveEditingButtonsClickHandler: ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => void, explicitEditor?: ExplicitEditor): void;
        collapse(action: string): void;
        twbsPagination(options: Partial<TwbsPaginationOptions>): void
        mark(word: string, options?: IMarkJsOptions ): void;
    }

    class igNavigation {
        static init():void;
    }
}
