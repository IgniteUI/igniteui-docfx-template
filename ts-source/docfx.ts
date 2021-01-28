import { RenderingService } from './services/common';
import {
        AffixRenderingService, 
        ArticleRenderingService,
        NavbarRenderingService,
        ResizingService,
        TocRenderingService
    } from './services/index';

$(() => {
    let resizingService = new ResizingService();
    let affixService = new AffixRenderingService(resizingService);
    let navbarService = new NavbarRenderingService();
    let articleService = new ArticleRenderingService();
    let tocService = new TocRenderingService(resizingService);
    let services:Array<RenderingService> = [ affixService, navbarService, articleService, tocService];
    services.forEach(service => service.render());
})