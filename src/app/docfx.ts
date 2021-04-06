import '../styles/main.scss';
import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "lazysizes";
import { RenderingService } from './types';
import { CodeView, createCodeService } from './services/code-view/index';
import {
        AffixRenderingService,
        ArticleRenderingService,
        NavbarRenderingService,
        TocRenderingService
} from './services/rendering/index';
import { IgViewer } from './services/igViewer.common';
import { ResizingService } from './services/resizing';
import { attachLazyLoadHandler } from './handlers/lazyload';
import { attachThemingHandler } from './handlers/theming';
import { initNavigation } from './services/navigation';
import { Router } from './services/router';

$(() => {
        $.widget("custom.codeView", new CodeView())
        let router = new Router(),
            codeService = createCodeService(),
            navbarService = new NavbarRenderingService(),
            resizingService = new ResizingService(),
            articleService = new ArticleRenderingService(),
            affixService = new AffixRenderingService(resizingService),
            tocService = new TocRenderingService(resizingService, articleService, affixService, router, codeService),
            igViewer = IgViewer.getInstance(),
            services: Array<RenderingService> = [affixService, navbarService, articleService, tocService];
        
        services.forEach(service => service.render());
        router.connect($("#_content"), () => {
                articleService.render();
                affixService.render();
                codeService?.init();
                tocService.renderBreadcrumb();
        })
        initNavigation();
        igViewer.adjustTopLinkPos();
        attachLazyLoadHandler();
        attachThemingHandler();
        codeService?.init();
});

