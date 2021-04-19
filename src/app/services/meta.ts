import { IHeadEl } from "../types";

class MetadataService {
    private _fixedMetaNames = ["platform", "title", "link"];
    private _fixedLinkRels = ["canonical", "alternate"];
    private _optionalMetaNames = ["description", "keywords"];

    public fixedElementsSelector: string;
    public optionalHeadElements: IHeadEl[];

    constructor() {
        let metaNameSelector = this._fixedMetaNames.map(name => `meta[name=${name}]`).join(",");
        let linkSelector = this._fixedLinkRels.map(rel => `link[rel=${rel}]`).join(",");
        this.fixedElementsSelector = `${metaNameSelector}, ${linkSelector}`;

        this.optionalHeadElements = this._optionalMetaNames.map<IHeadEl>(name => {
            return {
                tag: 'meta',
                attributeSelector: 'name',
                attributeSelectorValue: name,
                valueSelector: 'content'
            }
        });
    }

    public configureMetadata(dom: JQuery<HTMLElement>) {
        this.changeFixed(dom);
        this.checkOptionals(dom);
        this.checkStyleSheets(dom);
    }

    private changeFixed(dom: JQuery<HTMLElement>) {
        $("head title").replaceWith(dom.find("title:first"));
        dom.find(this.fixedElementsSelector).each((index, element) => {
            let $el = $(element);
            let hEl: IHeadEl = {
                tag: element.tagName.toLowerCase(),
                attributeSelector: $el.is("link") ? "rel" : "name",
                valueSelector: $el.is("link") ? "href" : "content"
            };
            let elementSelector = `${hEl.tag}[${hEl.attributeSelector}=${$el.attr(hEl.attributeSelector)}]`;

            $(`head ${elementSelector}`).attr(hEl.valueSelector, $el.attr(hEl.valueSelector)!);
        });
    }

    private checkOptionals(dom: JQuery<HTMLElement>) {
        this.optionalHeadElements.forEach(hEl => {
            let selector = `${hEl.tag}[${hEl.attributeSelector}=${hEl.attributeSelectorValue}]`;
            if (dom.has(selector).length) {
                $("head").has(selector).length ? $(`head ${selector}`).attr(hEl.valueSelector, dom.find(selector).attr(hEl.valueSelector)!) :
                    dom.find(selector).insertBefore(`head ${hEl.tag}[${hEl.attributeSelector}]:first`)
            } else if ($("head").has(selector).length) {
                $(`head ${selector}`).remove();
            }
        });
    }

    private checkStyleSheets(dom: JQuery<HTMLElement>) {
        let documentStyleSheets = $<HTMLLinkElement>("head link[rel='stylesheet']");
        let targetedStyleSheets = dom.find<HTMLLinkElement>("link[rel='stylesheet']");

        if (documentStyleSheets.length !== targetedStyleSheets.length) {
            let { toProcess, toCompare, action } = documentStyleSheets.length > targetedStyleSheets.length ? 
                {
                    toProcess: documentStyleSheets,
                    toCompare: targetedStyleSheets,
                    action: (styleSheet: JQuery<HTMLLinkElement>) => styleSheet.remove()
                }
                    :
                {
                    toProcess: targetedStyleSheets,
                    toCompare: documentStyleSheets,
                    action: (styleSheet: JQuery<HTMLLinkElement>) => styleSheet.insertBefore(documentStyleSheets[0])
                };

                toProcess.filter((index, styleS) =>  {
                    let $s = $(styleS),
                        href=$s.attr("href");
                    return toCompare.siblings(`link[href='${href}']`).length === 0
                }).each((index, styleS) => {
                    action($(styleS));
                });

        }
    }
}

const meta = new MetadataService();
export default meta;