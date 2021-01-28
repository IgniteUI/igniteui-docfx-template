export abstract class RenderingService {
    protected active = "active";
    protected expanded = "in";
    protected filtered = "filtered";
    protected show = "show";
    protected hide = "hide";
    public abstract render(): void;
}

export type StoredActiveElement = string | IActiveTocElement | null;

export type DimensionChangeType = 'increase' | 'decrease';

export type DimensionType = 'height' | 'width';

export type Merge<T, TT> = {
    [K in keyof T]: T[K]
} & TT;

export type HTMLHighlightedCodeElement = Merge<HTMLElement, IHighlighted>;

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
