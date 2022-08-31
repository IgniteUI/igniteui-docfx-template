import util from "../utils";
import { RenderingService } from "../../types";

export class NavbarRenderingService extends RenderingService {

    constructor() {
        super();
    }

    public render() {
        this.renderNavbar();
        this.changeHelloBarContent(location.pathname);
        this.attachCloseBtnEvent();
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

        let barText = 'Want the Fastest Angular Data Grid on the Market? We’ve Got It! Quickly Bind Data with Minimal Code Involved.';
        let barButtonText = 'Get Started';
        let buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-angular/download';
        let buttonXdGaLabelValue = 'Help_AngularGrids_Trial';
        let buttonGaLabelValue = 'Hello bar – Help_AngularGrids_Trial';

        if (platform === 'appbuilder') {
            barText = 'App Builder™ Includes a Full Design System with 60+ UI Controls and Code Generation for Angular & Blazor!';
            barButtonText = 'Start Free Trial';
            buttonHrefValue = 'https://appbuilder.indigo.design/'
            buttonXdGaLabelValue = 'Help_ABTrial';
            buttonGaLabelValue = 'Hello bar – Help_ABTrial';

        } else if (platform === 'blazor') {
            if (currentRoute.includes('charts')) {
                barText = 'Create Charts & Dashboards for Your Modern C# Blazor Web and Mobile Apps with Over 65 High-Performing Charts & Graphs in Ignite UI!';
                barButtonText = 'Try It Free';
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download'
                buttonXdGaLabelValue = 'Help_BlazorCharts_Trial';
                buttonGaLabelValue = 'Hello bar – Help_BlazorCharts_Trial';
            } else {
                barText = 'Ignite UI for Blazor: Feature-Rich, Lightweight Tables & Data Grids to Modernize Your Apps!';
                barButtonText = 'Start Free Trial';
                buttonHrefValue = 'https://www.infragistics.com/products/ignite-ui-blazor/download'
                buttonXdGaLabelValue = 'Help_BlazorGrids_Trial';
                buttonGaLabelValue = 'Hello bar – Help_BlazorGrids_Trial';
            }
        } else if (platform === 'angular') {
            if (currentRoute.includes('charts')) {
                barText = 'Ignite UI Angular Charts: Build Expressive Dashboards and Render Data Points with 65+ Real-Time Angular Charts.';
                barButtonText = 'Start Free Trial';
                buttonXdGaLabelValue = 'Help_AngularCharts_Trial';
                buttonGaLabelValue = 'Hello bar – Help_AngularCharts_Trial';
            }
        }

        text.text(barText);
        button.text(barButtonText);
        button.attr('href', buttonHrefValue);
        button.attr('data-ga-label', buttonGaLabelValue);
        button.attr('data-xd-ga-label', buttonXdGaLabelValue);
    }

    private attachCloseBtnEvent() {
        let anchor = $('#hello-bar-dismiss');
        let main = $('#main');

        let parent = $(anchor).parent() as unknown as JQuery<HTMLLIElement>;
        anchor.on('click', (e) => {
            parent.css('display','none');
            main.css('padding-top', '124px');
        });
    }

}