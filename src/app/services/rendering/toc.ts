import util from "../utils";;
import {
    RenderingService,
    ResizableObservable,
    DimensionType,
    DimensionChangeType,
    IListNode,
    TOCHeaderElement
} from "../../types";;
import { ResizingService } from "../resizing";
import { Router } from "../router";

export class TocRenderingService extends RenderingService implements ResizableObservable {

    public initialDimension: number;
    public $element: JQuery<HTMLElement>;
    public dimensionToObserve: DimensionType = 'height';

    constructor(private resizingService: ResizingService, private router: Router) {
        super();
    }

    public reset() {
        this.initialDimension = document.body.clientHeight - 160;
    }

    public handleChange(changeType: DimensionChangeType, newValue: number) {
        changeType === 'decrease' ? this.$element[this.dimensionToObserve](this.initialDimension - newValue) :
            this.$element[this.dimensionToObserve](this.initialDimension + newValue);
    }

    public render() {
        this.renderSidebar();
    }

    private renderSidebar() {
        let sidetoggle = $(".sidetoggle.collapse")[0];
        $(window).resize(() => {
            $(sidetoggle).height("auto");
            $(sidetoggle).removeClass("in");
        });
        let sidetoc = $("#sidetoggle .sidetoc")[0];
        if (typeof sidetoc === "undefined") {
            this.loadToc();
        } else {
            this.registerTocEvents();
            this.$element = $(".sidetoc");
            this.initialDimension = $(".sidetoc").height()!;
            this.resizingService.observeElement(<ResizableObservable>this);
            $("#toc a.active").closest("li").addClass("active");
            this.scrollToActive();
            this.renderBreadcrumb();
        }
    }

    public renderBreadcrumb() {
        let breadcrumb: IListNode[] = [];
        $<HTMLLIElement>("#toc li.active").each((i: number, e: HTMLLIElement) => {

            $($(e).parents("li").get().reverse()).each((index: number, parent: HTMLLIElement) => {
                breadcrumb.push({
                    href: ($(parent).children("a")[0] as unknown as HTMLAnchorElement).href,
                    name: $(parent).children("a")[0].title
                });
            });

            breadcrumb.push({
                href: ($(e).children("a")[0] as unknown as HTMLAnchorElement).href,
                name: $(e).children("a")[0].title
            });
        });

        let html = util?.formList(breadcrumb, "breadcrumb")!;
        $("#breadcrumb").html(html);
        $("#breadcrumb a").on('click', (e) => {
            e.preventDefault();
            let $a = this.getActiveAnchor($(e.target));
            if ($a.parent().is(":last-child")) return;
            this.router.navigateTo($a.attr("href")!);
        });
    }

    public setActive($anchor?: JQuery<HTMLElement>, shouldScroll = true) {
        $("#toc a.active").removeClass(this.active);
        $("#toc li").removeClass(this.active);
        let $anchorToActivate: JQuery<HTMLAnchorElement>;
        if ($anchor) {
            $anchorToActivate = this.isAnchor($anchor) ? $anchor : this.getActiveAnchor($anchor);

        } else {
            let currentHref = util.toAbsoluteURL(window.location.pathname);
            $anchorToActivate = $<HTMLAnchorElement>("#sidetoc a[href]").
                filter((index, element) => util.toAbsoluteURL(element.href) === currentHref);
        }
        $anchorToActivate!.addClass(this.active);
        $anchorToActivate!.closest("li").addClass(this.active).addClass(this.expanded);

        if(shouldScroll) {
            $(".sidetoc").scrollTop(0);
            this.scrollToActive();
        }


        if ($("#toc_filter_input").val()) {
            $("#toc_filter_input").val("");
            this.clearFilter();
            this.scrollToActive(0);
        }
    }

    private scrollToActive(amount?: number) {
        if(amount) {
            $(".sidetoc").scrollTop(amount);
        } else {
            let top = 0;
            $($("#toc a.active").
                parents("li").get().reverse()).
                each((i, e) => {
                    $(e).addClass(this.expanded);
                    top += $(e).position().top;
                });
            top = top - 50;
            $(".sidetoc").scrollTop(top);
        }
    }

    private getActiveAnchor(element: JQuery<HTMLElement>): JQuery<HTMLAnchorElement> {
        if (this.isAnchor(element)) {
            return element! as JQuery<HTMLAnchorElement>;
        }

        let activeAnchor = <JQuery<HTMLAnchorElement>>element.parent()!;
        return activeAnchor!;
    }

    private clearFilter() {
        $("#toc li")
            .removeClass(this.filtered)
            .removeClass(this.hide)
            .removeClass(this.expanded);

        $("#toc li > a.active")
            .parents("li")
            .addClass(this.expanded);
    }

    private registerTocEvents() {
        $(".toc .nav > li > .expand-stub").click((e) => {
            $(e.target)
                .parent()
                .toggleClass(this.expanded);
        });

        $<HTMLAnchorElement>(".toc .nav > li > a").on('click', (e) => {
            e.preventDefault();
            let $a = this.getActiveAnchor($(e.target));

            if ($a.is(":not([href])")) {
                $a.parent().toggleClass(this.expanded);
                return;
            } else if ($a.is(".active")) return;

            this.setActive($a, false);
            this.router.navigateTo($a.attr("href")!, {stateAction: "push", adjustTocScrollPosition: false})
        });

        $("#toc_filter_input").on("input", (e: any) => {

            let val = e.target?.value! as string;
            if (val === "") {
                // Clear 'filtered' class
                this.clearFilter();
                return;
            }

            // Get leaf nodes
            $<HTMLAnchorElement>("#toc li>a")
                .filter((i: number, e: HTMLAnchorElement) => {
                    return $(e).siblings().not('.new__badge').length === 0 || $(e).siblings().not('.updated__badge').length === 0;
                })
                .each((i: number, anchor: HTMLAnchorElement) => {
                    let text = $(anchor).attr("title");
                    let parent = $(anchor).parent() as unknown as JQuery<HTMLLIElement>;
                    let parentNodes: JQuery<HTMLLIElement>[] = parent.parents<HTMLLIElement>("ul>li") as unknown as JQuery<HTMLLIElement>[];
                    let latest = parentNodes.length > 0 ? parentNodes[parentNodes.length - 1] : parent;
                    let header = $(latest).prevAll("li[data-is-header='true']").first();
                    parentNodes.push(header);
                    for (let i = 0; i < parentNodes.length; i++) {
                        let parentText;
                        let parentNode = $(parentNodes[i]);
                        if (parentNode.data("is-header")) {
                            parentText = parentNode.text().trim();
                        } else {
                            parentText = $(parentNodes[i])
                                .children("a")
                                .attr("title");
                        }

                        if (parentText) text = parentText + " " + text;
                    }
                    if (this.filterNavItem(text!, val)) {
                        parent.addClass(this.show);
                        parent.removeClass(this.hide);
                    } else {
                        parent.addClass(this.hide);
                        parent.removeClass(this.show);
                    }
                });

            $($("#toc li>a")
                .filter((i, e) => {
                    return $(e).siblings().not('.new__badge').length > 0 && $(e).siblings().not('.updated__badge').length > 0;
                }).get().reverse())
                .each((i, anchor) => {
                    let parent = $(anchor).parent();
                    if (parent.find("li.show").length > 0) {
                        parent.addClass(this.show);
                        parent.addClass(this.filtered);
                        parent.addClass(this.expanded)
                        parent.removeClass(this.hide);
                    } else {
                        parent.addClass(this.hide);
                        parent.removeClass(this.show);
                        parent.removeClass(this.filtered);
                        parent.removeClass(this.expanded);
                    }
                });
            this.toggleSidenavHeaders();
        });
    }

    private filterNavItem(anchorValue: string, inputText?: string) {
        if (!inputText) return true;
        if (anchorValue.toLowerCase().indexOf(inputText.toLowerCase()) > -1) return true;
        return false;
    }

    private toggleSidenavHeaders() {
        let isHeaderDataAttrName = "is-header";
        let firstLevelListItems = $<HTMLLIElement>("#toc>ul>li");
        let headers: TOCHeaderElement[] = [];
        let header = null;
        let children = [];
        for (let i = 0; i < firstLevelListItems.length; i++) {
            let listItem = $(firstLevelListItems[i]);
            let isHeader = listItem.data(isHeaderDataAttrName) === true;
            if (isHeader) {
                if (header) {
                    headers.push({
                        header: header,
                        children: children
                    });

                    header = null;
                    children = [];
                }

                header = listItem;
            } else if (header) {
                children.push(listItem);
            }
        }

        if (header) {
            headers.push({
                header: header,
                children: children
            });
        }

        this.toggleHeadersHideClass(headers);
    }

    private toggleHeadersHideClass(headers: TOCHeaderElement[]) {
        for (let i = 0; i < headers.length; i++) {
            if (this.hasVisibleChild(headers[i].children)) {
                headers[i].header.removeClass("hide");
            } else {
                headers[i].header.addClass("hide");
            }
        }
    }

    private hasVisibleChild(children: JQuery<HTMLLIElement>[]) {
        for (let i = 0; i < children.length; i++) {
            if (!children[i].hasClass("hide")) {
                return true;
            }
        }

        return false;
    }

    private loadToc() {
        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content")!;
        if (!tocPath) {
            return;
        }
        tocPath = util.toAbsoluteURL(tocPath.replace(/\\/g, "/"));
        $("#sidetoc").load(tocPath + " #sidetoggle > div", () => {
            let index = tocPath.lastIndexOf("/");
            let tocrel = "";
            if (index > -1) {
                tocrel = tocPath.substr(0, index + 1);
            }
            let currentHref = util.toAbsoluteURL(window.location.pathname);
            $("#sidetoc")
                .find<HTMLAnchorElement>("a[href]")
                .each((i, e) => {
                    let href = $(e)?.attr("href")!;

                    if (util.removeHTMLExtensionFromUrl) {
                        href = href.replace('.html', '')
                    }

                    if (util.isRelativePath(href)) {
                        href = util.getAbsolutePath(tocrel + href);
                        $(e).attr("href", href);
                    }

                    if (util.toAbsoluteURL(e.href) === currentHref) {
                        $(e).addClass(this.active);
                    }

                    util.breakWord($(e));
                });

            this.renderSidebar();
        });
    }

    private isAnchor($element: JQuery<HTMLElement>): $element is JQuery<HTMLAnchorElement> {
        return $element.is("[href]")
    }
}