import ClipboardJS from "clipboard";
import { IListNode, IListNodeStart } from "../types";

class UtilityService {
    public isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        ));
    public isIE = !((window as any).ActiveXObject) && "ActiveXObject" in window;
    public isEdge = navigator.userAgent.indexOf('Edge') !== -1;
    public baseDir: string;
    public offset: number;
    public removeHTMLExtensionFromUrl: boolean;

    constructor() {
        this.offset = $('.navbar').first().height()!;
        $("body").data("offset", this.offset + 50);
        this.refreshHash();
        let baseRel = $("meta[name=data-docfx-rel]").attr("content")!;
        this.baseDir=this.getAbsolutePath(baseRel);
        this.removeHTMLExtensionFromUrl = !this.isLocalhost && $("meta[name=isRedirected]")[0] != null;
    }

    public getAbsolutePath(href: string) {
        // Use anchor to normalize href
        let anchor: HTMLAnchorElement = $<HTMLAnchorElement>(`<a href="${href}"></a>`)[0];
        // Ignore protocal, remove search and query
        return anchor.pathname;
    }

    public isRelativePath(href: string) {
        return !this.isAbsolutePath(href);
    }

    public isAbsolutePath(href: string) {
        return /^(?:[a-z]+:)?\/\//i.test(href);
    }

    public getDirectory(href: string) {
        if (!href) return "";
        var index = href.lastIndexOf("/");
        if (index == -1) return "";
        if (index > -1) {
            return href.substr(0, index);
        }
    }

    public formList(item: IListNode[], ...classes: string[]) {
        let level = 1;
        let model: IListNodeStart = {
            items: item
        };
        let cls = [...classes].join(" ");
        return this.getList(model, cls, level);

    }

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

    public scroll(hashLocation?: string, animation = true, delay = 500) {

        let scrollPos = hashLocation != null ? this.getAnchorWithHashlocationScrollPos(hashLocation) : 0;
        if(animation) {
            $("body, html").animate({scrollTop: scrollPos}, delay);
        } else {
            $("body, html").scrollTop(scrollPos);
        }
    }

    public getAnchorWithHashlocationScrollPos(hash:string): number {
        let offset = $("body").find(hash).offset();
        if(!offset) return 0;
        return offset!.top - this.offset;
    }

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

    public isDvPage(): boolean {
        // The use of platform metadata is allowing proper products differentiation and based on the result to use handlers appropriately.
        let $platformMeta = $("meta[property='docfx:platform']");
        let platform = $platformMeta.attr("content")!;
        if (platform !== 'angular'){
            return true;
        }
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

    public isOnIndexPage(route?: string): boolean{
        if(route) 
            return this.getAbsolutePath(route) === this.baseDir;
        return window.location.pathname === this.baseDir;
    }

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
