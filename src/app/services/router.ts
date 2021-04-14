import { XHRService } from "./jqXHR-tasks";
import { debounceTime} from 'rxjs/operators';
import { fromEvent } from 'rxjs';
import util from './utils';

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
    private defaultHandler: (scrollPosition?: number) => Promise<void>;

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

    public connect(targetEle: JQuery<HTMLElement>, navigationHandler: () => Promise<void>) {
        this._targetEle = targetEle;
        this.defaultHandler = navigationHandler;
        let currentPathName = window.location.pathname.substring(this._baseUrl?.length! - 1);
        let pathName = currentPathName === this._baseUrl ? $("body").attr("initial-page")! : currentPathName;

        console.log("Router connected " + pathName);

        fromEvent<PopStateEvent>(window, 'popstate')
            .pipe(
                debounceTime(150),
            ).subscribe((e) => {
                let isCurrentPage = this.currentPage === util.toAbsoluteURL(location.pathname);
                if (isCurrentPage) 
                    util.scroll(util.hasLocationHash() ? location.hash : undefined);
                else if (util.hasLocationHash()) 
                    this.navigateTo(location.pathname, false, undefined, () => setTimeout(() => util.scroll(location.hash, false)));
                else if (e.state?.scrollPosition != null) 
                    this.navigateTo(location.pathname, false, e.state?.scrollPosition);
                else 
                    this.navigateTo(location.pathname, false);
            });
    }

    public navigateTo(route: string, push = true, scrollPosition?: number, cb?: () => void) {

        if (!this.xhrService.isEmpty()) this.xhrService.abortTasks();

        if (!route) return;

        if (util.isOnIndexPage()) {
            route = $("meta[name=index]").attr("content")!;
        }

        console.log("Navigate to " + route);

        let target = util.isRelativePath(route) ? util.toAbsoluteURL(route) : route;
        this.currentPage = target;

        if (push) {
            window.history.pushState(
                { scrollPosition: 0 },
                "",
                target
            );
        }

        this._targetEle.load(`${target} #_content`, async (e) => {
            await this.defaultHandler(scrollPosition ?? 0);
            if (cb) cb();
        });
    }
}