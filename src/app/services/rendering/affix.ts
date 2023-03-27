import util from "../utils";
import { RenderingService, ResizableObservable, DimensionType, DimensionChangeType, IListNode } from "../../types";
import { ResizingService } from "../resizing";

export class AffixRenderingService extends RenderingService implements ResizableObservable {

    public initialDimension: number;
    public $element: JQuery<HTMLElement>;
    public dimensionToObserve: DimensionType = 'height';

    constructor(private resizingService: ResizingService) {
        super();
    }

    public reset() {
        this.initialDimension = document.body.clientHeight - (util.offset + util.getFilterHeight());
    }

    public handleChange(changeType: DimensionChangeType, newValue: number) {
        changeType === 'decrease' ? this.$element[this.dimensionToObserve](this.initialDimension - newValue) :
                                    this.$element[this.dimensionToObserve](this.initialDimension + newValue);
    }

    public render() {
        this.renderAffix();
    }

      //Setup Affix
  private renderAffix() {
    let hierarchy = this.getHierarchy();

    if (hierarchy.length > 0) {
      let html = util.formList(hierarchy, "nav", "bs-docs-sidenav")!;
      $("#affix").empty().append(html);
      this.$element = $("#affix");
      this.initialDimension = $("#affix").height()!;
      this.resizingService.observeElement(this);
      $<HTMLAnchorElement>(".bs-docs-sidenav a").on("click", (evt) => {
        evt.preventDefault();
        util.scroll($(evt?.target)?.attr("href")!);
        if($(evt?.target)?.attr("href")! !== location.hash) 
          history.pushState({scrollPosition: $(window).scrollTop()}, "", $(evt?.target)?.attr("href")!);
      });
    } else {
      $("#affix").empty();
    }
  }

  //Get the hierarchy of the article based on headers power
  private getHierarchy() {
    // supported headers are h1, h2, h3, and h4
    // The topmost header is ignored
    let selector = ".article-container article";
    let headers = ["h4", "h3", "h2", "h1"];
    let hierarchy = [];
    let toppestIndex = -1;

    // 1. get header hierarchy
    for (let i = headers.length - 1; i >= 0; i--) {
      let header = $(selector + " " + headers[i]);
      let length = header.length;

      // If contains no header in current selector, find the next one
      if (length === 0) continue;

      // If the toppest header contains only one item, e.g. title, ignore
      if (length === 1 && hierarchy.length === 0 && toppestIndex < 0) {
        toppestIndex = i;
        continue;
      }

      // Get second level children
      let nextLevelSelector = i > 0 ? headers[i - 1] : null;
      let prevSelector;
      for (let j = length - 1; j >= 0; j--) {
        let e = header[j];
        let id = e.id;
        if (!id) continue; // For affix, id is a must-have
        let item: IListNode = {
          name: util.htmlEncode($(e).text()),
          href: "#" + id,
          items: []
        };
        if (nextLevelSelector) {
          let selector = "#" + util.cssEscape(id) + "~" + nextLevelSelector;
          let currentSelector = selector;
          if (prevSelector) currentSelector += ":not(" + prevSelector + ")";
          $<HTMLHeadingElement>(header[j] as HTMLHeadingElement).siblings(currentSelector)
            .each((index:number, e:HTMLHeadingElement) => {
              if (e.id) {
                item.items!.push({
                  name: util.htmlEncode($(e).text()), // innerText decodes text while innerHTML not
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

}