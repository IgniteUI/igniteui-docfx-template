// import $ from 'jquery';
// import hljs from 'highlight.js';
// import util from './utils';
// import anchors from 'anchor-js';
// import {IListNode } from './interfaces';
// import ClipboardJS from 'clipboard';
// import ResizeObserver  from 'resize-observer-polyfill';
// abstract class RenderingService {
//   protected active = "active";
//   protected expanded = "in";
//   protected filtered = "filtered";
//   protected show = "show";
//   protected hide = "hide";
//   public abstract render(): void;
// }

// interface IHighlighted {
//   result: {
//     language: string;
//     re?: number;
//   }
// }

// type Merge<T, TT> = {
//   [K in keyof T]: T[K]
// } & TT;

// type HTMLHighlightedCodeElement = Merge<HTMLElement, IHighlighted>;

// interface TOCHeaderElement{
//   header:JQuery<HTMLLIElement>,
//   children: JQuery<HTMLLIElement>[]
// }

// export class ResizingService {
//   private decreaseSideNavsHeight(height) {
//     $('.sidetoc').height(initialSidetocHeight - height);
//     $('#affix').height(initialAffixHeight - height);
//   }

//   private resizeObserver: ResizeObserver;

//   constructor(){
//     this.resizeObserver = new ResizeObserver((entries, observer) => {
//         this.checkIfFooterIsVisible();
//     });

//     $(".resizable-content").each((_:number, element) => {
//       this.resizeObserver.observe(element)
//     });
//   }

//   private checkIfFooterIsVisible() {
//     let $el = $('#footer-container'),
//       scrollTop = $(window).scrollTop()!,
//       scrollBot = scrollTop + $(window).height()!,
//       elTop = $el?.offset()!.top!,
//       elBottom = elTop + $el?.outerHeight()!,
//       visibleTop = elTop < scrollTop ? scrollTop : elTop,
//       visibleBottom = elBottom > scrollBot ? scrollBot : elBottom;
//     if (visibleTop < visibleBottom) {
//       this.decreaseSideNavsHeight((visibleBottom - visibleTop));
//     } else {
//       $('.sidetoc').height(initialSidetocHeight);
//       $('#affix').height(initialAffixHeight);

//     }
//   }

//   (function () {
//     $(this).on("scroll", function () {
//       setTimeout(function () {
//         checkIfFooterIsVisible()
//       }, 0)
//     })
//   })();

//   (function () {
//     $(this).on("resize", function () {
//       initialSidetocHeight = document.body.clientHeight - 160;
//       initialAffixHeight = (65 / 100) * document.body.clientHeight;
//       checkIfFooterIsVisible()
//     })
//   })();
// }
// //Rendering service for TOC
// export class TocRenderingService extends RenderingService {

//   private initialSidetocHeight: number;
//   constructor(private resizingService: ResizingService) {
//     super();
//   }
//   public render() {
//   }

//     private getActiveAnchorTopOffset(element: JQuery<HTMLAnchorElement>, expandParents=false): number {
//     var top = 0;
//     $(element.parents("li").get().reverse())
//       .each((i, e) => {
//         if (expandParents) {
//           $(e).addClass(this.expanded);
//         }
//         top += $(e).position().top;
//       });
//     return top;
//   }

//   private getActiveAnchorID(element: JQuery<HTMLAnchorElement>): string {

//     var id = "";
//     const parentListItems = element.parents("li").get();
//     $(parentListItems.reverse())
//       .each(function (i, e) {
//         const listItemTopicName = $($(e).find("a > span.topic-name")[0]).text().trim();
//         id += i === parentListItems.length - 1 ? listItemTopicName : listItemTopicName + "~"
//       });
//     return id;
//   }

//   private renderSidebar() {
//     var sidetoggle = $(".sidetoggle.collapse")[0];
//     $(window).resize( () => {
//       $(sidetoggle).height("auto");
//       $(sidetoggle).removeClass("in");
//     });
//     var sidetoc = $("#sidetoggle .sidetoc")[0];
//     if (typeof sidetoc === "undefined") {
//       this.loadToc();
//     } else {
//       this.registerTocEvents();
//       this.initialSidetocHeight = $(".sidetoc").height()!;
//       if ($("footer").is(":visible")) {
//         // $('.sidetoc').addClass('shiftup');
//       }

//       this.checkIfFooterIsVisible()

//       var top = 0;
//       const activeTopicId = getActiveAnchorID($("#toc a.active"));
//       var storedActiveElement = sessionStorage.getItem('active-element');
//       if (storedActiveElement && activeTopicId === (storedActiveElement = JSON.parse(storedActiveElement)).id) {
//         const prevTopOffset = parseInt(storedActiveElement.top);
//         const currentOffsetTop = getActiveAnchorTopOffset($("#toc a.active"), true);
//         const scrollAmount = (currentOffsetTop - prevTopOffset);
//         top = scrollAmount;
//       } else {
//         $($("#toc a.active").
//           parents("li").get().reverse()).
//           each(function (i, e) {
//             $(e).addClass(expanded);
//             top += $(e).position().top;
//           });
//         top = top - 50;
//       }
//       sessionStorage.removeItem('active-element');

//       $("#toc a.active").closest("li").addClass("active");

//       $(".sidetoc").scrollTop(top)

//       if ($("footer").is(":visible")) {
//         // $('.sidetoc').addClass('shiftup');
//       }

//       renderBreadcrumb();
//     }
//   }

//   private registerTocEvents() {
//     $(".toc .nav > li > .expand-stub").click(function (e) {
//       $(e.target)
//         .parent()
//         .toggleClass(this.expanded);
//     });

//     $(".toc .nav > li > a").click((e) => {
//       const offsetTop = this.getActiveAnchorTopOffset($(e.target));
//       const id = this.getActiveAnchorID($(e.target));
//       const activeElement = { id: id, top: offsetTop };

//       sessionStorage.setItem('active-element', JSON.stringify(activeElement));
//     });

//     $(".toc .nav > li > .expand-stub + a:not([href])").click((e) => {
//       $(e.target).closest('li').toggleClass(this.expanded)
//     });

//     $("#toc_filter_input").on("input", (e) =>  {
//       var val = e.target?.nodeValue!;
//       if (val === "") {
//         // Clear 'filtered' class
//         $("#toc li")
//           .removeClass(this.filtered)
//           .removeClass(this.hide)
//           .removeClass(this.expanded);

//         $("#toc li > a.active")
//           .parents("li")
//           .addClass(this.expanded);

//         return;
//       }

//       // Get leaf nodes
//       $<HTMLAnchorElement>("#toc li>a")
//         .filter((i: number, e: HTMLAnchorElement) => {
//           return $(e).siblings().not('.new__badge').length === 0 || $(e).siblings().not('.updated__badge').length === 0;
//         })
//         .each((i: number, anchor: HTMLAnchorElement ) => {
//           let text = $(anchor).attr("title");
//           let parent = $(anchor).parent() as unknown as JQuery<HTMLLIElement>;
//           let parentNodes:JQuery<HTMLLIElement>[] = parent.parents<HTMLLIElement>("ul>li") as unknown as JQuery<HTMLLIElement>[] ;
//           let latest = parentNodes.length > 0 ? parentNodes[parentNodes.length - 1] : parent;
//           let header = $(latest).prevAll("li[data-is-header='true']").first();
//           parentNodes.push(header);
//           for (let i = 0; i < parentNodes.length; i++) {
//             let parentText;
//             let parentNode = $(parentNodes[i]);
//             if (parentNode.data("is-header")) {
//               parentText = parentNode.text().trim();
//             } else {
//               parentText = $(parentNodes[i])
//                 .children("a")
//                 .attr("title");
//             }

//             if (parentText) text = parentText + " " + text;
//           }
//           if (this.filterNavItem(text!, val)) {
//             parent.addClass(this.show);
//             parent.removeClass(this.hide);
//           } else {
//             parent.addClass(this.hide);
//             parent.removeClass(this.show);
//           }
//         });

//       $($("#toc li>a")
//         .filter((i, e) => {
//           return $(e).siblings().not('.new__badge').length > 0 && $(e).siblings().not('.updated__badge').length > 0;
//         }).get().reverse())
//         .each( (i, anchor) => {
//           var parent = $(anchor).parent();
//           if (parent.find("li.show").length > 0) {
//             parent.addClass(this.show);
//             parent.addClass(this.filtered);
//             parent.addClass(this.expanded)
//             parent.removeClass(this.hide);
//           } else {
//             parent.addClass(this.hide);
//             parent.removeClass(this.show);
//             parent.removeClass(this.filtered);
//             parent.removeClass(this.expanded);
//           }
//         });
//       this.toggleSidenavHeaders();
//     });
//   }
//   private filterNavItem(anchorValue: string, inputText?: string) {
//     if (!inputText) return true;
//     if (anchorValue.toLowerCase().indexOf(anchorValue.toLowerCase()) > -1) return true;
//     return false;
//   }

//   private toggleSidenavHeaders() {
//     var isHeaderDataAttrName = "is-header";
//     var firstLevelListItems = $<HTMLLIElement>("#toc>ul>li");
//     var headers: TOCHeaderElement[] = [];
//     var header = null;
//     var children = [];
//     for (var i = 0; i < firstLevelListItems.length; i++) {
//       var listItem = $(firstLevelListItems[i]);
//       var isHeader = listItem.data(isHeaderDataAttrName) === true;
//       if (isHeader) {
//         if (header) {
//           headers.push({
//             header: header,
//             children: children
//           });

//           header = null;
//           children = [];
//         }

//         header = listItem;
//       } else if (header) {
//         children.push(listItem);
//       }
//     }

//     if (header) {
//       headers.push({
//         header: header,
//         children: children
//       });
//     }

//     this.toggleHeadersHideClass(headers);
//   }

//   private toggleHeadersHideClass(headers: TOCHeaderElement[]) {
//     for (var i = 0; i < headers.length; i++) {
//       if (this.hasVisibleChild(headers[i].children)) {
//         headers[i].header.removeClass("hide");
//       } else {
//         headers[i].header.addClass("hide");
//       }
//     }
//   }

//   private hasVisibleChild(children: JQuery<HTMLLIElement>[]) {
//     for (var i = 0; i < children.length; i++) {
//       if (!children[i].hasClass("hide")) {
//         return true;
//       }
//     }

//     return false;
//   }

//   private loadToc() {
//     var tocPath = $("meta[property='docfx\\:tocrel']").attr("content")!;
//     if (!tocPath) {
//       return;
//     }
//     tocPath = tocPath.replace(/\\/g, "/");
//     $("#sidetoc").load(tocPath + " #sidetoggle > div", () => {
//       var index = tocPath.lastIndexOf("/");
//       var tocrel = "";
//       if (index > -1) {
//         tocrel = tocPath.substr(0, index + 1);
//       }
//       var currentHref = util.getAbsolutePath(window.location.pathname);
//       $("#sidetoc")
//         .find<HTMLAnchorElement>("a[href]")
//         .each( (i, e) => {
//           let href = $(e)?.attr("href")!;

//           if (currentHref.indexOf('.html') === -1) {
//             href = href.replace('.html', '')
//           }

//           if (util.isRelativePath(href)) {
//             href = tocrel + href;
//             $(e).attr("href", href);
//           }

//           if (util.getAbsolutePath(e.href) === currentHref) {
//             $(e).addClass(this.active);
//           }

//           util.breakWord($(e));
//         });

//       this.renderSidebar();
//     });
//   }
// }

// //Rendering service for top navbar
// export class NavbarRenderingService extends RenderingService {

//   constructor() {
//     super();
//   }
//   public render() {

//   }

//   private renderBreadcrumb() {
//     let breadcrumb: IListNode[] = [];
//     $<HTMLLIElement>("#toc li.active").each( (i:number, e:HTMLLIElement) => {

//       $($(e).parents("li").get().reverse()).each((index:number, parent:HTMLLIElement) => {
//         breadcrumb.push({
//           href: ($(parent).children("a")[0] as unknown as HTMLAnchorElement).href,
//           name: $(parent).children("a")[0].title
//         });
//       });

//       breadcrumb.push({
//         href: ($(e).children("a")[0] as unknown as HTMLAnchorElement).href,
//         name: $(e).children("a")[0].title
//       });
//     });

//     var html = util?.formList(breadcrumb, "breadcrumb")!;
//     $("#breadcrumb").html(html);
//   }


//   private renderNavbar() {
//     var navbar = $("#navbar ul")[0];
//     if (typeof navbar === "undefined") {
//       this.loadNavbar();
//     } else {
//       navbar.classList.add("navbar-right");
//       $("#navbar ul a.active")
//         .parents("li")
//         .addClass(this.active);
//       this.renderBreadcrumb();
//     }
//   }

  
//   private loadNavbar() {
//     var navbarPath = $("meta[property='docfx\\:navrel']")?.attr("content")!;
//     if (!navbarPath) {
//       return;
//     }
//     navbarPath = navbarPath.replace(/\\/g, "/");

//     var tocPath = $("meta[property='docfx\\:tocrel']").attr("content") || "";

//     if (tocPath) tocPath = tocPath.replace(/\\/g, "/");

//     $.get(navbarPath, (data) => {
//       $(data).find("#toc>ul").appendTo("#navbar");
//       if ($("#search-results").length !== 0) {
//         $("#search").show();
//         $("body").trigger("searchEvent");
//       }
//       var index = navbarPath.lastIndexOf("/");
//       var navrel = "";
//       if (index > -1) {
//         navrel = navbarPath.substr(0, index + 1);
//       }
//       $("#navbar>ul").addClass("navbar-nav");
//       var currentAbsPath = util.getAbsolutePath(window.location.pathname);
//       // set active item
//       $("#navbar").find<HTMLAnchorElement>("a[href]").each( (i, e) => {
//           var href = $(e).attr("href")!;
//           if (util.isRelativePath(href)) {
//             href = navrel + href;
//             $(e).attr("href", href);
//             var isActive = false;
//             var originalHref = e.name;
//             if (originalHref) {
//               originalHref = navrel + originalHref;
//               if (
//                 util.getDirectory(util.getAbsolutePath(originalHref)) ===
//                 util.getDirectory(util.getAbsolutePath(tocPath))
//               ) {
//                 isActive = true;
//               }
//             } else {
//               if (util.getAbsolutePath(href) === currentAbsPath) {
//                 isActive = true;
//               }
//             }
//             if (isActive) {
//               $(e).addClass(this.active);
//             }
//           }
//         });
//       this.renderNavbar();
//     });
//   }

// }

// //Rendering service for sideaffix
// export class AffixRenderingService extends RenderingService {

//   constructor() {
//     super();
//   }
//   public render() {

//   }
// }

// //Renders the article specific elements - links/anchors, code-snippets, tables, alerts, breakText, noteblocks, addGtmButtons, handleResizableContent
// export class ArticleRenderingService extends RenderingService {

//   constructor() {
//     super();
//   }
//   public render() {

//   }

//   public addExternalLinkIcons() {
//     $('.article-container a:not([class*="no-external-icon"])[href^="http"]')
//       .each(function (i, anchor) {
//         const anchorChildren = $(anchor).children();
//         if (anchorChildren.length > 0) {
//           const lastChild = anchorChildren[anchorChildren.length - 1];
//           $(lastChild).addClass('external-link');
//           $(anchor).addClass('external-link-parent');
//         } else {
//           $(anchor).addClass('external-link');
//         }
//       })
//   }

//   public removeHTMLExtensionFromInternalAnchors() {
//     var absPath = util.getAbsolutePath(window.location.pathname);
//     if (absPath.indexOf('.html') === -1) {
//       $('.article-container a:not([href^="http"])')
//         .each(function () {
//           var anchorHref = $(this).attr('href');
//           if (anchorHref) {
//             $(this).attr('href', anchorHref.slice(0, anchorHref.lastIndexOf('.html')));
//           }
//         });
//     }
//   }

//   public addGtmButtons() {
//     if ($(".sample-container").length && !$(".sample-container:first + p>a.trackCTA").length) {
//       const languageVersion: string = $('html')[0].lang;
//       const productTitle: string = $("meta[property='docfx:title']")!.attr("content")!;
//       let productLink: string = $("meta[property='docfx:link']")!.attr("content")!;

//       if (productLink.charAt(productLink.length - 1) === '/') {
//         productLink += "download";
//       } else {
//         productLink += "/download";
//       }

//       const sample = $(".sample-container").first();
//       let paragraph: JQuery<HTMLParagraphElement>;
//       if (languageVersion === 'ja') {
//         paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`このサンプルが気に入りましたか? 完全な ${productTitle}ツールキットにアクセスして、すばやく独自のアプリの作成を開始します。`);
//         const link = this.appendLinkAttributes(productTitle, productLink);
//         link.text("無料でダウンロードできます。").appendTo(paragraph);
//       } else {
//         paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`Like this sample? Get access to our complete ${productTitle} toolkit and start building your own apps in minutes.`);
//         const link = this.appendLinkAttributes(productTitle, productLink);
//         link.text(" Download it for free.").appendTo(paragraph);
//       }

//       sample.after(paragraph);
//     }
//   }

//   private appendLinkAttributes(productTitle: string, productLink: string) {
//     let link = $('<a>');
//     link.attr('data-xd-ga-action', 'Download');
//     link.attr('data-xd-ga-label', productTitle);
//     link.attr({
//       target: "_blank",
//       href: productLink,
//       class: "no-external-icon mchNoDecorate trackCTA"
//     });
//     return link;
//   }

//   // Enable highlight.js
//   public highlight() {
//     $("pre code").each(function (this: HTMLElement, i: number, block: HTMLElement) {
//       hljs.highlightBlock(block);
//       const highlightedBlock = <HTMLHighlightedCodeElement>block;
//       block = (block as HTMLHighlightedCodeElement);
//       let span: JQuery<HTMLSpanElement> = $(`<span class="hljs-lang-name">${highlightedBlock.result.language}</span>`);
//       let button: JQuery<HTMLButtonElement> = $('<button data-localize="hljs.copyCode" class="hljs-code-copy hidden"></button>');
//       let codeContainer: JQuery<HTMLPreElement> = $(highlightedBlock).parent() as unknown as JQuery<HTMLPreElement>;
//       codeContainer.append([span, button]);
//       codeContainer.on("mouseenter", () => {
//         button.removeClass("hidden");
//       })
//       codeContainer.on("mouseleave", () => {
//         button.addClass("hidden");
//       });
//     });
//   }


//   // Styling for tables in conceptual documents using Bootstrap.
//   // See http://getbootstrap.com/css/#tables
//   public renderTables() {
//     $("#main table")
//       .addClass("table")
//       .wrap('<div class="table-responsive"></div>');
//   }

//   public appednAnchorjs() {
//     new anchors({
//       placement: "right",
//       visible: "touch",
//       icon: ""
//     }).add("article h2:not(.no-anchor), article h3:not(.no-anchor)")
//   }

//   public renderAlerts() {
//     $(".NOTE, .TIP").addClass("alert alert-info");
//     $(".WARNING").addClass("alert alert-warning");
//     $(".IMPORTANT, .CAUTION").addClass("alert alert-danger");
//   }

//   public breakText() {
//     $(".xref").addClass("text-break");
//     var texts = $(".text-break");
//     texts.each(function () {
//       util.breakWord($(this));
//     });
//   }

//   // Set note blocks titles
//   public renderNoteBlocks() {
//     let title, newHeaderElement: string;

//     $(".alert").each((i: number, el: HTMLElement) => {
//       if (el === undefined) return;

//       title = $(el)?.attr('class')?.split(' ')[0];

//       switch (title) {
//         case "NOTE":
//           newHeaderElement = '<h5 data-localize="noteBlocks.note"></h5>';
//           break;
//         case "WARNING":
//           newHeaderElement = '<h5 data-localize="noteBlocks.warning"></h5>';
//           break;
//         case "TIP":
//           newHeaderElement = '<h5 data-localize="noteBlocks.tip"></h5>';
//           break;
//         case "IMPORTANT":
//           newHeaderElement = '<h5 data-localize="noteBlocks.important"></h5>';
//           break;
//         case "CAUTION":
//           newHeaderElement = '<h5 data-localize="noteBlocks.caution"></h5>';
//           break;
//         default:
//           break;
//       }

//       $(el?.firstElementChild!).replaceWith(newHeaderElement);
//     });
//   }

//   public copyCode() {
//     var btn = ".hljs-code-copy";
//     var cpb = new ClipboardJS(btn, {
//       text: function (trigger) {
//         var codeSnippet = $(trigger)
//           .prevAll("code")
//           .text();
//         return codeSnippet;
//       }
//     });

//     cpb.on("success", (e) => {
//       e.trigger.textContent = 'COPIED';
//       setTimeout( () => {
//         e.trigger.textContent = '';
//       }, 1000);
//     });
//   }

// }