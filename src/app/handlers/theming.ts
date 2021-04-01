import { IgViewer } from "../services/igViewer.common";
import { IThemingData } from "../types";
import util from '../services/utils';

export function closeContainer() {
    if ($(".toggle").is(":visible")) {
        $(".toggle").slideToggle(200);
      }
}

export function attachThemingHandler() {
    let sampleIframes = document.querySelectorAll("iframe");
    if ($(".themes-container").length !== 0 && sampleIframes.length !== 0 &&
        (!IgViewer.getInstance().isDvPage() || !util.isIE)) {
        $(".themes-container").css('display', 'inline-flex');
    } else {
        return;
    }

    if (util.isIE) {
        $('.theme-select-wrapper').css('display', 'inline-flex');
        $('.theme-select-wrapper').removeClass('theme-wrapper-hide');
        let currentTheme = window.sessionStorage.getItem("theme");
        if (currentTheme) {
            let item = $(".theme-item").filter(`[data-theme=${currentTheme}]`)[0];
            handleThemeSelection(currentTheme, item);
        }


        $(".theme-item").on("click", function (e: JQuery.TriggeredEvent)  {
            if (e.currentTarget!.lastElementChild.tagName === "svg") {
                return;

            }
            let currentTheme = window.sessionStorage.getItem("theme");
            let newTheme = this.getAttribute("data-theme")!;
            if (currentTheme !== newTheme) {
                handleThemeSelection(newTheme, this);
            }
        });

    } else {
        $('.theme-widget-wrapper').removeClass('theme-wrapper-hide');
        let themingWidget = $('igniteui-theming-widget')!;
        if (themingWidget) {
            themingWidget.on('themeChange', (event: JQuery.TriggeredEvent) => {
                window.sessionStorage.setItem('themeStyle', (event.originalEvent! as any).detail);
                sampleIframes.forEach((element) => {
                    if (!$(element).hasClass("no-theming") && (!$(element).hasClass("lazyload") || $(element).hasClass("lazyloaded"))) {
                        let src = element.src || element.dataset.src;
                        let data: IThemingData = {
                            themeStyle: (event.originalEvent! as any).detail,
                            origin: window.location.origin,
                            themeName: (themingWidget[0] as any).theme.globalTheme
                        };
                        element.contentWindow!.postMessage(data, src!);
                    }
                });
            });
        }
    }
}


function handleThemeSelection(theme: string, item?: HTMLElement) {
    if (theme) {
        if (item) {
            postMessage(theme);
        }
        let visibleItems = $(".theme-item:lt(2)");
        let visibleThemes: any[] = [];
        let themeItem = item ? item : $(".theme-item").filter(`[data-theme=${theme}]`)[0];

        $.each(visibleItems, function (i, el) {
            visibleThemes.push(el.getAttribute("data-theme"));
        })

        if (visibleThemes.indexOf(theme) !== -1) {
            selectTheme(themeItem);
        } else {
            closeContainer();
        }
    }
}

function postMessage(theme: string) {
    let targetOrigin = document.body.getAttribute("data-demos-base-url")!;
    let data: IThemingData = { origin: window.location.origin };
    window.sessionStorage.setItem('theme', theme);
    $<HTMLIFrameElement>("iframe").filter((index, iframe) => !$(iframe).hasClass("lazyload")).each((i, e) => {
        if (e.classList.contains("no-theming")) {
            data["theme"] = "default-theme";
        } else {
            data["theme"] = theme;
        }
        let iframeWindow = e.contentWindow!;
        iframeWindow.postMessage(data, targetOrigin);
    });
}

function selectTheme(el: HTMLElement) {
    let oldSelection = document.getElementsByClassName("theme-item--active");
    if (oldSelection.length > 0) {
        oldSelection[0].classList.remove("theme-item--active");
    }
    el.classList.add("theme-item--active");
}

