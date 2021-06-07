import { IThemingData } from '../types';
import util from '../services/utils';

export function attachLazyLoadHandler() {
    document.addEventListener('lazyloaded', (e: Event) =>{
        if (!util.isDvPage() && !$(e.target!).hasClass("no-theming")) {
            let targetOrigin = document.body.getAttribute("data-demos-base-url")!;
            let theme = window.sessionStorage.getItem(util.isIE ? "theme" : "themeStyle")!;
            let data: IThemingData = { origin: window.location.origin };
            data.themeName =  $('igniteui-theming-widget').is(":visible") ?  ($('igniteui-theming-widget') as any)[0].theme.globalTheme : null;
            if (util.isIE) {
                data.theme = theme;
            } else {
                data.themeStyle = theme;
            }
            (e.target as HTMLIFrameElement)!.contentWindow!.postMessage(data, targetOrigin);
        }
        $(e.target!).parent().removeClass("loading");
    });
}

