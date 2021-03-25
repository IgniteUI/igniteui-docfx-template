import util from "../shared/utils";;
import { RenderingService } from "../shared/types";;

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
            let currentAbsPath = util.getAbsolutePath(window.location.pathname);
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
                            util.getDirectory(util.getAbsolutePath(originalHref)) ===
                            util.getDirectory(util.getAbsolutePath(tocPath))
                        ) {
                            isActive = true;
                        }
                    } else {
                        if (util.getAbsolutePath(href) === currentAbsPath) {
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

}