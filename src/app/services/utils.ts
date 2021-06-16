import ClipboardJS from "clipboard";
import { IListNode, IListNodeStart } from "../types";

/**
 * A class, which is used by every class in the docfx template.
 */
class UtilityService {
    /**
     * Checks if the site is hosted locally.
     */
    public isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        ));
    /** Checks if we are in IE11 */
    public isIE = !((window as any).ActiveXObject) && "ActiveXObject" in window;
    /** Checks if we are in Edge */
    public isEdge = navigator.userAgent.indexOf('Edge') !== -1;
    /** 
     * The base directory of the site. 
     * In most cases the docfx site is a subsite and we must know what is the base directory so that we can fetch certain assets (like the index.json file for the search functionality)
     */
    public baseDir: string;
    /** 
     * The top offset used for calculating the exact positions/dimensions for the elements. 
     * We have navbars which have an impact on certain elements positions/dimensions and we must calculate the top offset so that the calculations can be accurate 
     */
    public offset: number;
    
    /**
     * Indicates whether we we should remove the html extensions from the internal links in the site.
     * To remove the html extensions first the site must be hosted under the staging/production environment and it must contain a meta tag with attribute `name` whose value is  `isRedirected`.
     * This meta tag is available when the [`_useRedirects`](https://github.com/IgniteUI/igniteui-docfx/blob/master/en/global.json#L16) global variable is set to true in the global.json file
     * By default every link has html extension.
     */
    public removeHTMLExtensionFromUrl: boolean;

    constructor() {
        this.offset = $('.navbar').first().height()!;
        $("body").data("offset", this.offset + 50);
        this.refreshHash();
        let baseRel = $("meta[name=data-docfx-rel]").attr("content")!;
        this.baseDir=this.getAbsolutePath(baseRel);
        this.removeHTMLExtensionFromUrl = !this.isLocalhost && $("meta[name=isRedirected]")[0] != null;
    }

    /** Returns the absolute path of a relitive path  */
    public getAbsolutePath(href: string) {
        // Use anchor to normalize href
        let anchor: HTMLAnchorElement = $<HTMLAnchorElement>(`<a href="${href}"></a>`)[0];
        // Ignore protocal, remove search and query
        return anchor.pathname;
    }

    /** Checks if the path is a relitive path  */
    public isRelativePath(href: string) {
        return !this.isAbsolutePath(href);
    }
    /** Checks if the path is an absolute path  */
    public isAbsolutePath(href: string) {
        return /^(?:[a-z]+:)?\/\//i.test(href);
    }

    /**
     * 
     * @param href 
     * @returns the directory of the provided href
     */
    public getDirectory(href: string) {
        if (!href) return "";
        var index = href.lastIndexOf("/");
        if (index == -1) return "";
        if (index > -1) {
            return href.substr(0, index);
        }
    }

    /**
     * Adjusts the object tree structure for cration of an unsorted list.
     * Based on the object tree the unsorted lists can contain other unsorted lists.
     * Used mainly in the TOC and breadcrump rendering.
     * @param item - the array with objects
     * @param classes - the classes applied to the <ul> elements
     * @returns stringified <ul> list
     */
    public formList(item: IListNode[], ...classes: string[]) {
        let level = 1;
        let model: IListNodeStart = {
            items: item
        };
        let cls = [...classes].join(" ");
        return this.getList(model, cls, level);

    }

    /**
     * Recursion, which creates unsorted list from an object tree.
     * @param model - the object tree
     * @param classes - the classes applied to the <ul> elements
     * @param level - the hierarchy level of the unsorted list
     * @returns stringified <ul> list
     */
    public getList(model: IListNodeStart | IListNode, classes: string, level: number) {
        if (!model || !model.items) return null;
        var l = model.items.length;
        if (l === 0) return null;
        var html = '<ul class="level' + level + " " + (classes ?? "") + '">';
        level++;
        for (var i = 0; i < l; i++) {
            var item = model.items[i];
            var href = item.href;
            var name = item.name;
            if (!name) continue;
            html += href ?
                `<li class="nav-item" ><a class="nav-link" href="${href}">${name}</a>` :
                `<li>${name}`;
            html += this.getList(item, classes, level) || "";
            html += "</li>";
        }
        html += "</ul>";
        return html;
    }

    /**
    * Add <wbr> into long word. The jQuery element should contain no html tags.
    * If the jQuery element contains tags, this function will not change the element.
    */
    public breakWord = <T extends HTMLElement>(element: JQuery<T>) => {
        let breaker = this.breakPlainText;
        if (element.html() == element.text()) {
            element.html(function (index, text) {
                return breaker(text);
            });
        }
        return element;
    };

    /**
     * Add <wbr> into long word.
     * @param {String} text - The word to break. It should be in plain text without HTML tags.
     */
    private breakPlainText(text: string) {
        if (!text) return text;
        return text.replace(/([a-z])([A-Z])|(\.)(\w)/g, "$1$3<wbr>$2$4");
    }

    public htmlEncode(str: string) {
        if (!str) return str;
        return str
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    public htmlDecode(str: string) {
        if (!str) return str;
        return str
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&amp;/g, "&");
    }

    public cssEscape(str: string) {
        // see: http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string#answer-2837646
        if (!str) return str;
        return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
    }

    /**
     * Function for custom scrolling. 
     * If we do not specify a hashlocation the page will scroll to the top or `scrollTop(0)` will be invoked 
     * @param hashLocation - the hashlocation in the article to scroll to 
     * @param animation - indicates wheter to use animation
     * @param delay - the animation duration. By default it is `500ms`
     */
    public scroll(hashLocation?: string, animation = true, delay = 500) {

        let scrollPos = hashLocation != null ? this.getAnchorWithHashlocationScrollPos(hashLocation) : 0;
        if(animation) {
            $("body, html").animate({scrollTop: scrollPos}, delay);
        } else {
            $("body, html").scrollTop(scrollPos);
        }
    }

    /**
     * A function to get the scroll position of an acnhor.
     * If the provided hash is not recognized the scroll position is `0`
     * @param hash - the anchor hash
     * @returns the scroll position of the anchor
     */
    public getAnchorWithHashlocationScrollPos(hash:string): number {
        let offset = $("body").find(hash).offset();
        if(!offset) return 0;
        return offset!.top - this.offset;
    }

    /**
     * Attaches a copy handler to buttons.
     * @param buttonSelector - the selector of the buttons, which must provide copy functionality
     * @param postCopyText  - The button text after the copy event
     */
    public copyCode(buttonSelector: string, postCopyText?: string) {
        let btn = buttonSelector;
        let cpb = new ClipboardJS(btn, {
          text: (trigger) => {
            let codeSnippet = $(trigger).prevAll("code").text();
            return codeSnippet;
          }
        });
  
        cpb.on("success", (e: ClipboardJS.Event) => {
          e.trigger.textContent = "COPIED";
          setTimeout(() => {
            $(e.trigger).text(postCopyText ?? '');
          }, 1000);
        });
    }

    /**
     * Indicates whether there is a hash in the current location
     */
    public hasLocationHash(): boolean {
        return "hash" in window.location && window.location.hash.length > 0;
    }

    private refreshHash() {
        //D.P. this actually works better than changing the hash back and forth, no extra history entries.
        if (this.hasLocationHash()) {
            window.location.assign(window.location.href);
        }
    }

    public toAbsoluteURL(relative: string): string {
        let a = window.document.createElement('a');
        a.href = relative;
        return a.href;
    }

    /**
     * Indicates whether the page is from the [`igniteui-xplat-docs`](https://github.com/IgniteUI/igniteui-xplat-docs)
     */
    public isDvPage(): boolean {
        let parts = window.location.pathname.trim().split("/");
        var pageName = parts[parts.length - 1];
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

    /**
     * Indicates whether we are on the `index` page
     * @param route - the path, which the router will navigate to
     */
    public isOnIndexPage(route?: string): boolean{
        if(route) 
            return this.getAbsolutePath(route) === this.baseDir;
        return window.location.pathname === this.baseDir;
    }

    /**
     * Highlights words in the article, based on the provided query
     * @param query - the words, which must be highlighted
     */
    public highlightKeywords(query: string) {
        let q = query;
        if (q != null) {
          let keywords = q.split("%20");
          keywords.forEach((keyword) => {
            if (keyword !== "") {
              $(".data-searchable *").mark(keyword, {className: 'markedjs-item'});
              $("article *").mark(keyword, {className: 'markedjs-item'});
            }
          });
        }
      }
}

const util: UtilityService = new UtilityService();
export default util;
