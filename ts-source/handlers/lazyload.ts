import {IgViewer} from '../shared/igViewer.common';
import { IThemingData } from '../shared/types';

export function attachLazyLoadHandler() {
    document.addEventListener('lazyloaded', (e: Event) =>{
        $(e.target!).parent().removeClass("loading");
        if (!IgViewer.getInstance().isDvPage() && !$(e.target!).hasClass("no-theming")) {
            var isIE = !((window as any).ActiveXObject) && "ActiveXObject" in window;
            var targetOrigin = document.body.getAttribute("data-demos-base-url")!;
            var theme = window.sessionStorage.getItem(isIE ? "theme" : "themeStyle")!;
            var data: IThemingData = { origin: window.location.origin };
            data.themeName =  $('igniteui-theming-widget').length > 0 ?  ($('igniteui-theming-widget') as any)[0].theme.globalTheme: null;
            if (isIE) {
                data.theme = theme;
            } else {
                data.themeStyle = theme;
            }
            (e.target as HTMLIFrameElement)!.contentWindow!.postMessage(data, targetOrigin);
        }
    });
}

