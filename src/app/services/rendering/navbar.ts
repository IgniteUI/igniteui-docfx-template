import util from "../utils";
import { RenderingService } from "../../types";
import { ConstantsEn } from "../../../i18n/constants-en";
import { ConstantsJP } from "../../../i18n/constants-jp";

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

        let hellobar = $("#hello-bar")[0];
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

        let currentLang = $('html')[0].lang;

        let barText = currentLang === 'en' ? ConstantsEn.angularGrids.barText : ConstantsJP.angularGrids.barText;
        let barButtonText = currentLang === 'en' ? ConstantsEn.angularGrids.barButtonText : ConstantsJP.angularGrids.barButtonText;
        let buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-angular/download';
        let buttonXdGaLabelValue = currentLang === 'en' ? ConstantsEn.angularGrids.buttonXdGaLabelValue : ConstantsJP.angularGrids.buttonXdGaLabelValue;
        let buttonGaLabelValue = currentLang === 'en' ? ConstantsEn.angularGrids.buttonGaLabelValue : ConstantsJP.angularGrids.buttonGaLabelValue;

        if (platform === 'appbuilder') {
            barText = currentLang === 'en' ? ConstantsEn.appbuilder.barText : ConstantsJP.appbuilder.barText;
            barButtonText = currentLang === 'en' ? ConstantsEn.appbuilder.barButtonText : ConstantsJP.appbuilder.barButtonText;
            buttonHrefValue = 'https://appbuilder.indigo.design/'
            buttonXdGaLabelValue = currentLang === 'en' ? ConstantsEn.appbuilder.buttonXdGaLabelValue : ConstantsJP.appbuilder.buttonXdGaLabelValue;
            buttonGaLabelValue = currentLang === 'en' ? ConstantsEn.appbuilder.buttonGaLabelValue : ConstantsJP.appbuilder.buttonGaLabelValue;

        } else if (platform === 'blazor') {
            if (currentRoute.includes('charts')) {
                barText = currentLang === 'en' ? ConstantsEn.blazorCharts.barText : ConstantsJP.blazorCharts.barText;
                barButtonText = currentLang === 'en' ? ConstantsEn.blazorCharts.barButtonText : ConstantsJP.blazorCharts.barButtonText;
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download'
                buttonXdGaLabelValue = currentLang === 'en' ? ConstantsEn.blazorCharts.buttonXdGaLabelValue : ConstantsJP.blazorCharts.buttonXdGaLabelValue;
                buttonGaLabelValue = currentLang === 'en' ? ConstantsEn.blazorCharts.buttonGaLabelValue : ConstantsJP.blazorCharts.buttonGaLabelValue;
            } else {
                barText = currentLang === 'en' ? ConstantsEn.blazorGrids.barText : ConstantsJP.blazorGrids.barText;
                barButtonText = currentLang === 'en' ? ConstantsEn.blazorGrids.barButtonText : ConstantsJP.blazorGrids.barButtonText;
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download'
                buttonXdGaLabelValue = currentLang === 'en' ? ConstantsEn.blazorGrids.buttonXdGaLabelValue : ConstantsJP.blazorGrids.buttonXdGaLabelValue;
                buttonGaLabelValue = currentLang === 'en' ? ConstantsEn.blazorGrids.buttonGaLabelValue : ConstantsJP.blazorGrids.buttonGaLabelValue;
            }
        } else if (platform === 'angular') {
            if (currentRoute.includes('charts')) {
                barText = currentLang === 'en' ? ConstantsEn.angularCharts.barText : ConstantsJP.angularCharts.barText;
                barButtonText = currentLang === 'en' ? ConstantsEn.angularCharts.barButtonText : ConstantsJP.angularCharts.barButtonText
                buttonXdGaLabelValue = currentLang === 'en' ? ConstantsEn.angularCharts.buttonXdGaLabelValue : ConstantsJP.angularCharts.buttonXdGaLabelValue
                buttonGaLabelValue = currentLang === 'en' ? ConstantsEn.angularCharts.buttonGaLabelValue : ConstantsJP.angularCharts.buttonGaLabelValue
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
        main.css('padding-top', '200px')

        let parent = $(anchor).parent() as unknown as JQuery<HTMLLIElement>;
        anchor.on('click', (e) => {
            parent.css('display','none');
            main.css('padding-top', '124px');
        });
    }

}