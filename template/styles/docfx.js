// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.
$(function () {
  var active = "active";
  var expanded = "in";
  var collapsed = "collapsed";
  var filtered = "filtered";
  var show = "show";
  var hide = "hide";
  var util = new utility();
  var theme = window.localStorage.getItem("theme");

  handleThemeSelection(theme);
  highlight();
  enableSearch();

  renderTables();
  renderAlerts();
  renderLinks();
  renderNavbar();
  renderSidebar();
  renderAffix();
  // renderFooter();
  renderLogo();

  breakText();
  renderHeader();
  copyCode();
  renderNoteBlocks();

  window.refresh = function (article) {
    // Update markup result
    if (typeof article == "undefined" || typeof article.content == "undefined")
      console.error("Null Argument");
    $("article.content").html(article.content);

    highlight();
    renderTables();
    renderAlerts();
    renderAffix();
  };

  function breakText() {
    $(".xref").addClass("text-break");
    var texts = $(".text-break");
    texts.each(function () {
      $(this).breakWord();
    });
  }

  function renderHeader() {}

  // Styling for tables in conceptual documents using Bootstrap.
  // See http://getbootstrap.com/css/#tables
  function renderTables() {
    $("#main table")
      .addClass("table")
      .wrap('<div class="table-responsive"></div>');
  }

  // Styling for alerts.
  function renderAlerts() {
    $(".NOTE, .TIP").addClass("alert alert-info");
    $(".WARNING").addClass("alert alert-warning");
    $(".IMPORTANT, .CAUTION").addClass("alert alert-danger");
  }

  // Enable anchors for headings.
  (function () {
    anchors.options = {
      placement: "right",
      visible: "touch",
      icon: ""
    };
    anchors.add("article h2:not(.no-anchor), article h3:not(.no-anchor)");
  })();

  // Open links to different host in a new window.
  function renderLinks() {
    if ($("meta[property='docfx:newtab']").attr("content") === "true") {
      $(document.links)
        .filter(function () {
          return this.hostname !== window.location.hostname;
        })
        .attr("target", "_blank");
    }
  }

  function copyCode() {
    var btn = ".hljs-code-copy";
    var localeData = $.localize.data;
    var cpb = new Clipboard(btn, {
      text: function (trigger) {
        var codeSnippet = $(trigger)
          .prevAll("code")
          .text();
        return codeSnippet;
      }
    });

    cpb.on("success", function (e) {
      e.trigger.innerText = localeData.resources.hljs.codeCopied;
      setTimeout(function () {
        e.trigger.innerText = localeData.resources.hljs.copyCode;
      }, 500);
    });
  }

  // Set note blocks titles
  function renderNoteBlocks() {
    var title, newHeaderElement;

    $(".alert").each(function (i) {
      title = $(this).attr('class').split(' ')[0];

      switch (title) {
        case "NOTE":
          newHeaderElement = '<h5 data-localize="noteBlocks.note"></h5>';
          break;
        case "WARNING":
          newHeaderElement = '<h5 data-localize="noteBlocks.warning"></h5>';
          break;
        case "TIP":
          newHeaderElement = '<h5 data-localize="noteBlocks.tip"></h5>';
          break;
        case "IMPORTANT":
          newHeaderElement = '<h5 data-localize="noteBlocks.important"></h5>';
          break;
        case "CAUTION":
          newHeaderElement = '<h5 data-localize="noteBlocks.caution"></h5>';
          break;
        default:
          break;
      }

      $(this.firstElementChild).replaceWith(newHeaderElement);
    });
  }

  // Enable highlight.js
  function highlight() {
    $("pre code").each(function (i, block) {
      hljs.highlightBlock(block);

      $(block)
        .parent()
        .append([
          '<span class="hljs-lang-name">' + block.result.language + "</span>",
          '<button data-localize="hljs.copyCode" class="hljs-code-copy hidden"></button>'
        ])
        .on("mouseenter", function () {
          $(this)
            .find(".hljs-code-copy")
            .removeClass("hidden");
        })
        .on("mouseleave", function () {
          $(this)
            .find(".hljs-code-copy")
            .addClass("hidden");
        });
    });
    $("pre code[highlight-lines]").each(function (i, block) {
      if (block.innerHTML === "") return;
      var lines = block.innerHTML.split("\n");

      queryString = block.getAttribute("highlight-lines");
      if (!queryString) return;

      var ranges = queryString.split(",");
      for (var j = 0, range;
        (range = ranges[j++]);) {
        var found = range.match(/^(\d+)\-(\d+)?$/);
        if (found) {
          // consider region as `{startlinenumber}-{endlinenumber}`, in which {endlinenumber} is optional
          var start = +found[1];
          var end = +found[2];
          if (isNaN(end) || end > lines.length) {
            end = lines.length;
          }
        } else {
          // consider region as a sigine line number
          if (isNaN(range)) continue;
          var start = +range;
          var end = start;
        }
        if (start <= 0 || end <= 0 || start > end || start > lines.length) {
          // skip current region if invalid
          continue;
        }
        lines[start - 1] = '<span class="line-highlight">' + lines[start - 1];
        lines[end - 1] = lines[end - 1] + "</span>";
      }

      block.innerHTML = lines.join("\n");
    });
  }

  // Support full-text-search
  function enableSearch() {
    var query;
    var relHref = $("meta[property='docfx\\:rel']").attr("content");
    if (typeof relHref === "undefined") {
      return;
    }
    try {
      var worker = new Worker(relHref + "styles/search-worker.js");
      if (!worker && !window.worker) {
        localSearch();
      } else {
        webWorkerSearch();
      }

      renderSearchBox();
      highlightKeywords();
      addSearchEvent();
    } catch (e) {
      console.error(e);
    }

    //Adjust the position of search box in navbar
    function renderSearchBox() {
      autoCollapse();
      $(window).on("resize", autoCollapse);
      $(document).on("click", ".navbar-collapse.in", function (e) {
        if ($(e.target).is("a")) {
          $(this).collapse("hide");
        }
      });

      function autoCollapse() {
        var navbar = $("#autocollapse");
        if (navbar.height() === null) {
          setTimeout(autoCollapse, 300);
        }
        navbar.removeClass(collapsed);
        if (navbar.height() > 60) {
          navbar.addClass(collapsed);
        }
      }
    }

    // Search factory
    function localSearch() {
      console.log("using local search");
      var lunrIndex = lunr(function () {
        this.ref("href");
        this.field("title", {
          boost: 50
        });
        this.field("keywords", {
          boost: 20
        });
      });
      lunr.tokenizer.seperator = /[\s\-\.]+/;
      var searchData = {};
      var searchDataRequest = new XMLHttpRequest();

      var indexPath = relHref + "index.json";
      if (indexPath) {
        searchDataRequest.open("GET", indexPath);
        searchDataRequest.onload = function () {
          if (this.status != 200) {
            return;
          }
          searchData = JSON.parse(this.responseText);
          for (var prop in searchData) {
            if (searchData.hasOwnProperty(prop)) {
              lunrIndex.add(searchData[prop]);
            }
          }
        };
        searchDataRequest.send();
      }

      $("body").bind("queryReady", function () {
        var hits = lunrIndex.search(query);
        var results = [];
        hits.forEach(function (hit) {
          var item = searchData[hit.ref];
          results.push({
            href: item.href,
            title: item.title,
            keywords: item.keywords
          });
        });
        handleSearchResults(results);
      });
    }

    function webWorkerSearch() {
      console.log("using Web Worker");
      var indexReady = $.Deferred();

      worker.onmessage = function (oEvent) {
        switch (oEvent.data.e) {
          case "index-ready":
            indexReady.resolve();
            break;
          case "query-ready":
            var hits = oEvent.data.d;
            handleSearchResults(hits);
            break;
        }
      };

      indexReady.promise().done(function () {
        $("body").bind("queryReady", function () {
          worker.postMessage({
            q: query
          });
        });
      });
    }

    // Highlight the searching keywords
    function highlightKeywords() {
      var q = url("?q");
      if (q !== null) {
        var keywords = q.split("%20");
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
            query = $(this).val();
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

    function flipContents(action) {
      if (action === "show") {
        $(".hide-when-search").show();
        $("#search-results").hide();
      } else {
        $(".hide-when-search").hide();
        $("#search-results").show();
      }
    }

    function relativeUrlToAbsoluteUrl(currentUrl, relativeUrl) {
      var currentItems = currentUrl.split(/\/+/);
      var relativeItems = relativeUrl.split(/\/+/);
      var depth = currentItems.length - 1;
      var items = [];
      for (var i = 0; i < relativeItems.length; i++) {
        if (relativeItems[i] === "..") {
          depth--;
        } else if (relativeItems[i] !== ".") {
          items.push(relativeItems[i]);
        }
      }
      return currentItems
        .slice(0, depth)
        .concat(items)
        .join("/");
    }

    function extractContentBrief(content) {
      var briefOffset = 512;
      var words = query.split(/\s+/g);
      var queryIndex = content.indexOf(words[0]);
      var briefContent;
      if (queryIndex > briefOffset) {
        return (
          "..." +
          content.slice(queryIndex - briefOffset, queryIndex + briefOffset) +
          "..."
        );
      } else if (queryIndex <= briefOffset) {
        return content.slice(0, queryIndex + briefOffset) + "...";
      }
    }

    function handleSearchResults(hits) {
      var numPerPage = 10;
      $("#pagination").empty();
      $("#pagination").removeData("twbs-pagination");
      if (hits.length === 0) {
        $("#search-results>.sr-items").html("<p>No results found</p>");
      } else {
        $("#pagination").twbsPagination({
          totalPages: Math.ceil(hits.length / numPerPage),
          visiblePages: 5,
          onPageClick: function (event, page) {
            var start = (page - 1) * numPerPage;
            var curHits = hits.slice(start, start + numPerPage);
            $("#search-results>.sr-items")
              .empty()
              .append(
                curHits.map(function (hit) {
                  var currentUrl = window.location.href;
                  var itemRawHref = relativeUrlToAbsoluteUrl(
                    currentUrl,
                    relHref + hit.href
                  );
                  var itemHref = relHref + hit.href + "?q=" + query;
                  var itemTitle = hit.title;
                  var itemBrief = extractContentBrief(hit.keywords);

                  var itemNode = $("<div>").attr("class", "sr-item");
                  var itemTitleNode = $("<div>")
                    .attr("class", "item-title")
                    .append(
                      $("<a>")
                      .attr("href", itemHref)
                      .attr("target", "_blank")
                      .text(itemTitle)
                    );
                  var itemHrefNode = $("<div>")
                    .attr("class", "item-href")
                    .text(itemRawHref);
                  var itemBriefNode = $("<div>")
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

  // Update href in navbar
  function renderNavbar() {
    var navbar = $("#navbar ul")[0];
    $(".navigation").addClass("sf-js-enabled sf-with-ul");
    if (typeof navbar === "undefined") {
      loadNavbar();
    } else {
      navbar.classList.add("navbar-right");
      $("#navbar ul a.active")
        .parents("li")
        .addClass(active);
      renderBreadcrumb();
    }

    function loadNavbar() {
      var navbarPath = $("meta[property='docfx\\:navrel']").attr("content");
      if (!navbarPath) {
        return;
      }
      navbarPath = navbarPath.replace(/\\/g, "/");

      var tocPath = $("meta[property='docfx\\:tocrel']").attr("content") || "";

      if (tocPath) tocPath = tocPath.replace(/\\/g, "/");

      $.get(navbarPath, function (data) {
        $(data)
          .find("#toc>ul")
          .appendTo("#navbar");
        if ($("#search-results").length !== 0) {
          $("#search").show();
          $("body").trigger("searchEvent");
        }
        var index = navbarPath.lastIndexOf("/");
        var navrel = "";
        if (index > -1) {
          navrel = navbarPath.substr(0, index + 1);
        }
        $("#navbar>ul").addClass("navbar-nav");
        var currentAbsPath = util.getAbsolutePath(window.location.pathname);
        // set active item
        $("#navbar")
          .find("a[href]")
          .each(function (i, e) {
            var href = $(e).attr("href");
            if (util.isRelativePath(href)) {
              href = navrel + href;
              $(e).attr("href", href);

              // TODO: currently only support one level navbar
              var isActive = false;
              var originalHref = e.name;
              if (originalHref) {
                originalHref = navrel + originalHref;
                if (
                  util.getDirectory(util.getAbsolutePath(originalHref)) ===
                  util.getDirectory(util.getAbsolutePath(tocPath))
                ) {
                  isActive = true;
                }
              } else {
                if (util.getAbsolutePath(href) === currentAbsPath) {
                  isActive = true;
                }
              }
              if (isActive) {
                $(e).addClass(active);
              }
            }
          });
        renderNavbar();
      });
    }
  }

  function renderSidebar() {
    var contentHeight = $("#main").height();
    $("#toc").height(contentHeight + 100);
    var sidetoggle = $(".sidetoggle.collapse")[0];
    $(window).resize(function () {
      $(sidetoggle).height("auto");
      $(sidetoggle).removeClass("in");
      $("#toc").height(contentHeight + 100);
    });
    var sidetoc = $("#sidetoggle .sidetoc")[0];
    if (typeof sidetoc === "undefined") {
      loadToc();
    } else {
      registerTocEvents();
      if ($("footer").is(":visible")) {
        // $('.sidetoc').addClass('shiftup');
      }

      // Scroll to active item
      var top = 0;
      $("#toc a.active")
        .parents("li")
        .each(function (i, e) {
          $(e).addClass(expanded);
          top += $(e).position().top;
        });

      $("#toc a.active").closest("li").addClass("active");

      $(".sidetoc").scrollTop(top - 50);

      if ($("footer").is(":visible")) {
        // $('.sidetoc').addClass('shiftup');
      }

      renderBreadcrumb();
    }

    function registerTocEvents() {
      $(".toc .nav > li > .expand-stub").click(function (e) {
        $(e.target)
          .parent()
          .toggleClass(expanded);
      });
      $(".toc .nav > li > .expand-stub + a:not([href])").click(function (e) {
        $(e.target)
          .parent()
          .toggleClass(expanded);
      });
      $("#toc_filter_input").on("input", function (e) {
        var val = this.value;
        if (val === "") {
          // Clear 'filtered' class
          $("#toc li")
            .removeClass(filtered)
            .removeClass(hide);
          return;
        }

        // Get leaf nodes
        $("#toc li>a")
          .filter(function (i, e) {
            return $(e).siblings().not('.new__badge').length === 0;
          })
          .each(function (i, anchor) {
            var text = $(anchor).attr("title");
            var parent = $(anchor).parent();
            var parentNodes = parent.parents("ul>li");
            var latest = parentNodes.length > 0 ? parentNodes[parentNodes.length - 1] : parent;
            var header = $(latest).prevAll("li[data-is-header='true']").first();
            parentNodes.push(header);
            for (var i = 0; i < parentNodes.length; i++) {
              var parentText;
              var parentNode = $(parentNodes[i]);
              if (parentNode.data("is-header")) {
                parentText = parentNode.text();
              } else {
                parentText = $(parentNodes[i])
                  .children("a")
                  .attr("title");
              }

              if (parentText) text = parentText + "." + text;
            }
            if (filterNavItem(text, val)) {
              parent.addClass(show);
              parent.removeClass(hide);
            } else {
              parent.addClass(hide);
              parent.removeClass(show);
            }
          });

        $("#toc li>a")
          .filter(function (i, e) {
            return $(e).siblings().not('.new__badge').length > 0;
          })
          .each(function (i, anchor) {
            var parent = $(anchor).parent();

            if (parent.find("li.show").length > 0) {
              parent.addClass(show);
              parent.addClass(filtered);
              parent.removeClass(hide);
            } else {
              parent.addClass(hide);
              parent.removeClass(show);
              parent.removeClass(filtered);
            }
          });

        function filterNavItem(name, text) {
          if (!text) return true;
          if (name.toLowerCase().indexOf(text.toLowerCase()) > -1) return true;
          return false;
        }

        toggleSidenavHeaders();
      });
    }

    function toggleSidenavHeaders() {
      var isHeaderDataAttrName = "is-header";
      var firstLevelListItems = $("#toc>ul>li");
      var headers = [];
      var header = null;
      var children = [];
      for (var i = 0; i < firstLevelListItems.length; i++) {
        var listItem = $(firstLevelListItems[i]);
        var isHeader = listItem.data(isHeaderDataAttrName) === true;
        if (isHeader) {
          if (header) {
            headers.push( {
              header: header,
              children: children
            });

            header = null;
            children = [];
          }

          header = listItem;
        } else if (header) {
          children.push(listItem);
        }
      }

      if (header) {
        headers.push({
          header: header,
          children: children
        });
      }

      toggleHeadersHideClass(headers);
    }

    function toggleHeadersHideClass(headers) {
      for (var i = 0; i < headers.length; i++) {
        if (hasVisibleChild(headers[i].children)) {
          headers[i].header.removeClass("hide");
        } else {
          headers[i].header.addClass("hide");
        }
      }
    }

    function hasVisibleChild(children) {
      for (var i = 0; i < children.length; i++) {
        if (!children[i].hasClass("hide")) {
          return true;
        }
      }

      return false;
    }

    function loadToc() {
      var tocPath = $("meta[property='docfx\\:tocrel']").attr("content");
      if (!tocPath) {
        return;
      }
      tocPath = tocPath.replace(/\\/g, "/");
      $("#sidetoc").load(tocPath + " #sidetoggle > div", function () {
        var index = tocPath.lastIndexOf("/");
        var tocrel = "";
        if (index > -1) {
          tocrel = tocPath.substr(0, index + 1);
        }
        var currentHref = util.getAbsolutePath(window.location.pathname);
        $("#sidetoc")
          .find("a[href]")
          .each(function (i, e) {
            var href = $(e).attr("href");
            if (util.isRelativePath(href)) {
              href = tocrel + href;
              $(e).attr("href", href);
            }

            if (util.getAbsolutePath(e.href) === currentHref) {
              $(e).addClass(active);
            }

            $(e).breakWord();
          });

        renderSidebar();
      });
    }
  }

  function renderBreadcrumb() {
    var breadcrumb = [];
    $("#navbar a.active").each(function (i, e) {
      breadcrumb.push({
        href: e.href,
        name: e.innerHTML
      });
    });
    $("#toc a.active").each(function (i, e) {
      breadcrumb.push({
        href: e.href,
        name: e.innerHTML
      });
    });

    var html = util.formList(breadcrumb, "breadcrumb");
    $("#breadcrumb").html(html);
  }

  //Setup Affix
  function renderAffix() {
    var hierarchy = getHierarchy();

    if (hierarchy.length > 0) {
      var html =
        '<h5 data-localize="sideaffix.title" class="sifeaffix__title"></h5>';
      html += util.formList(hierarchy, ["nav", "bs-docs-sidenav"]);
      $("#affix")
        .empty()
        .append(html);
      if ($("footer").is(":visible")) {
        $(".sideaffix").css("bottom", "70px");
      }
      $("#affix").on("activate.bs.scrollspy", function (e) {
        if (e.target) {
          if ($(e.target).find("li.active").length > 0) {
            return;
          }
          var top = $(e.target).position().top;
          $(e.target)
            .parents("li")
            .each(function (i, e) {
              top += $(e).position().top;
            });
          var container = $("#affix > ul");
          var height = container.height();
          container.scrollTop(container.scrollTop() + top - height / 2);
        }
      });

      var contentOffset = $("#_content").offset().top;
      $("body").data("offset", contentOffset);
      $(".bs-docs-sidenav a").on("click", function (e) {
        var hashLocation = $(this).attr("href");
        var scrollPos =
          $("body")
          .find(hashLocation)
          .offset().top - contentOffset;

        $("body, html").animate({
            scrollTop: scrollPos
          },
          500,
          function () {
            updateUrl(hashLocation);
          }
        );
        return false;
      });
    }

    function getHierarchy() {
      // supported headers are h1, h2, h3, and h4
      // The topmost header is ignored
      var selector = ".article-container article";
      var affixSelector = "#affix";
      var headers = ["h4", "h3", "h2", "h1"];
      var hierarchy = [];
      var toppestIndex = -1;
      var startIndex = -1;
      // 1. get header hierarchy
      for (var i = headers.length - 1; i >= 0; i--) {
        var header = $(selector + " " + headers[i]);
        var length = header.length;

        // If contains no header in current selector, find the next one
        if (length === 0) continue;

        // If the toppest header contains only one item, e.g. title, ignore
        if (length === 1 && hierarchy.length === 0 && toppestIndex < 0) {
          toppestIndex = i;
          continue;
        }

        // Get second level children
        var nextLevelSelector = i > 0 ? headers[i - 1] : null;
        var prevSelector;
        for (var j = length - 1; j >= 0; j--) {
          var e = header[j];
          var id = e.id;
          if (!id) continue; // For affix, id is a must-have
          var item = {
            name: htmlEncode($(e).text()),
            href: "#" + id,
            items: []
          };
          if (nextLevelSelector) {
            var selector = "#" + cssEscape(id) + "~" + nextLevelSelector;
            var currentSelector = selector;
            if (prevSelector) currentSelector += ":not(" + prevSelector + ")";
            $(header[j])
              .siblings(currentSelector)
              .each(function (index, e) {
                if (e.id) {
                  item.items.push({
                    name: htmlEncode($(e).text()), // innerText decodes text while innerHTML not
                    href: "#" + e.id
                  });
                }
              });
            prevSelector = selector;
          }
          hierarchy.push(item);
        }
        break;
      }
      hierarchy.reverse();
      return hierarchy;
    }

    function htmlEncode(str) {
      if (!str) return str;
      return str
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }

    function htmlDecode(value) {
      if (!str) return str;
      return value
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");
    }

    function cssEscape(str) {
      // see: http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string#answer-2837646
      if (!str) return str;
      return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
    }
  }

  // Show footer
  // function renderFooter() {
  //     initFooter();
  //     $(window).on('scroll', showFooterCore);

  //     function initFooter() {
  //         if (needFooter()) {
  //             shiftUpBottomCss();
  //             $('footer').show();
  //         } else {
  //             resetBottomCss();
  //             $('footer').hide();
  //         }
  //     }

  //     function showFooterCore() {
  //         if (needFooter()) {
  //             shiftUpBottomCss();
  //             $('footer').fadeIn();
  //         } else {
  //             resetBottomCss();
  //             $('footer').fadeOut();
  //         }
  //     }

  //     function needFooter() {
  //         var scrollHeight = $(document).height();
  //         var scrollPosition = $(window).height() + $(window).scrollTop();
  //         return scrollHeight - scrollPosition < 1;
  //     }

  //     function resetBottomCss() {
  //         // $('.sidetoc').removeClass('shiftup');
  //         $('.sideaffix').removeClass('shiftup');
  //     }

  //     function shiftUpBottomCss() {
  //         // $('.sidetoc').addClass('shiftup');
  //         // $('.sideaffix').addClass('shiftup');
  //     }
  // }

  function renderLogo() {
    // For LOGO SVG
    // Replace SVG with inline SVG
    // http://stackoverflow.com/questions/11978995/how-to-change-color-of-svg-image-using-css-jquery-svg-image-replacement
    jQuery("img.svg").each(function () {
      var $img = jQuery(this);
      var imgID = $img.attr("id");
      var imgClass = $img.attr("class");
      var imgURL = $img.attr("src");

      jQuery.get(
        imgURL,
        function (data) {
          // Get the SVG tag, ignore the rest
          var $svg = jQuery(data).find("svg");

          // Add replaced image's ID to the new SVG
          if (typeof imgID !== "undefined") {
            $svg = $svg.attr("id", imgID);
          }
          // Add replaced image's classes to the new SVG
          if (typeof imgClass !== "undefined") {
            $svg = $svg.attr("class", imgClass + " replaced-svg");
          }

          // Remove any invalid XML tags as per http://validator.w3.org
          $svg = $svg.removeAttr("xmlns:a");

          // Replace image with new SVG
          $img.replaceWith($svg);
        },
        "xml"
      );
    });
  }

  function utility() {
    this.getAbsolutePath = getAbsolutePath;
    this.isRelativePath = isRelativePath;
    this.isAbsolutePath = isAbsolutePath;
    this.getDirectory = getDirectory;
    this.formList = formList;

    function getAbsolutePath(href) {
      // Use anchor to normalize href
      var anchor = $('<a href="' + href + '"></a>')[0];
      // Ignore protocal, remove search and query
      return anchor.host + anchor.pathname;
    }

    function isRelativePath(href) {
      return !isAbsolutePath(href);
    }

    function isAbsolutePath(href) {
      return /^(?:[a-z]+:)?\/\//i.test(href);
    }

    function getDirectory(href) {
      if (!href) return "";
      var index = href.lastIndexOf("/");
      if (index == -1) return "";
      if (index > -1) {
        return href.substr(0, index);
      }
    }

    function formList(item, classes) {
      var level = 1;
      var model = {
        items: item
      };
      var cls = [].concat(classes).join(" ");
      return getList(model, cls);

      function getList(model, cls) {
        if (!model || !model.items) return null;
        var l = model.items.length;
        if (l === 0) return null;
        var html = '<ul class="level' + level + " " + (cls || "") + '">';
        level++;
        for (var i = 0; i < l; i++) {
          var item = model.items[i];
          var href = item.href;
          var name = item.name;
          if (!name) continue;
          html += href ?
            '<li><a href="' + href + '">' + name + "</a>" :
            "<li>" + name;
          html += getList(item, cls) || "";
          html += "</li>";
        }
        html += "</ul>";
        return html;
      }
    }

    /**
     * Add <wbr> into long word.
     * @param {String} text - The word to break. It should be in plain text without HTML tags.
     */
    function breakPlainText(text) {
      if (!text) return text;
      return text.replace(/([a-z])([A-Z])|(\.)(\w)/g, "$1$3<wbr>$2$4");
    }

    /**
     * Add <wbr> into long word. The jQuery element should contain no html tags.
     * If the jQuery element contains tags, this function will not change the element.
     */
    $.fn.breakWord = function () {
      if (this.html() == this.text()) {
        this.html(function (index, text) {
          return breakPlainText(text);
        });
      }
      return this;
    };
  }
});

function updateUrl(target) {
  history.pushState({}, "", window.location.href.split("#")[0] + target);
}


function closeContainer() {
  if ($(".toggle").is(":visible")) {
    $(".toggle").slideToggle(200);
  }
}

function handleThemeSelection(theme, item) {
  if (theme) {
    if (isDvPage()) {
      // reset the theme to the default one
      theme = "default-theme";
      window.localStorage.setItem('theme', theme);
    }
    if (item) {
      postMessage(theme);
    }
    var visibleItems = $(".theme-item:lt(2)");
    var visibleThemes = [];
    var themeItem = item ? item : $(".theme-item").filter("[data-theme=" + theme + "]")[0];

    $.each(visibleItems, function(i, el) {
      visibleThemes.push(el.getAttribute("data-theme"));
    })

    if (visibleThemes.indexOf(theme) !== -1) {
      selectTheme(themeItem);
    } else {
      swapItems(themeItem);
      closeContainer();
    }
  }

  function postMessage(theme) {
    var targetOrigin = document.body.getAttribute("data-demos-base-url");
    var iframes = document.querySelectorAll("iframe");
    var data = {theme: theme, origin: window.location.origin};
    window.localStorage.setItem('theme', theme);
    iframes.forEach( function(iframe)  {
      var iframeWindow = iframe.contentWindow;
      iframeWindow.postMessage(data, targetOrigin);
    });
  }

  function selectTheme(el) {
    var oldSelection = document.getElementsByClassName("theme-item--active");
    if (oldSelection.length > 0) {
      oldSelection[0].classList.remove("theme-item--active");
    }
    el.classList.add("theme-item--active");
  }

  function swapItems(newItem) {
    var selectedItem = document.getElementsByClassName("theme-item--active")[0];
    var labelToSwap = newItem.lastElementChild.textContent;

    newItem.setAttribute("data-theme", selectedItem.getAttribute("data-theme"));
    newItem.firstElementChild.className = "theme-button " + selectedItem.getAttribute("data-theme");
    newItem.lastElementChild.textContent = selectedItem.lastElementChild.textContent;

    selectedItem.setAttribute("data-theme", theme);
    selectedItem.firstElementChild.className = "theme-button " + theme;
    selectedItem.lastElementChild.textContent = labelToSwap;
  }
}

  function isDvPage() {
    return window.igViewer.common.isDvPage();
  }

$(document).ready(function () {
  var sampleIframes = document.querySelectorAll("iframe[src]");
  if (sampleIframes.length !== 0 && !isDvPage()) {
    $(".themes-container").css('display','inline-flex');
  }

  var contentOffset = $("#_content").offset().top;
  var pageLanguage = $(document.body).data("lang");
  if (!pageLanguage) {
    pageLanguage = "en";
  }

  $(".theme-item").on("click", function(e) {
    if(e.currentTarget.lastElementChild.tagName === "svg") {
      return;
    }
    var currentTheme = window.localStorage.getItem("theme");
    var newTheme = this.getAttribute("data-theme");
    if (currentTheme !== newTheme) {
      handleThemeSelection(newTheme, this);
    }
  })

  $(".anchorjs-link").on("click", function (e) {
    var hashLocation = $(this).attr("href");
    updateUrl(hashLocation);

    var scrollPos =
      $("body")
      .find(hashLocation)
      .offset().top - contentOffset;

    $("body, html")
      .stop()
      .animate({
          scrollTop: scrollPos
        },
        500,
        function () {}
      );
    return false;
  });

  var resourcesBaseUrl = "";
  try {
    var docfxjsSrc = $("script[src$='styles/docfx.js']")[0].src;
    resourcesBaseUrl = docfxjsSrc.replace("styles/docfx.js", "resources");
  } catch (err) {
    console.log("Cannot load resources: " + err.message);
  }

  $("[data-localize]").localize("resources", {
    pathPrefix: resourcesBaseUrl,
    language: pageLanguage
  });
});