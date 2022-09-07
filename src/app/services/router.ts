import { XHRService } from "./jqXHR-tasks";
import { debounceTime} from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import util from './utils';
import meta from './meta';
import { INavigationOptions, NavigationHandler } from "../types";
import { NavbarRenderingService } from "./rendering";
export class Router {

    private static instance: Router;
    public static getInstance(): Router {
        if (!Router.instance) {
            Router.instance = new Router();
        }
        return this.instance;
    }

    private currentPage: string;
    private _targetEle: JQuery<HTMLElement>;
    private _baseUrl = $("base").attr("href");
    private defaultHandler: NavigationHandler;
    private navbarService = new NavbarRenderingService();


    constructor(private xhrService = XHRService.getInstance()) {
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

    public connect(targetEle: JQuery<HTMLElement>, navigationHandler: NavigationHandler) {
        this._targetEle = targetEle;
        this.defaultHandler = navigationHandler;
        let currentPathName = window.location.pathname.substring(this._baseUrl?.length! - 1);
        let pathName = currentPathName === this._baseUrl ? $("body").attr("initial-page")! : currentPathName;

        console.log("Router connected " + pathName);

        fromEvent<PopStateEvent>(window, 'popstate')
            .pipe(
                debounceTime(150),
            ).subscribe((e) => {
                let options: INavigationOptions = {
                    stateAction: 'none'
                }

                let isCurrentPage = this.currentPage === util.toAbsoluteURL(location.pathname);
                if (isCurrentPage) {
                    util.scroll(util.hasLocationHash() ? location.hash : undefined);
                    return;
                }
                if (util.hasLocationHash())
                    options.navigationPostProcess = () => setTimeout(() => util.scroll(location.hash, false));
                else if (e.state?.scrollPosition != null)
                    options.scrollPosition = e.state?.scrollPosition;
                this.navigateTo(location.pathname, options);
            });
    }

    public navigateTo(route: string, options: INavigationOptions = {stateAction: "push"}) {
        if (!this.xhrService.isEmpty()) this.xhrService.abortTasks();

        if (!route) return;

        this.navbarService.changeHelloBarContent(route);

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

        this._targetEle.load(`${target} #_content`, async (data) => {
            if(data) {
                let parsedDOM = $("<div>").append($.parseHTML(data));
                meta.configureMetadata(parsedDOM);
                
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