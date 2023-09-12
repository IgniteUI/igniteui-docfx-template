import util from "../utils";
import { RenderingService, HTMLHighlightedCodeElement, INavigationOptions } from "../../types";;
import anchors from 'anchor-js';
import hljs from "../highlight-custom";
import type { IgniteUIPlatform} from '../../types';
import { onSampleIframeContentLoaded, onXPlatSampleIframeContentLoaded } from "../../handlers";
import { Router } from "../router";

const IGNITE_UI_TEMPLATE_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/Ignite-UI-PlatformPath/ignite-ui-Platform-you-get-ad.gif';
const REACT_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/Ignite-UI-React/ignite-ui-react-you-get.gif';
const WEB_COPONENTS_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/Ignite-UI-Web-Components/ignite-ui-web-components.gif';
const APP_BUILDER_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/App-Builder/app-builder-wysiwyg.gif';
const INDIGO_DESIGN_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/IndigoDesign/indigo-design-transofrm-sketch-xd.gif';

const JP_IGNITE_UI_TEMPLATE_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/jp/ignite-ui-Platform-202211.gif';
const JP_REACT_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/jp/ignite-ui-react-01.gif';
const JP_WEB_COPONENTS_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/jp/ignite-ui-webcomponents-202211.gif';
const JP_APP_BUILDER_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/jp/app-builder-wysiwyg-01.gif';
const JP_INDIGO_DESIGN_CTA_BANNER = 'https://static.infragistics.com/marketing/Blog-in-content-ads/jp/indigo-design-transofrm-sketch-xd-01.gif'

export class ArticleRenderingService extends RenderingService {

    private navigationOptions: INavigationOptions = {
        stateAction: "push",
        navigationPostProcess: () => {
            if(util.hasLocationHash()) {
                util.scroll(location.hash, false);
            }
        }
    }

    constructor(private router: Router) {
        super();
    }

    public render() {
        this.addExternalLinkIcons();
        this.configureInternalNavigation();
        this.addGtmButtons();
        this.configureCollapsableCodeBlocks();
        this.highlight();
        this.renderTables();
        this.appednAnchorjs();
        this.renderAlerts();
        this.breakText();
        this.renderNoteBlocks();
        this.anchorJs();
        this.renderGithubBtn();
        this.addCtaBanners();
        this.instantiateCodeViews();
        this.instantiateAccordions();
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

    // Removes the html extension of the anchors and adds event listeners for internal routing
    private configureInternalNavigation() {
        $('.article-container a:not([href^="http"])')
            .each( (index, anchor) => {
                let $anchor = $(anchor).is("a") ? $(anchor) : $(anchor).closest("a");
                let anchorHref = $anchor.attr('href');

                $anchor.on('click', (e) => {
                    e.preventDefault();

                    $("#toc a.active").closest("li").addClass("active");
                    if ($anchor.attr("href")?.startsWith("#")) {
                        util.scroll($anchor.attr("href"));
                        if ($anchor.attr("href") !== location.hash)
                            history.pushState({scrollPosition: $(window).scrollTop()}, "", $anchor.attr("href"));
                    } else {
                        this.router.navigateTo($anchor.attr("href")!, this.navigationOptions);

                    }
                });

                if (util.removeHTMLExtensionFromUrl && anchorHref) {
                    $anchor.attr('href', anchorHref.replace(".html", ""));
                }
            });
    }

    private addGtmButtons() {
        if ($("code-view").length && !$("code-view:first + p>a.trackCTA").length) {
            const languageVersion: string = $('html')[0].lang;
            const productTitle: string = $("meta[property='docfx:title']")!.attr("content")!;
            let productLink: string = $("meta[property='docfx:link']")!.attr("content")!;

            if (productLink.charAt(productLink.length - 1) === '/') {
                productLink += "download";
            } else {
                productLink += "/download";
            }

            const codeView = $("code-view").first();
            let paragraph: JQuery<HTMLParagraphElement>;
            const action = 'Download'
            if (languageVersion === 'ja') {
                paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`このサンプルが気に入りましたか? 完全な ${productTitle}ツールキットにアクセスして、すばやく独自のアプリの作成を開始します。`);
                const link = this.appendLinkAttributes(action, productTitle, productLink);
                link.text("無料でダウンロードできます。").appendTo(paragraph);
            } else {
                paragraph = $<HTMLParagraphElement>('<p>').attr('style', 'margin: 0;padding-top: 0.5rem').text(`Like this sample? Get access to our complete ${productTitle} toolkit and start building your own apps in minutes.`);
                const link = this.appendLinkAttributes(action, productTitle, productLink);
                link.text(" Download it for free.").appendTo(paragraph);
            }

            codeView.after(paragraph);
        }
    }

    private appendLinkAttributes(action: string, productTitle: string, productLink: string) {
        let link = $('<a>');
        link.attr('data-xd-ga-action', action);
        link.attr('data-xd-ga-label', productTitle);
        link.attr({
            target: "_blank",
            href: productLink,
            class: "no-external-icon mchNoDecorate trackCTA"
        });
        return link;
    }

    private configureCollapsableCodeBlocks() {
        $("div.fancy-details").each((i, e)=> {
            const summary = $(e).find('summary');
            const codeBlock = $(e).find('code');
            if (summary.length === 1 && codeBlock.length === 1) {
                $(e).empty();
                const detailsElement = $('<details>');
                const preElement = $('<pre>');
                preElement.append(codeBlock);
                detailsElement.append([summary, preElement]);
                $(e).append(detailsElement);
            }
        });
    }

    // Enable highlight.js
    private highlight() {
        $("pre code").each(function (this: HTMLElement, i: number, block: HTMLElement) {
            hljs.highlightBlock(block);
            const highlightedBlock = <HTMLHighlightedCodeElement>block;
            block = (block as HTMLHighlightedCodeElement);
            const language = highlightedBlock.result && highlightedBlock.result.language ? highlightedBlock.result.language : block.className.split('-')[1];
            let $span: JQuery<HTMLSpanElement> = $(`<span class="hljs-lang-name">${language}</span>`);
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
        this.renderBlockquoteAlerts();
        $(".NOTE, .TIP").addClass("alert alert-info");
        $(".WARNING").addClass("alert alert-warning");
        $(".IMPORTANT, .CAUTION").addClass("alert alert-danger");
    }

    private renderBlockquoteAlerts() {
        $("blockquote").each((i, e)=> {
            const alertRegex = /\[!\S+]/g;
            const content = e.innerText;
            if (content.match(alertRegex)) {
                const result = /!(.*?)\]/.exec(content);
                if (result) {
                    const alertType = result[1];
                    const alertText = content.replace(alertRegex, "");
                    const divContainer = $("<div>").addClass(alertType.toUpperCase());
                    const headerContainer = $("<p>");
                    const alertContainer = $("<p>").text(alertText);
                    divContainer.append(headerContainer);
                    divContainer.append(alertContainer);
                    if (e.previousSibling) {
                        $(e.previousSibling).after(divContainer);
                    }
                    e.remove();
                }
            }
        });
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
            const currentView = views[i];
            const style = $(currentView).attr("style")!;
            const iframeSrc = $(currentView).attr("iframe-src")!;
            const alt = $(currentView).attr("alt");
            const imgSrc = $(currentView).attr("img-src");
            const themable = $(currentView).is("[no-theming]") ? true : false;

            $(currentView).removeAttr("style");

            let sampleContainer = $('<div>').attr("style",style).addClass("sample-container code-view-tab-content loading");
            let iframe = $<HTMLIFrameElement>('<iframe>', {
                id: 'sample-iframe-id-' + i,
                frameborder: 0,
                seamless: "",
                title: alt
            }).width("100%").height("100%");

            if (i === 0) {
                if (imgSrc) { 
                    const img = $('<img>').attr({'src': imgSrc, "alt": alt!}).width("100%").height("100%");
                    sampleContainer.append(img);
                    sampleContainer.removeClass("loading");
                    sampleContainer.attr("style", "")

                    // Replace image with iframe on mouse enter
                    img.on("mouseenter", function () {
                        if (i === 0) {
                            img.replaceWith(iframe);
                            sampleContainer.attr("style", style)
                            sampleContainer.addClass("loading");
                        }
                    });
                }
                if (platform === "angular") {
                    iframe.on("load", (event: JQuery.Event & { target: HTMLIFrameElement }) => onSampleIframeContentLoaded(event.target));
                } else {
                    iframe.on("load", (event: JQuery.Event & { target: HTMLIFrameElement }) => onXPlatSampleIframeContentLoaded(event.target));
                }

                iframe.attr("src", iframeSrc);

                if (!imgSrc) {
                    iframe.appendTo(sampleContainer);
                }
            }else {
                iframe.attr("class","lazyload");
                iframe.attr("data-src", iframeSrc);
                iframe.appendTo(sampleContainer);
            }

            if (alt) iframe.attr("alt", alt);
            if (themable) iframe.addClass("no-theming");

            sampleContainer.appendTo(currentView);
            $(currentView).codeView({iframeId : i});
        }
    }

    private addCtaBanners() {
        const languageVersion: string = $('html')[0].lang;
        let productLink = $("meta[property='docfx:link']").attr("content")!,
            platform = $("meta[property='docfx:platform']").attr("content") || '',
            productTitle = $("meta[property='docfx:title']")!.attr("content")!;
        let imagePath = '';
        productTitle = productTitle + " | CTA Banner"
        let action = 'Download';

        if(productLink.toLocaleLowerCase().includes("slingshot")) return;

        if (productLink.includes("indigo")) {
            action = 'Learn More';
            productLink = "https://www.infragistics.com/products/indigo-design";
            imagePath = languageVersion === 'en' ? INDIGO_DESIGN_CTA_BANNER : JP_INDIGO_DESIGN_CTA_BANNER;
        } else if (productLink.includes("appbuilder")) {
            action = 'Learn More';
            productLink = "https://www.infragistics.com/products/appbuilder";
            imagePath = languageVersion === 'en' ? APP_BUILDER_CTA_BANNER : JP_APP_BUILDER_CTA_BANNER;
        } else if (productLink.includes("web-components")) {
            imagePath = languageVersion === 'en' ? WEB_COPONENTS_CTA_BANNER : JP_WEB_COPONENTS_CTA_BANNER;
            productLink = this.setBannerLink(productLink);
        } else if (productLink.includes("react")) {
            imagePath = languageVersion === 'en' ? REACT_CTA_BANNER : JP_REACT_CTA_BANNER;
            productLink = this.setBannerLink(productLink);
        } else {
            const defaultLanguageUIBanner = languageVersion === 'en' ? IGNITE_UI_TEMPLATE_BANNER : JP_IGNITE_UI_TEMPLATE_BANNER;
            imagePath = defaultLanguageUIBanner.replace('PlatformPath', platform.charAt(0).toUpperCase() + platform.slice(1)).replace('Platform', platform);
            productLink = this.setBannerLink(productLink);
        }

        if (productLink.includes("angular") && $(".article-container h2")[2]){
            this.appendBanner(2, productLink, imagePath, action, productTitle);

            if ($(".article-container h2")[4]){
                const builderImagePath = languageVersion === 'en' ? APP_BUILDER_CTA_BANNER : JP_APP_BUILDER_CTA_BANNER;
                const аppbuilderLink = 'https://www.infragistics.com/products/appbuilder';
                action = 'Learn More';
                this.appendBanner(4, аppbuilderLink, builderImagePath, action, 'App Builder | CTA Banner');
            }
        } else if(productLink.includes("blazor") || productLink.includes("react")){
            this.appendBanner($(".article-container h2").length - 1, productLink, imagePath, action, productTitle);
        } else if($(".article-container h2")[2]){
            this.appendBanner(2, productLink, imagePath, action, productTitle);
        }
    }

    private appendBanner(headerIndex: number, productLink: string, imagePath: string, action: string, label: string){
        const header = $(".article-container h2")[headerIndex], divTag = $('<div>');
        divTag.addClass('dfx-seo-banner');
        const imgTag = $('<img>').css('width', '100%');
        $(imgTag).attr("src", imagePath);
        $(imgTag).attr("alt", label);
        $(imgTag).attr("loading", "lazy");
        const link = this.appendLinkAttributes(action, label, productLink);
        link.append(imgTag);
        $(divTag).append(link);
        $(header).before(divTag);
    }

    private anchorJs() {
        $(".anchorjs-link").on("click", (evt) => {
            evt.preventDefault();
            util.scroll($(evt?.target)?.attr("href")!);
            if ($(evt?.target)?.attr("href")! !== location.hash)
                history.pushState({scrollPosition: $(window).scrollTop()}, "", $(evt?.target)?.attr("href")!);
        });
    }

    private renderGithubBtn(){
        let $button = $(".github-btn-wrapper");
        let shouldShowGithubButton = window.location.pathname.search(RegExp("\\/\\b(\\w*grid\\w*)\\b\\/")) === -1
        if ($button.length && shouldShowGithubButton) $button.show();
    }

    // Only for elements with class faqs-accordion-content inside a parent with id faqs-accordion-wrapper""
    private instantiateAccordions() {
        if($("#faqs-accordion-wrapper").length) {
            let accContentd = $(".faqs-accordion-content");

            accContentd.on("click", (e: JQuery.Event & {target: HTMLElement}) => {
                let el;
                if(!$(e.target).is(".faqs-accordion-content")) {
                    el =  $(e.target).closest(".faqs-accordion-content");
                } else {
                    el = $(e.target);
                }
                el.toggleClass("active");
                let panel = el.find(".faqs-accordion-panel")[0];
                if(panel.style.maxHeight) {
                    (panel.style.maxHeight as any) = null;
                } else {
                    panel.style.maxHeight = panel.scrollHeight + "px";
                }
            });
        }
    }

    private setBannerLink(productLink: string) {
        const languageVersion: string = $('html')[0].lang;
        if (languageVersion === 'en') {
            productLink += productLink.charAt(productLink.length - 1) === '/' ? "download" : "/download";
        }
        return productLink;
    }
}
