import util from "../utils";
import { RenderingService } from "../../types";
import localization from '../localization';

export class NavbarRenderingService extends RenderingService {

    constructor() {
        super();
    }

    public render() {
        this.renderNavbar();
    }

    private renderNavbar() {
        let navbar = $("#navbar ul")[0];
        if (typeof navbar === "undefined") {
            this.loadNavbar();
        } else {
            navbar.classList.add("navbar-right");
            $("#navbar ul a.active")
                .parents("li")
                .addClass(this.active);
        }

        let hellobar = $("#dynamic-hello-bar")[0];
        if (typeof hellobar !== "undefined") {
            this.changeHelloBarContent(location.pathname);
            this.attachHelloBarCloseBtnEvent();
        }
    }

    private loadNavbar() {
        let navbarPath = $("meta[property='docfx\\:navrel']")?.attr("content")!;
        if (!navbarPath) {
            return;
        }
        navbarPath = navbarPath.replace(/\\/g, "/");

        let tocPath = $("meta[property='docfx\\:tocrel']").attr("content") || "";

        if (tocPath) tocPath = tocPath.replace(/\\/g, "/");

        $.get(navbarPath, (data) => {
            $(data).find("#toc>ul").appendTo("#navbar");
            if ($("#search-results").length !== 0) {
                $("#search").show();
                $("body").trigger("searchEvent");
            }
            let index = navbarPath.lastIndexOf("/");
            let navrel = "";
            if (index > -1) {
                navrel = navbarPath.substr(0, index + 1);
            }
            $("#navbar>ul").addClass("navbar-nav");
            let currentAbsPath = util.toAbsoluteURL(window.location.pathname);
            // set active item
            $("#navbar").find<HTMLAnchorElement>("a[href]").each((i, e) => {
                let href = $(e).attr("href")!;
                if (href.includes("$ProductSpinal$")){
                    const platform = $("meta[property='docfx:platform']").attr("content")!;
                    href = href.replace("$ProductSpinal$", `ignite-ui-${platform}`);
                    $(e).attr("href", href);
                }
                if (util.isRelativePath(href)) {
                    href = navrel + href;
                    $(e).attr("href", href);
                    let isActive = false;
                    let originalHref = e.name;
                    if (originalHref) {
                        originalHref = navrel + originalHref;
                        if (
                            util.getDirectory(util.toAbsoluteURL(originalHref)) ===
                            util.getDirectory(util.toAbsoluteURL(tocPath))
                        ) {
                            isActive = true;
                        }
                    } else {
                        if (util.toAbsoluteURL(href) === currentAbsPath) {
                            isActive = true;
                        }
                    }
                    if (isActive) {
                        $(e).addClass(this.active);
                    }
                }
            });
            this.renderNavbar();
        });
    }


    public changeHelloBarContent(currentRoute: string) {
        let text = $('.ui-hello-bar__text');
        let button = $('#hello-bar_cta');

        let $platformMeta = $("meta[property='docfx:platform']");
        let platform = $platformMeta.attr("content")!;

        let barText = localization.localize('angular', 'gridsBarText');
        let barButtonText = localization.localize('angular', 'gridsBarButtonText');
        let buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-angular/download';
        let buttonXdGaLabelValue = localization.localize('angular', 'gridsButtonXdGaLabelValue');
        let buttonGaLabelValue = localization.localize('angular', 'gridsButtonGaLabelValue');

        if (platform === 'appbuilder') {
            barText = localization.localize('appbuilder', 'barText');
            barButtonText = localization.localize('appbuilder', 'barButtonText');
            buttonHrefValue = 'https://appbuilder.indigo.design/';
            buttonXdGaLabelValue = localization.localize('appbuilder', 'buttonXdGaLabelValue');
            buttonGaLabelValue = localization.localize('appbuilder', 'buttonGaLabelValue');
        } else if (platform === 'blazor') {
            if (currentRoute.includes('charts')) {
                barText = localization.localize('blazor', 'chartsBarText');
                barButtonText = localization.localize('blazor', 'chartsBarButtonText');
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download';
                buttonXdGaLabelValue = localization.localize('blazor', 'chartsButtonXdGaLabelValue');
                buttonGaLabelValue = localization.localize('blazor', 'chartsButtonGaLabelValue');
            } else {
                barText = localization.localize('blazor', 'gridsBarText');
                barButtonText = localization.localize('blazor', 'gridsBarButtonText');
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download';
                buttonXdGaLabelValue = localization.localize('blazor', 'gridsButtonXdGaLabelValue');
                buttonGaLabelValue = localization.localize('blazor', 'gridsButtonGaLabelValue');
            }
        } else if (platform === 'angular') {
            if (currentRoute.includes('charts')) {
                barText = localization.localize('angular', 'chartsBarText');
                barButtonText = localization.localize('angular', 'chartsBarButtonText');
                buttonXdGaLabelValue = localization.localize('angular', 'chartsButtonXdGaLabelValue');
                buttonGaLabelValue = localization.localize('angular', 'chartsButtonGaLabelValue');
            }
        }

        text.text(barText);
        button.text(barButtonText);
        button.attr('href', buttonHrefValue);
        button.attr('data-ga-label', buttonGaLabelValue);
        button.attr('data-xd-ga-label', buttonXdGaLabelValue);
    }

    private attachHelloBarCloseBtnEvent() {
        let anchor = $('#hello-bar-dismiss');
        let main = $('#main');
        main.css('padding-top', '180px')

        let parent = $(anchor).parent() as unknown as JQuery<HTMLLIElement>;
        anchor.on('click', (e) => {
            parent.css('display','none');
            main.css('padding-top', '124px');
        });
    }

}