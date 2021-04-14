import '../styles/main.scss';
import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "lazysizes";
import { RenderingService } from './types';
import {
        CodeView,
        createCodeService
} from './services/code-view';
import {
        AffixRenderingService,
        ArticleRenderingService,
        NavbarRenderingService,
        TocRenderingService
} from './services/rendering/index';
import {
        attachLazyLoadHandler,
        attachThemingHandler,
        showHideThemingWidget
} from './handlers';
import { ResizingService } from './services/resizing';
import { initNavigation } from './services/navigation';
import { Router } from './services/router';
import util from './services/utils';

$(() => {
        $.widget("custom.codeView", new CodeView())
        let router = Router.getInstance(),
                codeService = createCodeService(),
                navbarService = new NavbarRenderingService(),
                resizingService = new ResizingService(),
                articleService = new ArticleRenderingService(router),
                affixService = new AffixRenderingService(resizingService),
                tocService = new TocRenderingService(resizingService, router),
                services: Array<RenderingService> = [navbarService, tocService, affixService, articleService];

        services.forEach(service => service.render());
        router.connect($("#_article-wrapper"), (scrollPosition?: number) => {
                return new Promise<number | undefined>((resolve) => {
                        codeService?.init();
                        articleService.render();
                        affixService.render();
                        tocService.setActive();
                        tocService.renderBreadcrumb();
                        resizingService.resetObservables();
                        resolve(scrollPosition);

                }).then((scrollPosition) => {
                        if (scrollPosition != null) {
                                $(window).scrollTop(scrollPosition)
                        }
                        showHideThemingWidget($("iframe").length)
                });
        });

        if (util.isOnIndexPage()) {
                router.navigateTo($("meta[name=index]").attr("content")!);
        } else if (util.hasLocationHash()) {
                setTimeout(() => util.scroll(location.hash), 500);
        }

        initNavigation();
        attachLazyLoadHandler();
        attachThemingHandler();
        codeService?.init();
});

