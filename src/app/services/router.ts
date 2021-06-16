import { XHRService } from "./jqXHR-tasks";
import { debounceTime} from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import util from './utils';
import meta from './meta';
import { INavigationOptions, NavigationHandler } from "../types";

/**
 * Version [3.0.0](https://github.com/IgniteUI/igniteui-docfx-template/releases/tag/3.0.0) introduces the Single Page Application of the docfx site.
 * The building blocks of the SPA is the `Router`, which renders content, based on a specified route and adds the occured navigation in the browser history so that the 
 * clients can easily navigate backwards/forwards in the browser history
 */
export class Router {

    /** The router is a Singleton and this is the variable, which holds the router's instance */
    private static instance: Router;
    /** Returns the router's instance */
    public static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return this.instance;
    }

    /** Current page URL */
    private currentPage: string;

    /** 
     * The element, which the router will attach to. 
     * The target element loads the content of the articles. 
     */
    private _targetEle: JQuery<HTMLElement>;

    /**
     * The default navigation handler. 
     * This function is invoked on every occured navigation
     */
    private defaultHandler: NavigationHandler;

    /**
     * @param xhrService - the XMLHTMLRequst service, which contains every request made in the docfx site
     */
    constructor(private xhrService = XHRService.getInstance()) {
        /**
         * The [`scrollRestoration`](https://developer.mozilla.org/en-US/docs/Web/API/History/scrollRestoration) by default is handled by the browser.
         * When a client navigates in the browser history the browser caches the scroll position of the body which the client has been reached prior the new navigation.
         * Navigating backwards/forwards in the history the browser restores the cached scroll position automatically.
         * In the docfx site swe have our own logic for scroll restoration, but not all browsers [support this](https://caniuse.com/?search=scrollRestoration).
         * We replace the history data, with the new scroll position
         */
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
            fromEvent(window, 'scroll').pipe(debounceTime(250)).subscribe(() => {
                setTimeout(() => {
                    history.replaceState({ scrollPosition: $(window).scrollTop() }, "");
                });
            });
        }
        this.currentPage = util.toAbsoluteURL(location.pathname);
    }

    /**
     * The connector function, which connects the router to the element, which will render content based on the provided URL
     * @param targetEle - the element, which will render the content
     * @param navigationHandler - the default function, which will be invoked after every navigation
     */
    public connect(targetEle: JQuery<HTMLElement>, navigationHandler: NavigationHandler) {
        this._targetEle = targetEle;
        this.defaultHandler = navigationHandler;

        /**
         * The [`popstate`](https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event) event is invoked when a browser history navigation occurs.
         */
        fromEvent<PopStateEvent>(window, 'popstate')
            .pipe(
                debounceTime(150),
            ).subscribe((e) => {
                let options: INavigationOptions = {
                    stateAction: 'none'
                }

                /**
                 * If we are navigating in the current page, we are basically switching the hash in the URL and we just scroll to the anchor containing this hash.
                 * If the hash is not recognized we scroll to the top of the page.
                 */
                let isCurrentPage = this.currentPage === util.toAbsoluteURL(location.pathname);
                if (isCurrentPage) {
                    util.scroll(util.hasLocationHash() ? location.hash : undefined);
                    return;
                }
                /**
                 * If we are not on the current page and the URL contains a hash, after the navigation occurs we scroll to that hash.
                 */
                if (util.hasLocationHash())
                    options.navigationPostProcess = () => setTimeout(() => util.scroll(location.hash, false));
                /** If the history data contains scrollPosition then we scroll to this position after the navigation occurs
                 */
                else if (e.state?.scrollPosition != null)
                    options.scrollPosition = e.state?.scrollPosition;

                this.navigateTo(location.pathname, options);
            });
    }

    /**
     * Router's navigation function
     * @param route - the route/path, to which the `Router` will navigate
     * @param options - the navigation options for the incomming navigation
     */
    public navigateTo(route: string, options: INavigationOptions = {stateAction: "push"}): void {

        /** If the xhrService contains unresolved requests we abort these request, because they are no longer needed for the current page as we are navigating to another */
        if (!this.xhrService.isEmpty()) this.xhrService.abortTasks();

        if (!route) return;

        if(util.removeHTMLExtensionFromUrl) {
            route =  route.replace(".html", "");
        }

        if (util.isOnIndexPage(route)) {
            route = $("meta[name=index]").attr("content")!;
            options.stateAction = "replace";
        }

        console.log("Navigate to " + route);

        let target = util.isRelativePath(route) ? util.toAbsoluteURL(route) : route;
        this.currentPage = target;

        if (options.stateAction === 'push') {
            window.history.pushState(
                { scrollPosition: 0 },
                "",
                target
            );
        }

        if(options.stateAction === 'replace') {
            window.history.replaceState(
                { scrollPosition: 0 },
                "",
                target
            );
        }

        /** Here the routers target element loads the content from the requested html page */
        this._targetEle.load(`${target} #_content`, async (data) => {
            if(data) {
                let parsedDOM = $("<div>").append($.parseHTML(data));
                /** Replacing the mandatory metadata (title, meta tags, links, etc.) with the metadata of the new page */
                meta.configureMetadata(parsedDOM);
                
                /** GTM tracking */
                (window as any).dataLayer.push({
                    'event': 'trackSPAPageview',
                    'pagePath': location.pathname,
                    'pageTitle': window.document.title
                });

                await this.defaultHandler(options.adjustTocScrollPosition ?? true,  options.scrollPosition ?? 0);
                
                if(options.navigationPostProcess)
                    options.navigationPostProcess();
            }
        });
    }
}