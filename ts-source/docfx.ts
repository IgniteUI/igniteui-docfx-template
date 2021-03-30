import '../src/styles/main.scss';
import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "lazysizes";
import { RenderingService } from './shared/types';
import { CodeView } from './services/code-view';
import {
        AffixRenderingService, 
        ArticleRenderingService,
        NavbarRenderingService,
        ResizingService,
        TocRenderingService
    } from './services/index';
import { IgViewer } from './shared/igViewer.common';
import { attachLazyLoadHandler } from './handlers/lazyload';
import { attachThemingHandler } from './handlers/theming';
import { initNavigation } from './services/navigation';
import { CodeService } from './services/code/base-code-service';
import { AngularCodeService } from './services/code/angular-code-service';
import { XplatCodeService } from './services/code/xplat-code-service';

$(() => {
    $.widget("custom.codeView", new CodeView())
    let navbarService = new NavbarRenderingService();
    let resizingService = new ResizingService();
    let tocService = new TocRenderingService(resizingService);
    let affixService = new AffixRenderingService(resizingService);
    let articleService = new ArticleRenderingService();
    let services: Array<RenderingService> = [affixService, navbarService, articleService, tocService];
    services.forEach(service => service.render());
    
    setTimeout(() => {
        let igViewer = IgViewer.getInstance();
        initNavigation();
        igViewer.adjustTopLinkPos();
        attachLazyLoadHandler();
        attachThemingHandler();
        let platformMeta = $("meta[property='docfx:platform']");
        if (!platformMeta) {
            return;
        }
        let service!: CodeService, platform: string | undefined;
        platform = platformMeta.attr("content")!;
        if (platform === "angular") {
            service = new AngularCodeService();
        } else {
           service = new XplatCodeService(platform);
        }
        service.init();
    });

})
