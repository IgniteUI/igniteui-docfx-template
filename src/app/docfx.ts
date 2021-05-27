import '../styles/main.scss';
import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "mark.js/dist/jquery.mark.min.js";
import "js-url";
import "twbs-pagination";
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
import {enableSearch} from './services/search/lunr-client';

$(() => {
        enableSearch();
        $.widget("custom.codeView", new CodeView())
        let router = Router.getInstance(),
                codeService = createCodeService(),
                navbarService = new NavbarRenderingService(),
                resizingService = new ResizingService(),
                articleService = new ArticleRenderingService(router),
                affixService = new AffixRenderingService(resizingService),
                tocService = new TocRenderingService(resizingService, router),
                services: Array<RenderingService> = [navbarService, tocService];

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
                        showHideThemingWidget($("iframe").length);
                });
        });

        if (util.isOnIndexPage()) {
                $("#_article-wrapper").removeClass("null-opacity");
                router.navigateTo($("meta[name=index]").attr("content")!);
        } else {
                (async () => {
                        await new Promise<void>((resolve) => {
                                articleService.render();
                                affixService.render();
                                resolve();
                        }).then(() => {
                                $("#_article-wrapper").removeClass("null-opacity");
                                if (util.hasLocationHash()) {
                                        setTimeout(() => util.scroll(location.hash), 500);
                                }
                                codeService?.init();
                        });
                })();
        }

        showHideThemingWidget($("iframe").length);
        attachLazyLoadHandler();
        attachThemingHandler();
        initNavigation();
});

