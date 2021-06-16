import { IHeadEl } from "../types";

/**
 * A singleton for page metadata replacement. 
 * After a navigation occurs the metadata of the page must be replaced with the metadata coming from the newly requested page.
 */
class MetadataService {

    /**
     * The fixed meta names are mandatory for replacement
     */
    private _fixedMetaNames = ["platform", "title", "link", "data-docfx-rel"];
    /**
     * The fixed link rels are mandatory for replacement
     */
    private _fixedLinkRels = ["canonical", "alternate"];

    /**
     * Optional meta names are basically meta tags, that do not occur in every html page in the docfx site
     */
    private _optionalMetaNames = ["description", "keywords"];

    /** We create a one big selector for search and replace */
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

    /**
     * The function, which handles the whole metadata replacement
     * @param dom - the newly requested html page
     */
    public configureMetadata(dom: JQuery<HTMLElement>) {
        this.changeFixed(dom);
        this.checkOptionals(dom);
    }

    /**
     * The function, which replaces the mandatory head elements
     */
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

    /**
     * The function, which replaces the optional head elements
     */
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

    //Logic for removing/adding stylesheets for a page, not used for now, but we will keep it in case some day this is required
   /* private checkStyleSheets(dom: JQuery<HTMLElement>) {
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
    */
}

const meta = new MetadataService();
export default meta;