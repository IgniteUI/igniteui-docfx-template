import { RenderingService } from './services/common';
import {
        AffixRenderingService, 
        ArticleRenderingService,
        NavbarRenderingService,
        ResizingService,
        TocRenderingService
    } from './services/index';
import '../src/styles/main.scss';
import 'bootstrap';
$(() => {
    let navbarService = new NavbarRenderingService();
    let resizingService = new ResizingService();
    let tocService = new TocRenderingService(resizingService);
    let affixService = new AffixRenderingService(resizingService);
    let articleService = new ArticleRenderingService();
    let services:Array<RenderingService> = [ affixService, navbarService, articleService, tocService];
    services.forEach(service => service.render());
})