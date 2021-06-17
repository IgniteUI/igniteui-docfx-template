import util from "../services/utils";
import { IThemingData } from "../types";

export function onSampleIframeContentLoaded(target: HTMLIFrameElement) {
    let _iframe = target;
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
}

export function onXPlatSampleIframeContentLoaded (target: HTMLIFrameElement) {
    target.parentElement!.classList.remove("loading");
}

(window as any).onSampleIframeContentLoaded = onSampleIframeContentLoaded;
(window as any).onXPlatSampleIframeContentLoaded = onXPlatSampleIframeContentLoaded;