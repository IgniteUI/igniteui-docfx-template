export interface ISearchItem {
    href: string,
    title: string,
    keywords: string
}

export interface ILunr {
    index?: lunr.Index;
    data: ISearchData
}

export interface ISearchData {
    [ref: string]: ISearchItem
}