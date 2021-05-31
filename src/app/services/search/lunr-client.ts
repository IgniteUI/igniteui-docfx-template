import { fromEvent } from 'rxjs';
import { debounceTime, map, tap } from 'rxjs/operators';
import SearchWorker from 'worker-loader!./lunr-search';
import { Router } from '../router';
import util from '../utils';
import { ISearchItem } from './types';

const router = Router.getInstance();
const base = $("meta[name='base-dir']").attr("content");
let worker: SearchWorker;
let query: string;

export function enableSearch() {

  try {
    worker = new SearchWorker();
    if (!worker && !window.Worker) {
      // localSearch();
    } else {
      webWorkerSearch();
    }

    util.highlightKeywords();
    addSearchEvent();
  } catch (e) {
    console.error(e);
  }

  // // Search factory
  // function localSearch() {
  //   console.log("using local search");
  //   let lunrIndex = lunr(function () {
  //     this.ref("href");
  //     this.field("title", {
  //       boost: 50
  //     });
  //     this.field("keywords", {
  //       boost: 20
  //     });
  //   });
  //   lunr.tokenizer.seperator = /[\s\-\.]+/;
  //   let searchData = {};
  //   let searchDataRequest = new XMLHttpRequest();

  //   let indexPath = relHref + "index.json";
  //   if (indexPath) {
  //     searchDataRequest.open("GET", indexPath);
  //     searchDataRequest.onload = function () {
  //       if (this.status != 200) {
  //         return;
  //       }
  //       searchData = JSON.parse(this.responseText);
  //       for (let prop in searchData) {
  //         if (searchData.hasOwnProperty(prop)) {
  //           lunrIndex.add(searchData[prop]);
  //         }
  //       }
  //     };
  //     searchDataRequest.send();
  //   }

  //   $("body").bind("queryReady", function () {
  //     let hits = lunrIndex.search(query);
  //     let results = [];
  //     hits.forEach(function (hit) {
  //       let item = searchData[hit.ref];
  //       results.push({
  //         href: item.href,
  //         title: item.title,
  //         keywords: item.keywords
  //       });
  //     });
  //     handleSearchResults(results);
  //   });
  // }
}

function addSearchEvent() {

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

function flipContents(action: string) {
  if (action === "show") {
    $(".hide-when-search").show();
    $(window).scrollTop(0);
    $("#search-results").hide();
  } else {
    $(".hide-when-search").hide();
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
            $("#search-results>.sr-items *").mark(word);
          }
        });
      }
    });
  }
}

const createHitBlock = (hit: ISearchItem): JQuery<HTMLElement> => {
  const itemRawHref = location.origin + base + hit.href,
    itemHref = base + hit.href + "?q=" + query,
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

    router.navigateTo($(e.target).attr("href")!, true, undefined, () => {
      let top = 0;

      $("#search-query").val("");
      flipContents("show");
      
      $(".sidetoc").scrollTop(0);

      $($("#toc a.active").
        parents("li").get().reverse()).
        each((i, e) => {
          $(e).addClass("in");
          top += $(e).position().top;
        });
      top = top - 50;
      $(".sidetoc").scrollTop(top);

      util.highlightKeywords();
    });
  });

  $itemTitleNode.append($hitAnchor);

  $hitBlock
    .append($itemTitleNode)
    .append($itemHrefNode)
    .append($itemBriefNode);

  return $hitBlock;
}

function webWorkerSearch() {
  console.log("using Web Worker");
  let baseAbs = util.toAbsoluteURL($("meta[name=data-docfx-rel]").attr("content")!),
    indexReady: JQuery.Deferred<any>;
  worker.postMessage({ basePath: baseAbs });

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
