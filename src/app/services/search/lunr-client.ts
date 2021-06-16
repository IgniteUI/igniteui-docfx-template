import { fromEvent } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import SearchWorker from 'worker-loader!./lunr-search';
import { INavigationOptions } from '../../types';
import { Router } from '../router';
import util from '../utils';
import { ILunr, ISearchItem } from './types';
/**
 * Here we are in the client side context of the search, which sends messages to web worker (if the browser supports web workers)
 */
const router = Router.getInstance();
/**
 * Defining the search web worker
 */
let worker: SearchWorker;
/**
 * Defining the search query
 */
let query: string;
/**
 * The navigation options, which will be provided when a the link of a search result is triggered
 */
let navigationOptions: INavigationOptions = {
  stateAction: "push",
  navigationPostProcess: () => {
    $("#search-query").val("");
    flipContents("show");
    $(".sidenav").css("visibility", "visible");
    util.highlightKeywords(query);
  }
}

/**
 * The starting point of the search.
 * If the browser does not support web worker then the search will be handled by the main thread
 */
export function enableSearch() {

  try {
    worker = new SearchWorker();
    if (!worker && !window.Worker) {
      localSearch();
    } else {
       webWorkerSearch();
    }

    addSearchEvent();
  } catch (e) {
    console.error(e);
  }
}

function addSearchEvent() {

  /**
   * Attaching the searhc event.
   * On search event the TOC, Article and affix are hidden.
   * The search event is triggered when there are at least 3 characters in the search query
   */
  $("body").on("searchEvent", () => {

    const $searchInput = $("#search-query"),
      $keyUp = fromEvent<JQuery.TriggeredEvent>($searchInput, "keyup");
    $searchInput.off("keydown");
    $searchInput.on("keypress", e => e.key !== "Enter");

    $keyUp.pipe(
      debounceTime(100),
      map<JQuery.TriggeredEvent, string>(e => $(e.target).val()! as string),
      tap(searchText => query = searchText)
    ).subscribe(searchText => {
      if (searchText.length < 3) {
        flipContents("show");
      } else {
        flipContents("hide");
        $("body").trigger("queryReady");
        $("#search-results>.search-list").text(
          'Search Results for "' + query + '"'
        );
      }
    });
  });
}

/**
 * Toggling the TOC, Article and Affix
 * @param action 
 * @param specificSelector 
 */
function flipContents(action: string, specificSelector = "") {
  if (action === "show") {
    $(".hide-when-search" + specificSelector).show();
    $(window).scrollTop(0);
    $("#search-results").hide();
  } else {
    $(".hide-when-search" + specificSelector).hide();
    $("#search-results").show();
  }
}

/**
 * When a search result is returned, a piece of the content, where the search text is contained is rendered
 * @param content - the search result content
 * @returns 
 */
function extractContentBrief(content: string): string {
  const briefOffset = 512,
    words = query.split(/\s+/g),
    queryIndex = content.indexOf(words[0]);

  if (queryIndex > briefOffset) {
    return (
      "..." +
      content.slice(queryIndex - briefOffset, queryIndex + briefOffset) +
      "..."
    );
  } else if (queryIndex <= briefOffset) {
    return content.slice(0, queryIndex + briefOffset) + "...";
  }

  return "";
}

/**
 * Handler for search results. 
 * Here are all of the search results rendered in the site, contained by a paginator
 * @param hits -  the search results returned from the search process
 */
function handleSearchResults(hits: ISearchItem[]) {
  const numPerPage = 10,
    $paginator = $("#pagination"),
    $hitBloks = $("#search-results>.sr-items");
    $paginator.empty();
    $paginator.removeData("twbs-pagination");

  if (hits.length === 0) {
    $hitBloks.html("<p>No results found</p>");
  } else {
    $("#pagination").twbsPagination({
      totalPages: Math.ceil(hits.length / numPerPage),
      visiblePages: 5,
      onPageClick: (event: JQuery.TriggeredEvent, page: number) => {
        $(window).scrollTop(0);
        const start = (page - 1) * numPerPage,
          curHits = hits.slice(start, start + numPerPage);

        $hitBloks.empty().append(curHits.map(createHitBlock));

        query.split(/\s+/).forEach((word) => {
          if (word !== "") {
            $("#search-results>.sr-items *").mark(word, {className: 'markedjs-item'});
          }
        });
      }
    });
  }
}

/**
 * Creates a search results element with, containing the Title, href and part of the hit topic
 * @param hit - a search result
 * @returns 
 */
const createHitBlock = (hit: ISearchItem): JQuery<HTMLElement> => {
  const itemRawHref = location.origin + util.baseDir + hit.href,
    itemHref = util.baseDir + hit.href,
    itemBrief = extractContentBrief(hit.keywords),
    $itemHrefNode = $("<div>").attr("class", "item-href").text(itemRawHref),
    $itemBriefNode = $("<div>").attr("class", "item-brief").text(itemBrief),
    itemTitle = hit.title,
    $hitBlock = $("<div>").attr("class", "sr-item"),
    $itemTitleNode = $("<div>").attr("class", "item-title"),
    $hitAnchor = $("<a>");

  $hitAnchor.attr("href", itemHref)
    .attr("target", "_blank")
    .text(itemTitle);

  $hitAnchor.on("click", (e: JQuery.TriggeredEvent) => {
    e.preventDefault();
    const $target = $(e.target);
    let locationHref: string;
    if($target.is(".markedjs-item")){
      locationHref = $target.parent("a").attr("href")!;
    } else {
      locationHref = $(e.target).attr("href")!;
    }
    flipContents("show", ".sidenav");
    $(".sidenav").css("visibility", "hidden");

    router.navigateTo(locationHref, navigationOptions);
  });

  $itemTitleNode.append($hitAnchor);

  if(util.removeHTMLExtensionFromUrl) {
    $itemHrefNode.text($itemHrefNode.text().replace(".html", ""));
  }

  $hitBlock
    .append($itemTitleNode)
    .append($itemHrefNode)
    .append($itemBriefNode);

  return $hitBlock;
}

/**
 * Creates a lunr instance in the main thread to handle the search
 */
function localSearch() {
  console.log("Using local search");
  const lunrInstance: ILunr = { index: undefined, data: {} };
  const indexPath = `${util.baseDir}index.json`;

  if (indexPath) {
    $.get(indexPath).done(data => {
      lunrInstance.data = JSON.parse(data);
      import("lunr").then(lunrModule => {
        const lunr = lunrModule.default;
        lunr.tokenizer(/[\s\-\.]+/);

        lunrInstance.index = lunr(function () {
          this.ref("href");
          this.field("title", { boost: 20 });
          this.field("keywords", { boost: 50 });

          for (let prop in lunrInstance.data) {
            if (lunrInstance.data.hasOwnProperty(prop)) {
              this.add(lunrInstance.data[prop]);
            }
          }
        });

        $("body").on("queryReady", () => {
          let hits = lunrInstance.index?.search(query);
          let results: ISearchItem[] = [];
          hits?.forEach((hit) => {
            let item = lunrInstance.data[hit.ref];
            results.push({
              href: item.href,
              title: item.title,
              keywords: item.keywords
            });
          });
          handleSearchResults(results);
        });
      });
    })
  }
}

/**
 * Instantiates the web worker to handle the search
 */
function webWorkerSearch() {
  console.log("using Web Worker");
  let indexReady: JQuery.Deferred<any>;
  /**
   * When the search worker is instantiated a message is send to the web worker with the base path of the docfx site
   */
  worker.postMessage({ basePath: util.baseDir });

  indexReady = $.Deferred();

  worker.onmessage = (oEvent) => {
    switch (oEvent.data.e) {
      case "index-ready":
        indexReady.resolve();
        break;
      case "query-ready":
        let hits = oEvent.data.d;
        handleSearchResults(hits);
        break;
    }
  };

  indexReady.promise().done(() => {
    $("body").on("queryReady", () => {
      worker.postMessage({
        q: query
      });
    });
  });
}
