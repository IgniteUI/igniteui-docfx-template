import utils from "../utils";

let worker: Worker;
export function enableSearch() {
    let query: string;
    let base = $("meta[name='base']").attr("content");
    try {
      worker = new Worker(location.origin + `${base}/searchWorker.js`);
      if (!worker && !window.Worker) {
        // localSearch();
      } else {
        webWorkerSearch();
      }

    //   renderSearchBox();
      highlightKeywords();
      addSearchEvent();
    } catch (e) {
      console.error(e);
    }

    //Adjust the position of search box in navbar
    function renderSearchBox() {
      autoCollapse();
      $(window).on("resize", autoCollapse);
      $(document).on("click", ".navbar-collapse.in", (e) => {
        if ($(e.target).is("a")) {
          $(e.target).collapse("hide");
        }
      });

      function autoCollapse() {
        let navbar = $("#autocollapse");
        if (navbar.height() === null) {
          setTimeout(autoCollapse, 300);
        }
        navbar.removeClass("collapsed");
        if (navbar.height()! > 60) {
          navbar.addClass("collapsed");
        }
      }
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

    function webWorkerSearch() {
      console.log("using Web Worker");
      let indexReady = $.Deferred();

      worker.onmessage = function (oEvent) {
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

      indexReady.promise().done(function () {
        $("body").on("queryReady", function () {
          worker.postMessage({
            q: query
          });
        });
      });
    }

    // Highlight the searching keywords
    function highlightKeywords() {
      let q = url("?q");
      if (q != null) {
        let keywords = q.split("%20");
        keywords.forEach(function (keyword) {
          if (keyword !== "") {
            $(".data-searchable *").mark(keyword);
            $("article *").mark(keyword);
          }
        });
      }
    }

    function addSearchEvent() {
      $("body").bind("searchEvent", function () {
        $("#search-query").keypress(function (e) {
          return e.which !== 13;
        });

        $("#search-query")
          .keyup(function () {
            query = $(this).val()! as string;
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
      let briefContent;
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
          onPageClick: function (event: JQuery.TriggeredEvent, page: any) {
            $("body, html").animate({scrollTop: 0}, 300);
            let start = (page - 1) * numPerPage;
            let curHits = hits.slice(start, start + numPerPage);
            $("#search-results>.sr-items")
              .empty()
              .append(
                curHits.map(function (hit) {
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
            query.split(/\s+/).forEach(function (word) {
              if (word !== "") {
                $("#search-results>.sr-items *").mark(word);
              }
            });
          }
        });
      }
    }
  }
