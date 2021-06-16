/**
 * Searched item, returned by global search
 */
export interface ISearchItem {
    href: string,
    title: string,
    keywords: string
}

/**
 * Instance of a lunr search
 */
export interface ILunr {
    index?: lunr.Index;
    data: ISearchData
}

/**
 * The data to be searched 
 */
export interface ISearchData {
    [ref: string]: ISearchItem
}