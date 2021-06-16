export type IgniteUIPlatform = "angular" | "react" | "web-components" | "blazor";

/**
 * Used for specifying, which dimension of the `ResizeObservable` the `ResizeService` should observe and update.
 */
export type DimensionType = 'height' | 'width';

/**
 * Used for specifying, how the specified dimension of the `ResizeObservable` the `ResizeService` will update.
 */
 export type DimensionChangeType = 'increase' | 'decrease';

/**
 * When a navigation occurs, what should be used, [pushState](https://developer.mozilla.org/en-US/docs/Web/API/History/pushState), [replaceState](https://developer.mozilla.org/en-US/docs/Web/API/History/replaceState) or nothing(e.g. when the navigation is invoked from popstata event).
 */
export type HistoryStateAction = "push" | "replace" | "none";

/**
 * Merge two types into one
 */
type Merge<T, TT> = {
    [K in keyof T]: T[K]
} & TT;

/**
 * The default navigation handler type.
 * @param adjustTocScrollPosition - indicates whether the TOC will scroll to the active element
 * @param scrollPosition - The scroll position of the page
 */
export type NavigationHandler = (adjustTocScrollPosition: boolean, scrollPosition?: number) => Promise<void>;

/**
 * The object, which should be passed when a navigation occurs.
 * @member stateAction - the action, which the [history](https://developer.mozilla.org/en-US/docs/Web/API/History) object must take when navigation occurs
 * @member adjustTocScrollPosition - whether the TOC should scroll to the active element or not
 * @member scrollPosition - the scrollPosition of the body element. Used mainly from the onpopstate event, so that the scroll in the topic can be preserved.
 * @member navigationPostProcess - A custom callback, which will be invoked after the navigation occurs and after the default callback. 
 */
export interface INavigationOptions {
    stateAction: HistoryStateAction,
    adjustTocScrollPosition?: boolean
    scrollPosition?: number,
    navigationPostProcess?: () => void
}

/**
 * A helper type for the Hihlighted elements
 */
type IHighlighted = {
    result: {
        language: string;
        re?: number;
    }
}

/**
 * Type for <code> elements, which are used from [highlight.js](https://highlightjs.org/)
 */
export type HTMLHighlightedCodeElement = Merge<HTMLElement, IHighlighted>;

/**
 * The type of object, which the code views work with
 * @member isMain - Whether the code view should render a tab with tab content for a file
 * @member path - The path of the file (which will be used as a file structure in CSB/Stackblitz apps)
 * @member hasRelativeAssetsUrls - Inidicates whether the file contains relative path to the assets folder (only for angular platform)
 * @member content - The content of the file
 * @member fileExtension - The extension of the file
 * @member fileHeader - The text, which will be rendered in the tab header in the code view
 */
export interface ICodeViewFilesData {
    isMain: boolean;
    path: string;
    hasRelativeAssetsUrls: boolean;
    content: string;
    fileExtension:string;
    fileHeader: string;
}

/**
 * The css classes of its main elements
 */
export interface ICodeViewCSS {
    navbar:string;
    tab:string;
    viewContainer:string;
    tabContent:string,
    footer:string
    stackblitz:string
    csb:string
}

/**
 * JQuery elements, used as its main elements 
 */
export interface ICodeViewElements {
    $navbar: JQuery<HTMLElement>,
    $codeViewsContainer: JQuery<HTMLElement>,
    $activeTab: JQuery<HTMLElement>,
    $activeView: JQuery<HTMLElement>,
    $footer: JQuery<HTMLElement>
}

/**
 * Type for the main properties of a code view
 * @member files - the files, whose contents the code view renders
 * @member iframeId - the id of the sample iframe
 * @member onLiveEditingButtonClick - click handler for the CSB/Stackblitz buttons
 */
export interface ICodeViewOptions {
    files?: ICodeViewFilesData[],
    iframeId?: string | number,
    onLiveEditingButtonClick?: Function
}

/**
 * Interface for the code view events, which the code view must implement
 * @member _create - the creation function of the code view widget
 * @member _codeViewTabClick - click handler, invoked when a tab gets clicked
 * @member createTabsWithCodeViews - function, which creates the tabs and their corresponding contents
 * @member renderFooter - function, which renders the footer
 */
export interface ICodeViewEvents {
    _create(): void;
    _codeViewTabClick(event: MouseEvent): void;
    createTabsWithCodeViews(filesData: ICodeViewFilesData[]): void;
    renderFooter(liveEditingButtonsClickHandler: Function, explicitEditor?: string): void;
}

/**
 * Interface, which the code view must implement, regarding its main members
 */
export interface ICodeViewMembers {
     options: Partial<ICodeViewOptions>;
     css: Readonly<ICodeViewCSS>;
    _stackblitzText: string;
    _csbText: string;
}

/**
 * Type for the object, which is used for theming purposes (when the theming widget is enabled)
 */
export interface IThemingData {
    origin?: string;
    theme?: string;
    themeStyle?: string;
    themeName?: string;
}

/**
 * An abstract class, which every rendering service must implement. 
 * This type of class is used as the main rendering mechanism in the template.
 * Each derived class must implement the render function, which renders a main element in the docfx site (e.g TOC, affix, navbar...).
 */
export abstract class RenderingService {
    protected active = "active";
    protected expanded = "in";
    protected filtered = "filtered";
    protected show = "show";
    protected hide = "hide";
    public abstract render(): void;
}

/**
 * Interface for elements that have dynamic resizing. These type of elements are handled by the `ResizingService`
 * @member $element - the JQuery element, which has a dynamic resizing
 * @member initialDimension - the initial value of the dimension
 * @member dimensionToObserve - to observe the width or hieght
 * @member reset - the function, which resets the dimension of the element
 * @member handleChange - the function, which handles the dimension change of the element 
 */
export interface ResizableObservable {
    readonly $element: JQuery<HTMLElement>;
    initialDimension: number;
    dimensionToObserve: DimensionType;
    reset: () => void;
    handleChange: (change: DimensionChangeType, newValue: number) => void;
}

/**
 * Interface for a header element in the TOC 
 */
export interface TOCHeaderElement {
    header: JQuery<HTMLLIElement>,
    children: JQuery<HTMLLIElement>[]
}

/**
 * The root element in a wannabe list structure
 */
export interface IListNodeStart{
    items: IListNode[]
}

/**
 * An node object in a wannabe list structure
 */
export interface IListNode {
    name: string;
    href: string;
    items?: IListNode[];
}

/**
 * A type for the example samples in a topic. 
 * Each sample has a url and codeview, whose purpose is to render the sample itself and its main files 
 */
export interface ISampleData {
    url: string,
    codeView: JQuery<HTMLElement>
}

/**
 * A type used for the metadata elements in the <head> tag.
 * These elements are replaced on every navigation and the search for them a query must be constructed.
 * This query has the structure `{tag}{attributeSelector}={valueSelector}`
 * @member tag - the tag of the element (mainly the <meta> and <link> elements are used)
 * @member attributeSelector - the attribute, which will be used as a search query alongside its `valueSelector` for the respective element in the <head>
 * @member valueSelector - the value of the `attributeSelector`
 */
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
    /**
     * This way we declare the additional functions that we use with JQuery (e.g.Custom widget creation)
     */
    interface JQuery {
        codeView(): JQuery;
        codeView(options: ICodeViewOptions): JQuery;
        codeView(methodName: 'createTabsWithCodeViews', filesData: ICodeViewFilesData[]): void;
        codeView(methodName: 'renderFooter', liveEditingButtonsClickHandler: ($button: JQuery<HTMLButtonElement>, $codeView: JQuery<HTMLElement>) => void, explicitEditor?: string): void;
        collapse(action: string): void;
        twbsPagination(options: Partial<TwbsPaginationOptions>): void
        mark(word: string, options?: IMarkJsOptions ): void;
    }

    /**
     * The igNavigation init function. 
     * The igNavigation object comes from this script: https://infragistics.com/assets/modern/scripts/navigation.js, 
     * invoked in the 'scripts.tmpl.partial' and we declare its respective type in the typescript [global module](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/global-modifying-module-d-ts.html)
     */
    class igNavigation {
        static init():void;
    }
}
