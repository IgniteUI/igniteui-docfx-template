import ResizeObserver from "resize-observer-polyfill";
import { ResizableObservable, DimensionType } from "./common";

export class ResizingService {

    private resizables: ResizableObservable[] = [];

    public observeElement(toWatch: ResizableObservable) {
        this.resizables.push(toWatch);
        this.checkIfFooterIsVisible();
    }

    private decrease(subtrahend: number) {
        this.resizables.forEach(r => {
            r.handleChange('decrease', subtrahend);
        });
    }

    private resizeObserver: ResizeObserver;

    constructor() {
        this.resizeObserver = new ResizeObserver(() => {
            this.checkIfFooterIsVisible();
        });

        $(".resizable-content").each((_: number, element) => {
            this.resizeObserver.observe(element)
        });

        $(window).on('scroll', () => {
            this.checkIfFooterIsVisible();
        });

        $(window).on('resize', () => {
            this.resizables.forEach(r => {
                r.reset();
            });
            this.checkIfFooterIsVisible();
        });
    }

    private setInitial(dimension: DimensionType) {
        this.resizables.forEach(r => {
            r.$element[dimension](r.initialDimension);
        })
    }

    private checkIfFooterIsVisible() {
        let $el = $('#footer-container'),
            scrollTop = $(window).scrollTop()!,
            scrollBot = scrollTop + $(window).height()!,
            elTop = $el?.offset()!.top!,
            elBottom = elTop + $el?.outerHeight()!,
            visibleTop = elTop < scrollTop ? scrollTop : elTop,
            visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
        if (visibleTop < visibleBottom) {
            this.decrease((visibleBottom - visibleTop));
        } else {
            this.setInitial('height');
        }
    }
}