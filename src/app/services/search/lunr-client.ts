import { fromEvent } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import SearchWorker from 'worker-loader!./lunr-search';
import { INavigationOptions } from '../../types';
import { Router } from '../router';
import util from '../utils';
import { ILunr, ISearchItem } from './types';

const router = Router.getInstance();
let worker: SearchWorker;
let query: string;
let navigationOptions: INavigationOptions = {
  stateAction: "push",
  navigationPostProcess: () => {
    $("#search-query").val("");
    flipContents("show");
    $(".search-clear-icon").hide();
    $(".sidenav").css("visibility", "visible");
    util.highlightKeywords(query);
  }
}

export function enableSearch() {

  try {
    worker = new SearchWorker();
    if (!worker && !window.Worker) {
      localSearch();
    } else {
       webWorkerSearch();
    }

    addSearchEvent();
    addClearSearchEvent();
  } catch (e) {
    console.error(e);
  }
}

function addClearSearchEvent() {
  $(".search-clear-icon").on("click", () => {
    $("#search-query").val("")
    flipContents("show");
    $(".search-clear-icon").hide();
  })
}

function addSearchEvent() {

  $("body").on("searchEvent", () => {
    const $searchInput = $("#search-query");
    
    if ($searchInput.length === 0) {
      return;
    }

    const $keyUp = fromEvent<JQuery.TriggeredEvent>($searchInput, "keyup");
    $searchInput.off("keydown");
    $searchInput.on("keypress", e => e.key !== "Enter");

    $keyUp.pipe(
      tap(()=> $(".search-clear-icon").show()),
      debounceTime(100),
      map<JQuery.TriggeredEvent, string>(e => $(e.target).val()! as string),
      tap(searchText => query = searchText)
    ).subscribe(searchText => {
      if (searchText.length < 3) {
        if (searchText.length === 0){
          $(".search-clear-icon").hide();
        }
        flipContents("show");
      } else {
        flipContents("hide");
        $("body").trigger("queryReady");
        if ($('html')[0].lang === "ja"){
          $("#search-results>.search-list").text(
            '"' + query + '" の検索結果'
          );
        }else {
          $("#search-results>.search-list").text(
            'Search Results for "' + query + '"'
          );
        }
      }
    });
  });
}

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

function handleSearchResults(hits: ISearchItem[]) {
  const numPerPage = 10,
    $paginator = $("#pagination"),
    $hitBloks = $("#search-results>.sr-items");
    $paginator.empty();
    $paginator.removeData("twbs-pagination");

  if (hits.length === 0) {
    if ($('html')[0].lang === "ja") {
      $hitBloks.html("<p>結果が見つかりませんでした</p>");
    }else {
      $hitBloks.html("<p>No results found</p>");
    }
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

function webWorkerSearch() {
  console.log("using Web Worker");
  let indexReady: JQuery.Deferred<any>;
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
