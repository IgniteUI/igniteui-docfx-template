import { IPageInfo } from "../types";

export class IgViewer {

    private static instance: IgViewer;
    public static getInstance(): IgViewer {
        if(!IgViewer.instance) {
            IgViewer.instance = new IgViewer();
        }
        return this.instance;
    }

    public contentContainerId= '#document-content-container';
    public contentElementId='#document-content';
    public contentFolderName= 'help';
    public homePages = ["index", "home-page"];
    public topicAPI = "";
    public isOnline = false;
    public baseURI = (window as any)?.baseURI ?? "";
    public $errorPublishedMessage = $('#error-published-message');
    public $footer = $('#footer-container');
    
    private $window = $(window);
    private windowWidth = this.$window.width();
    private $topButton = $('#top-button');
    private $sidebar = $('.nav-sidebar');
    private $body = $('body');
    private $mainBox = $(".main-box");
    private $navContainer:JQuery<HTMLElement> & Partial<{collapse(mode: any): void }> = $('#nav-container');
    private $content: JQuery<HTMLElement>;
    private _currentPageInfo: IPageInfo = {};

    constructor () { 
        let self = this;
        this.$topButton.children('button').on("click", () => {
            self.scrollToTop();
            (this as unknown as HTMLElement).blur();
        });
    
        this.$errorPublishedMessage.on("click", ".close", () => {
            self.$errorPublishedMessage.fadeOut();
        });
    
        this.isOnline = $('body').attr('data-mode') === "online";
        this.baseURI = this.toAbsoluteURL(this.baseURI);
    
        this.currentPageInfo = this.getPageInfo(this.getPageNameFromLocation());
    
        this.adjustTopLinkPos();
        this.refreshHash();
        this.$window.on("scroll",this.adjustTopLinkPos.bind(this));
        this.$window.one("load", this.syncSidebarHeight.bind(this));

        if (this.$mainBox.length === 1) {
            this.addImgResponsiveClass(this.$mainBox);
        }

        //init collapse widget w/o toggle
        this.$navContainer.collapse!({ toggle: false });
        this.showOrHideNavigation();

        this.$window.on('resize', this.showOrHideNavigation.bind(this));
    }

    public set currentPageInfo(info: IPageInfo) {
        if (info) {
            this._currentPageInfo = info;
        }
    }

    public get currentPageInfo() {
        return this._currentPageInfo;
    }

    public versionQuery(q?: string): string {
        let query = q || window.location.search;
        let version = query.match(/[\?&]v=(\d\d\.\d)/);
        if (version && version[1]) {
            return '?v=' + version[1];
        }
        return "";
    }

    
    public isContentPage(): boolean {
        if (this.isOnIndexPage()) {
            return true;
        }
        return false;
    }
    
    public getPageInfo(fileName: string, title?: string): IPageInfo {
        let pageName = fileName.replace(/\.html(?=\?|$)/i, '').toLowerCase();
        // TODO: better home pages handling
        if (this.isOnIndexPage(pageName) && !this.isOnline && this.baseURI) {
            this.baseURI = "../";
        }
        
        let ext = this.baseURI + fileName,
        noExt = this.baseURI + pageName,
        api = this.topicAPI + pageName;
        
        let info: IPageInfo = {
            title: title,
            fileName: fileName,
            pageName: pageName,
            path: {
                navigation: this.isOnline ? noExt : ext,
                service: this.isOnline ? api : ext,
                noExt: noExt,
                api: api,
                ext: ext
            },
            isContentPage: this.isContentPage()
        };
        
        return info;
    }
    
    public getPageNameFromLocation() {
        let pathParts = window.location.pathname.split('/');
        pathParts = this.clean(pathParts, '');
        let name = this.isOnline ? "" : this.homePages[2];
        
        if (pathParts.length > 1) {
            name = this.isOnline ? pathParts.pop()!.toLowerCase() : pathParts.pop()!;
        }
        
        //append version to the path:
        name += this.versionQuery();
        
        return decodeURIComponent(name);
    }

    public isOnIndexPage(page?: string): boolean {
        if (!page) {
            let pathname = location.protocol + "//" + location.host + location.pathname;
            if (pathname === this.baseURI) {
                return true;
            }
            page = pathname.replace(this.baseURI, "");
        };
        return this.homePages.includes(page);
    }

    public isCurrentPage(path?: string, query?: string): boolean {
        path = path || window.location.protocol + "//" + window.location.host + window.location.pathname;
        path += this.versionQuery(query);
        return this.currentPageInfo.path!.navigation == path;
    }

    public isUsingWebServer(): boolean {
        let protocol = window.location.protocol;
        return (protocol === 'http:' || protocol === 'https:');
    }

    public isSmallDeviceWidth(): boolean {
        return this.$window.width()! < 768;
    }

    public hasLocationHash(): boolean {
        return "hash" in window.location && window.location.hash.length > 0;
    }

    public refreshHash() {
        //D.P. this actually works better than changing the hash back and forth, no extra history entries.
        if (this.hasLocationHash()) {
            window.location.assign(window.location.href);
        }
    }

    public scrollToTop() {
        $('html, body').animate({ scrollTop: 0 }, 'fast');
    }

    public adjustTopLinkPos(): void {
        let scrollPos = this.$window.height()! + this.$window.scrollTop()!;
        let footerTop = this.$footer.offset()!.top;
        if (scrollPos > footerTop) {
            this.$topButton.css({ position: "absolute" });
        }
        else {
            this.$topButton.css({ position: "fixed" });
        }
    }

    public publishErrorToServer(error: Error): void {
        let errorText;

        if (error.message) {
            errorText = ' Message: ' + error.message;
        }

        if (error.stack) {
            errorText += ' Stack: ' + error.stack;
        }

        let msg = {
            errorText: errorText,
            url: window.document.location.href
        };

        $.post('api/error', msg);

        this.$errorPublishedMessage.fadeIn();
    }

    public syncSidebarHeight(): void {
        let contentMinHeight = undefined,
            sidebarHeight = this.$sidebar.height()!;
        this.$content = this.$content ?? $(this.contentContainerId).parent();
        contentMinHeight = this.$content.data("defaultMinHeight");
        if (contentMinHeight === undefined) {
            contentMinHeight = parseInt(this.$content.css("minHeight"), 10);
            this.$content.data("defaultMinHeight", contentMinHeight);
        }

        if (sidebarHeight > contentMinHeight) {
            this.$content.css("minHeight", sidebarHeight);
        } else {
            this.$content.css("minHeight", contentMinHeight);
        }
    }

    public toAbsoluteURL(relative: string): string {
        let a = window.document.createElement('a');
        a.href = relative;
        return a.href;
    }

    public getProductList(): string[] {
        let value = this.$body.attr('data-product-list');
        let list:string[] = [];

        if (value !== undefined) {
            list = value.split('|');
        }
        return list;
    }

    public isDvPage(): boolean {
        var pageName = this.getPageNameFromLocation();
        return pageName.includes("chart") ||
            pageName.includes("excel_library") ||
            pageName.includes("spreadsheet") ||
            pageName.includes("bullet-graph") ||
            pageName.includes("gauge") ||
            pageName.includes("exporter") ||
            pageName.includes("map") ||
            pageName.includes("sparkline")||
            pageName.includes("zoomslider") ;
    }

    private clean<T>(arr: T[], deleteValue: T) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i] == deleteValue) {
                arr.splice(i, 1);
                i--;
            }
        }
        return arr;
    }

    private addImgResponsiveClass(element: JQuery<HTMLElement>) {
        let images = element.find('img');
        images.each(function (imgIndex, img) {
            let $img = $(img);
            if (!$img.attr('class')) {
                $img.addClass('img-responsive');
            } else if (!$img.attr('class')!.includes('img-responsive')) {
                $img.addClass('img-responsive');
            }
        });
    }

    private showOrHideNavigation() {
        if (this.$window.width() == this.windowWidth) {
            return;
        }
        // cache width to stop misfires
        this.windowWidth = this.$window.width();

        if (window.matchMedia && window.matchMedia("print").matches) return;
        let mode = this.isSmallDeviceWidth() ? 'hide' : 'show';
        this.$navContainer.collapse!(mode);
        this.syncSidebarHeight();
    }
}