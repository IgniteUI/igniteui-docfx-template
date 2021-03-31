import util from "../utils";
import { RenderingService, HTMLHighlightedCodeElement } from "../../types";;
import anchors from 'anchor-js';
import hljs from "highlight.js";
import type { IgniteUIPlatform, IThemingData} from '../../types';
export class ArticleRenderingService extends RenderingService {

    constructor() {
        super();
    }

    public render() {
        this.addExternalLinkIcons();
        this.removeHTMLExtensionFromInternalAnchors();
        this.addGtmButtons();
        this.highlight();
        this.renderTables();
        this.appednAnchorjs();
        this.renderAlerts();
        this.breakText();
        this.renderNoteBlocks();
        this.anchorJs();
        this.renderGithubBtn();
        this.instantiateCodeViews();
        util.copyCode(".hljs-code-copy");

    }

    private addExternalLinkIcons() {
        $('.article-container a:not([class*="no-external-icon"])[href^="http"]')
            .each(function (i, anchor) {
                const anchorChildren = $(anchor).children();
                if (anchorChildren.length > 0) {
                    const lastChild = anchorChildren[anchorChildren.length - 1];
                    $(lastChild).addClass('external-link');
                    $(anchor).addClass('external-link-parent');
                } else {
                    $(anchor).addClass('external-link');
                }
            })
    }

    private removeHTMLExtensionFromInternalAnchors() {
        let absPath = util.getAbsolutePath(window.location.pathname);
        if (absPath.indexOf('.html') === -1) {
            $('.article-container a:not([href^="http"])')
                .each(function () {
                    let anchorHref = $(this).attr('href');
                    if (anchorHref) {
                        $(this).attr('href', anchorHref.slice(0, anchorHref.lastIndexOf('.html')));
                    }
                });
        }
    }

    private addGtmButtons() {
        if ($(".sample-container").length && !$(".sample-container:first + p>a.trackCTA").length) {
            const languageVersion: string = $('html')[0].lang;
            const productTitle: string = $("meta[property='docfx:title']")!.attr("content")!;
            let productLink: string = $("meta[property='docfx:link']")!.attr("content")!;

            if (productLink.charAt(productLink.length - 1) === '/') {
                productLink += "download";
            } else {
                productLink += "/download";
            }

            const sample = $(".sample-container").first();
            let paragraph: JQuery<HTMLParagraphElement>;
            if (languageVersion === 'ja') {
                paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`このサンプルが気に入りましたか? 完全な ${productTitle}ツールキットにアクセスして、すばやく独自のアプリの作成を開始します。`);
                const link = this.appendLinkAttributes(productTitle, productLink);
                link.text("無料でダウンロードできます。").appendTo(paragraph);
            } else {
                paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`Like this sample? Get access to our complete ${productTitle} toolkit and start building your own apps in minutes.`);
                const link = this.appendLinkAttributes(productTitle, productLink);
                link.text(" Download it for free.").appendTo(paragraph);
            }

            sample.after(paragraph);
        }
    }

    private appendLinkAttributes(productTitle: string, productLink: string) {
        let link = $('<a>');
        link.attr('data-xd-ga-action', 'Download');
        link.attr('data-xd-ga-label', productTitle);
        link.attr({
            target: "_blank",
            href: productLink,
            class: "no-external-icon mchNoDecorate trackCTA"
        });
        return link;
    }

    // Enable highlight.js
    private highlight() {
        $("pre code").each(function (this: HTMLElement, i: number, block: HTMLElement) {
            hljs.highlightBlock(block);
            const highlightedBlock = <HTMLHighlightedCodeElement>block;
            block = (block as HTMLHighlightedCodeElement);
            let $span: JQuery<HTMLSpanElement> = $(`<span class="hljs-lang-name">${highlightedBlock.result.language}</span>`);
            let $button: JQuery<HTMLButtonElement> = $('<button data-localize="hljs.copyCode" class="hljs-code-copy hidden"></button>');
            let $codeContainer: JQuery<HTMLPreElement> = $(highlightedBlock).parent() as unknown as JQuery<HTMLPreElement>;
            $codeContainer.append([$span, $button]);
            $codeContainer.on("mouseenter", () => {
                $button.removeClass("hidden");
            })
            $codeContainer.on("mouseleave", () => {
                $button.addClass("hidden");
            });
        });
    }

    // Styling for tables in conceptual documents using Bootstrap.
    // See http://getbootstrap.com/css/#tables
    private renderTables() {
        $("#main table")
            .addClass("table")
            .wrap('<div class="table-responsive"></div>');
    }

    private appednAnchorjs() {
        new anchors({
            placement: "right",
            visible: "touch",
            icon: ""
        }).add("article h2:not(.no-anchor), article h3:not(.no-anchor)")
    }

    private renderAlerts() {
        $(".NOTE, .TIP").addClass("alert alert-info");
        $(".WARNING").addClass("alert alert-warning");
        $(".IMPORTANT, .CAUTION").addClass("alert alert-danger");
    }

    private breakText() {
        $(".xref").addClass("text-break");
        let texts = $(".text-break");
        texts.each(function () {
            util.breakWord($(this));
        });
    }

    // Set note blocks titles
    private renderNoteBlocks() {
        let title, newHeaderElement: string;

        $(".alert").each((i: number, el: HTMLElement) => {
            if (el === undefined) return;

            title = $(el)?.attr('class')?.split(' ')[0];

            switch (title) {
                case "NOTE":
                    newHeaderElement = '<h5 data-localize="noteBlocks.note"></h5>';
                    break;
                case "WARNING":
                    newHeaderElement = '<h5 data-localize="noteBlocks.warning"></h5>';
                    break;
                case "TIP":
                    newHeaderElement = '<h5 data-localize="noteBlocks.tip"></h5>';
                    break;
                case "IMPORTANT":
                    newHeaderElement = '<h5 data-localize="noteBlocks.important"></h5>';
                    break;
                case "CAUTION":
                    newHeaderElement = '<h5 data-localize="noteBlocks.caution"></h5>';
                    break;
                default:
                    break;
            }

            $(el?.firstElementChild!).replaceWith(newHeaderElement);
        });
    }

    private instantiateCodeViews() {
        let platform: IgniteUIPlatform  = $("meta[property='docfx:platform']")?.attr("content")! as IgniteUIPlatform;

        if(!platform) {
            return;
        }

        let views = $("code-view");
        for (let i = 0; i < views.length; i++) {
          let currentView = views[i];
          let style = $(currentView).attr("style")!;
          let iframeSrc = $(currentView).attr("iframe-src")!;
          let alt = $(currentView).attr("alt");

          $(currentView).removeAttr("style");
    
          let sampleContainer = $('<div>').attr("style",style).addClass("sample-container code-view-tab-content loading");
          let iframe = $<HTMLIFrameElement>('<iframe>', {
            id: 'sample-iframe-id-' +  i,
            frameborder: 0,
            seamless: ""
          }).width("100%").height("100%");
    
          if (i === 0){
            if (platform === "angular" ){
              iframe.on("load", (event: JQuery.Event & {target: HTMLIFrameElement}) => {
                let _iframe = event.target;
                _iframe.parentElement!.classList.remove("loading");
                if (!$(_iframe).hasClass("no-theming")) {
            
                    let theme = window.sessionStorage.getItem(util.isIE ? "theme" : "themeStyle")!;
                    let targetOrigin = document.body.getAttribute("data-demos-base-url")!;
                    let data: IThemingData = { origin: window.location.origin };
                    if (util.isIE) {
                        data.theme = theme;
                    } else {
                        data.themeStyle = theme;
                    }
                    var themingWidget = $('igniteui-theming-widget') as any;
                    if (themingWidget.length > 0) {
                        data.themeName = themingWidget[0].theme.globalTheme;
                        _iframe.contentWindow!.postMessage(data, targetOrigin);
                    }
                }
              });
            }else {
                iframe.on("load", (event: JQuery.Event & {target: HTMLIFrameElement}) => {
                    let _iframe = event.target;
                    _iframe.parentElement!.classList.remove("loading");    
                });
            }
            
            iframe.attr("src", iframeSrc);
          }else {
            iframe.attr("class","lazyload");
            iframe.attr("data-src", iframeSrc);
          }
    
          if (alt){
            iframe.attr("alt", alt)
          }
    
          iframe.appendTo(sampleContainer);
          sampleContainer.appendTo(currentView);
          $(currentView).codeView({iframeId : i});
        }
      }

    private anchorJs() {
        $(".anchorjs-link").on("click", (evt) => util.scrollAnimation(evt));
    }

    private renderGithubBtn(){
        let $button = $(".github-btn-wrapper");
        let shouldShowGithubButton = window.location.pathname.search(RegExp("\\/\\b(\\w*grid\\w*)\\b\\/")) === -1
        if ($button.length && shouldShowGithubButton) $button.show();
    }
}