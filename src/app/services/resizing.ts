import ResizeObserver from "resize-observer-polyfill";
import { ResizableObservable, DimensionType } from "../types";;

/**
 * A singleton, whose purpose is to observe the dynamically resized elements and handle their dimeonsions changes
 */
export class ResizingService {

    /** The elements, which are going to be observed by the `ResizingService` */
    private resizables: ResizableObservable[] = [];
    
    /**
     * Adding an element to be observed
     * @param toWatch - the dynamically resizablr element, which will be observed
     */
    public observeElement(toWatch: ResizableObservable) {
        this.resizables.push(toWatch);
        this.checkIfFooterIsVisible();
    }

    /**
     * Decreasing the dimensions of the resizable observables 
     * @param subtrahend - the amount of decrease
     */
    private decrease(subtrahend: number) {
        this.resizables.forEach(r => {
            r.handleChange('decrease', subtrahend);
        });
    }

    /** The ResizeObserver, which will observe the elements resizing */
    private resizeObserver: ResizeObserver;

    constructor() {
        this.resizeObserver = new ResizeObserver(() => {
            this.checkIfFooterIsVisible();
        });

        /**
         * Every element with class `.resizable-content` is treated as a ResizableObservable
         */
        $(".resizable-content").each((_: number, element) => {
            this.resizeObserver.observe(element)
        });

        /**
         * On scroll the service checks if the footer element is visible, so that it can resize the observed elements, based on the top footers offset
         */
        $(window).on('scroll', () => {
            this.checkIfFooterIsVisible();
        });

        /** 
         * The resize event invokes the reset function for every observed elements
         */
        $(window).on('resize', () => {
            this.resetObservables()
        });
    }

    /**
     * Resets the initial dimensions values for the observed elements
     * @param dimension 
     */
    private setInitial(dimension: DimensionType) {
        this.resizables.forEach(r => {
            r.$element.css(`${dimension}`, '');
        });
    }

    /**
     * Invokes the reset function for every observed elements
     */
    public resetObservables() {
        this.resizables.forEach(r => {
            r.reset();
        });
        this.checkIfFooterIsVisible();
    }

    /**
     * Checks if the footer element is visible and resizes the observed elements, based on the top footers offset 
     */
    private checkIfFooterIsVisible() {
        let $el           = $('#footer-container'),
            scrollTop     = $(window).scrollTop()!,
            scrollBot     = scrollTop + $(window).height()!,
            elTop         = $el?.offset()!.top!,
            elBottom      = elTop + $el?.outerHeight()!,
            visibleTop    = elTop < scrollTop ? scrollTop : elTop,
            visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
        if (visibleTop < visibleBottom) {
            this.decrease((visibleBottom - visibleTop));
        } else {
            this.setInitial('height');
        }
    }
}