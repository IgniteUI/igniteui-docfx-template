// import $ from 'jquery';



// export class DocfxRenderer {

  
// }

// $(function () {
//   var active = "active";
//   var expanded = "in";
//   var filtered = "filtered";
//   var show = "show";
//   var hide = "hide";
//   var initialSidetocHeight;
//   var initialAffixHeight;


//   // //adds target blank for every link
//   // renderLinks();

//   //Renders the affix
//   renderAffix();

//   //Check if there are dynamically resizable content and triggers the checkIfFooterIsVisible
//   handleResizableContent();

//   window.refresh = function (article) {
//     // Update markup result
//     if (typeof article == "undefined" || typeof article.content == "undefined")
//       console.error("Null Argument");
//     $("article.content").html(article.content);

//     highlight();
//     renderTables();
//     renderAlerts();
//     renderAffix();
//   };

//   //Setup Affix
//   function renderAffix() {
//     var hierarchy = getHierarchy();

//     if (hierarchy.length > 0) {
//       var html =
//         '<h5 data-localize="sideaffix.title" class="sifeaffix__title"></h5>';
//       html += util.formList(hierarchy, ["nav", "bs-docs-sidenav"]);
//       $("#affix")
//         .empty()
//         .append(html);
//       initialAffixHeight = $("#affix").height();

//       checkIfFooterIsVisible();
//       $("#affix").on("activate.bs.scrollspy", function (e) {
//         if (e.target) {
//           if ($(e.target).find("li.active").length > 0) {
//             return;
//           }
//           var top = $(e.target).position().top;
//           $(e.target)
//             .parents("li")
//             .each(function (i, e) {
//               top += $(e).position().top;
//             });
//           var container = $("#affix > ul");
//           var height = container.height();
//           container.scrollTop(container.scrollTop() + top - height / 2);
//         }
//       });

//       var contentOffset = $("#_content").offset().top;
//       $("body").data("offset", contentOffset);
//       $(".bs-docs-sidenav a").on("click", function (e) {
//         var hashLocation = $(this).attr("href");
//         var scrollPos =
//           $("body")
//             .find(hashLocation)
//             .offset().top - contentOffset;

//         $("body, html").animate({
//           scrollTop: scrollPos
//         },
//           500,
//           function () {
//             updateUrl(hashLocation);
//           }
//         );
//         return false;
//       });
//     }

//     function getHierarchy() {
//       // supported headers are h1, h2, h3, and h4
//       // The topmost header is ignored
//       var selector = ".article-container article";
//       var affixSelector = "#affix";
//       var headers = ["h4", "h3", "h2", "h1"];
//       var hierarchy = [];
//       var toppestIndex = -1;
//       var startIndex = -1;
//       // 1. get header hierarchy
//       for (var i = headers.length - 1; i >= 0; i--) {
//         var header = $(selector + " " + headers[i]);
//         var length = header.length;

//         // If contains no header in current selector, find the next one
//         if (length === 0) continue;

//         // If the toppest header contains only one item, e.g. title, ignore
//         if (length === 1 && hierarchy.length === 0 && toppestIndex < 0) {
//           toppestIndex = i;
//           continue;
//         }

//         // Get second level children
//         var nextLevelSelector = i > 0 ? headers[i - 1] : null;
//         var prevSelector;
//         for (var j = length - 1; j >= 0; j--) {
//           var e = header[j];
//           var id = e.id;
//           if (!id) continue; // For affix, id is a must-have
//           var item = {
//             name: htmlEncode($(e).text()),
//             href: "#" + id,
//             items: []
//           };
//           if (nextLevelSelector) {
//             var selector = "#" + cssEscape(id) + "~" + nextLevelSelector;
//             var currentSelector = selector;
//             if (prevSelector) currentSelector += ":not(" + prevSelector + ")";
//             $(header[j])
//               .siblings(currentSelector)
//               .each(function (index, e) {
//                 if (e.id) {
//                   item.items.push({
//                     name: htmlEncode($(e).text()), // innerText decodes text while innerHTML not
//                     href: "#" + e.id
//                   });
//                 }
//               });
//             prevSelector = selector;
//           }
//           hierarchy.push(item);
//         }
//         break;
//       }
//       hierarchy.reverse();
//       return hierarchy;
//     }

//     function htmlEncode(str) {
//       if (!str) return str;
//       return str
//         .replace(/&/g, "&amp;")
//         .replace(/"/g, "&quot;")
//         .replace(/'/g, "&#39;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;");
//     }

//     function htmlDecode(value) {
//       if (!str) return str;
//       return value
//         .replace(/&quot;/g, '"')
//         .replace(/&#39;/g, "'")
//         .replace(/&lt;/g, "<")
//         .replace(/&gt;/g, ">")
//         .replace(/&amp;/g, "&");
//     }

//     function cssEscape(str) {
//       // see: http://stackoverflow.com/questions/2786538/need-to-escape-a-special-character-in-a-jquery-selector-string#answer-2837646
//       if (!str) return str;
//       return str.replace(/[!"#$%&'()*+,.\/:;<=>?@[\\\]^`{|}~]/g, "\\$&");
//     }
//   }
// });

// function updateUrl(target) {
//   history.pushState({}, "", window.location.href.split("#")[0] + target);
// }


// function closeContainer() {
//   if ($(".toggle").is(":visible")) {
//     $(".toggle").slideToggle(200);
//   }
// }

// function isDvPage() {
//   return window.igViewer.common.isDvPage();
// }

// function showGitHubButton() {
//   return window.location.pathname.search(RegExp("\\/\\b(\\w*grid\\w*)\\b\\/")) === -1
// }

// $(document).ready(function () {
//   var contentOffset = $("#_content").offset().top;
//   var pageLanguage = $(document.body).data("lang");
//   if (!pageLanguage) {
//     pageLanguage = "en";
//   }

//   $(".anchorjs-link").on("click", function (e) {
//     var hashLocation = $(this).attr("href");
//     updateUrl(hashLocation);

//     var scrollPos =
//       $("body")
//         .find(hashLocation)
//         .offset().top - contentOffset;

//     $("body, html")
//       .stop()
//       .animate({
//         scrollTop: scrollPos
//       },
//         500,
//         function () { }
//       );
//     return false;
//   });

//   if ($(".github-btn-wrapper").length && showGitHubButton()) {
//     $(".github-btn-wrapper").attr("hidden", false);
//   }
// });
