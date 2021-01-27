export interface IListNodeStart{
    items: IListNode[]
}

export interface IListNode {
    name: string;
    href: string;
    items?: IListNode[];
}
