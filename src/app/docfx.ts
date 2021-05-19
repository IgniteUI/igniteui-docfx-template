import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "lazysizes";
import { RenderingService } from './types';
import { CodeView } from './services/code-view/code-view';
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
import { CodeService } from './services/code-view/base-code-service';
import { AngularCodeService } from './services/code-view/angular-code-service';
import { XplatCodeService } from './services/code-view/xplat-code-service';

$(() => {
    $.widget("custom.codeView", new CodeView())
    let navbarService = new NavbarRenderingService(),
        resizingService = new ResizingService(),
        tocService = new TocRenderingService(resizingService),
        affixService = new AffixRenderingService(resizingService),
        articleService = new ArticleRenderingService(),
        services: Array<RenderingService> = [affixService, navbarService, articleService, tocService];
    services.forEach(service => service.render());

    let igViewer = IgViewer.getInstance(),
        platformMeta: JQuery<HTMLElement>,
        codeService: CodeService,
        platform: string;

        initNavigation();
        igViewer.adjustTopLinkPos();
        attachLazyLoadHandler();
        attachThemingHandler();
        platformMeta = $("meta[property='docfx:platform']");
        if (!platformMeta) {
            return;
        }
        platform = platformMeta.attr("content")!;
        if (platform === "angular") {
            codeService = new AngularCodeService();
        } else {
            codeService = new XplatCodeService(platform);
        }
        codeService.init();

});

