import ClipboardJS from "clipboard";
import { IListNode, IListNodeStart } from "./types";

class UtilityService {
    public isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.1/8 is considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        ));
    private offset: number;
    constructor() {
        console.log(1);
        this.offset = $('.navbar').first().height()!;
        $("body").data("offset", this.offset + 50);
    }

    public getAbsolutePath(href: string) {
        // Use anchor to normalize href
        let anchor: HTMLAnchorElement = $<HTMLAnchorElement>(`<a href="${href}"></a>`)[0];
        // Ignore protocal, remove search and query
        return anchor.host + anchor.pathname;
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

    public updateUrl(target: string) {
        history.pushState({}, "", window.location.href.split("#")[0] + target);
    }

    public scrollAnimation<T extends HTMLElement>(event: JQuery.ClickEvent<T>) {
        let hashLocation = $(event?.target)?.attr("href")!;
        let scrollPos = $("body").find(hashLocation).offset()!.top - this.offset;
        $("body, html").animate({scrollTop: scrollPos}, 500, () => this.updateUrl(hashLocation));
        return false;
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
}

const util: UtilityService = new UtilityService();
export default util;
