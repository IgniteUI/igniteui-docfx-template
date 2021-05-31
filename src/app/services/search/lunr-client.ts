import SearchWorker from 'worker-loader!./lunr-search';
import { Router } from '../router';
import util from '../utils';

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
    $("#search-query").on("keypress", (e) => {
      console.log(e);
      return e.key !== "Enter";
    });
    $("#search-query").on("keyup", (e: JQuery.TriggeredEvent) => {
      console.log(e);
      query = $(e.target).val()! as string;
      if (query.length < 3) {
        flipContents("show");
      } else {
        flipContents("hide");
        $("body").trigger("queryReady");
        $("#search-results>.search-list").text(
          'Search Results for "' + query + '"'
        );
      }
    })
    .off("keydown");
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
  let briefOffset = 512;
  let words = query.split(/\s+/g);
  let queryIndex = content.indexOf(words[0]);
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

function handleSearchResults(hits: any[]) {
  let numPerPage = 10;
  $("#pagination").empty();
  $("#pagination").removeData("twbs-pagination");
  if (hits.length === 0) {
    $("#search-results>.sr-items").html("<p>No results found</p>");
  } else {
    $("#pagination").twbsPagination({
      totalPages: Math.ceil(hits.length / numPerPage),
      visiblePages: 5,
      onPageClick: (event: JQuery.TriggeredEvent, page: any) => {
        $(window).scrollTop(0);
        let start = (page - 1) * numPerPage;
        let curHits = hits.slice(start, start + numPerPage);
        $("#search-results>.sr-items")
          .empty()
          .append(
            curHits.map((hit) => {
              let itemRawHref = location.origin + base + hit.href;
              let itemHref = base + hit.href + "?q=" + query;
              let itemTitle = hit.title;
              let itemBrief = extractContentBrief(hit.keywords);

              let itemNode = $("<div>").attr("class", "sr-item");
              let itemTitleNode = $("<div>")
                .attr("class", "item-title")
                .append(
                  $("<a>")
                    .attr("href", itemHref)
                    .attr("target", "_blank")
                    .text(itemTitle)
                    .on("click", (e: JQuery.TriggeredEvent) => {
                      e.preventDefault();
                      $("#toc a.active").closest("li").addClass("active");
                      router.navigateTo($(e.target).attr("href")!, true, 0, () => {
                        $("#search-query").val("");
                        flipContents("show");
                        $(".sidetoc").scrollTop(0);
                        let top = 0;
                        $("#toc a.active").parents("li").
                          each((i, e) => {
                            $(e).addClass("in");
                            top += $(e).position().top;
                          });
                        top -= 50;
                        $(".sidetoc").scrollTop(top);
                        util.highlightKeywords();
                      });
                    })
                );
              let itemHrefNode = $("<div>")
                .attr("class", "item-href")
                .text(itemRawHref);
              let itemBriefNode = $("<div>")
                .attr("class", "item-brief")
                .text(itemBrief);
              itemNode
                .append(itemTitleNode)
                .append(itemHrefNode)
                .append(itemBriefNode);
              return itemNode;
            })
          );
        query.split(/\s+/).forEach((word) => {
          if (word !== "") {
            $("#search-results>.sr-items *").mark(word);
          }
        });
      }
    });
  }
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
