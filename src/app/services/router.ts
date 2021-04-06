export class Router {

    private static _instance: Router;
    public static get instance(): Router {
        if (this._instance === null) {
            this._instance = new Router()
        }

        return this._instance;
    }

    private _targetEle: JQuery<HTMLElement>;
    private _baseUrl = $("base").attr("href");
    private defaultHandler: () => void;
    constructor() {
    }

    public connect(targetEle: JQuery<HTMLElement>, navigationHandler: () => void) {
        this._targetEle = targetEle;
        this.defaultHandler = navigationHandler;
        let currentPathName = window.location.pathname.substring(this._baseUrl?.length! - 1);
        let pathName = currentPathName === this._baseUrl ? $("body").attr("initial-page")! : currentPathName;

        console.log("Router connected " + pathName);

        window.onpopstate = () => {
            this.navigateTo(window.location.pathname, false);
        }

        let func =  (e: any) => {
            console.log(e)
        }

        window.addEventListener('hashchange', func, false);

    }

    public navigateTo(route: string, push = true, cb?: () => void) {

        if(!route) return;
        console.log("SB navigateTo " + route);
        let target = window.location.origin + this._baseUrl + (route.startsWith("/") ? route.replace("/", "") : route);
        if (push) {
            window.history.pushState(
                {},
                "",
                target
            );
        }
        this._targetEle.load(`${target} #_content`, () => (cb ?? this.defaultHandler)());
    }
}