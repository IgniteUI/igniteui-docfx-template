import '../src/styles/main.scss';
import 'bootstrap';
import 'jquery-ui';
import "lazysizes";
import { RenderingService } from './services/common';
import { CodeView } from './services/code-view';
import {
        AffixRenderingService, 
        ArticleRenderingService,
        NavbarRenderingService,
        ResizingService,
        TocRenderingService
    } from './services/index';
import {IgViewer} from './shared/igViewer.common';
import {initNavigation} from './services/navigation';
import { IThemingData } from './shared/types';

$(() => {
    $.widget("custom.codeView", new CodeView())
    let navbarService = new NavbarRenderingService();
    let resizingService = new ResizingService();
    let tocService = new TocRenderingService(resizingService);
    let affixService = new AffixRenderingService(resizingService);
    let articleService = new ArticleRenderingService();
    let services: Array<RenderingService> = [affixService, navbarService, articleService, tocService];
    services.forEach(service => service.render());
    
    let igViewer = IgViewer.getInstance();
    initNavigation();
    igViewer.adjustTopLinkPos();

    document.addEventListener('lazyloaded', (e: Event) =>{
        $(e.target!).parent().removeClass("loading");
        if (!igViewer.isDvPage() && !$(e.target!).hasClass("no-theming")) {
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
})
