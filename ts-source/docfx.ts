import '../src/styles/main.scss';
import 'bootstrap';
import 'jquery-ui';
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
})
