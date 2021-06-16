import 'babel-polyfill';
import 'bootstrap';
import 'jquery-ui';
import "mark.js/dist/jquery.mark.min.js";
import "twbs-pagination";
import "lazysizes";
/** The above defined imports are used for third party libraries that do not have type definition files
 *  and this way we are ensuring that in post-transpile time these libraries are going to be available in our output code bundle. */
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

/**  
 * This is used for bootstrapping the whole docfx site.
 * Most of the logic below is for manipulating the already defined html elements.
 * The html elements of the docfx site comes from the `tmpl.partial` files.
 * Every service is a singleton.
 */
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
        /** Initially we render the navbar and the TOC, because most of the logic there is asynchronous */
        services.forEach(service => service.render());
        /** Attaching the router to the element, which will contain every article content and defining the default navigation handler */
        router.connect($("#_article-wrapper"), (adjustTocScrollPosition: boolean, scrollPosition?: number) => {
                return new Promise<number | undefined>((resolve) => {
                        codeService?.init();
                        articleService.render();
                        affixService.render();
                        if(adjustTocScrollPosition) {
                                tocService.setActive();
                        }
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

        /** 
         * The index page is basically the outlet for the docfx site. It does not have any content in it and
         * must redirect to the initial topic page, which every docfx must have.
         * For the angular docfx the index page is - https://www.infragistics.com/products/ignite-ui-angular/angular
         * The initial topic is denoted with the [`_initialPage`](https://github.com/IgniteUI/igniteui-docfx/blob/master/en/global.json#L14) global variable in the `docfx.json`.
         * The below code handles the cases where we start the docfx site from the index page or we start it directly from a topic (e.g. https://www.infragistics.com/products/ignite-ui-angular/angular/components/general/ignite-ui-licensing)
         */
        if (util.isOnIndexPage()) {
                $("#_article-content-wrapper").removeClass("null-opacity");
                router.navigateTo($("meta[name=index]").attr("content")!);
        } else {
                (async () => {
                        await new Promise<void>((resolve) => {
                                articleService.render();
                                affixService.render();
                                resolve();
                        }).then(() => {
                                $("#_article-content-wrapper").removeClass("null-opacity");
                                /** If the topic href contains a hash we scroll to that hash location in the article (e.g. https://www.infragistics.com/products/ignite-ui-angular/angular/components/grid/grid#angular-grid-column-configuration) */
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

