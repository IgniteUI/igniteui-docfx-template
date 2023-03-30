//@ts-ignore
import lunr from 'lunr';
import type {ILunr, JPlunr, ISearchData, ISearchItem} from './types'

const ctx: Worker = self as any;
const lunrInstance: ILunr = {index: undefined, data: {}};
const jpLurn: JPlunr = require('lunr');
let stopWords: string[];
let base: string;
require('lunr-languages/lunr.stemmer.support.js')(jpLurn);
require('lunr-languages/tinyseg.js')(jpLurn);
require('lunr-languages/lunr.ja.js')(jpLurn);
require('lunr-languages/lunr.multi.js')(jpLurn);


ctx.onmessage = (oEvent) => {

  if("basePath" in oEvent.data) {
    base = oEvent.data.basePath;
    initLunr();
  } else {
    let q = oEvent.data.q;
    let hits = lunrInstance?.index?.search(q);
    let results: ISearchItem[] = [];
    hits?.forEach((hit) => {
      let item = lunrInstance?.data[hit.ref];
      results.push(item);
    });
  
    //@ts-ignore
    postMessage({ e: 'query-ready', q: q, d: results });
  }
}

function initLunr(): void {
  lunr.tokenizer(/[\s\-\.]+/);

  let stopWordsRequest = new XMLHttpRequest();
  stopWordsRequest.open('GET', `${base}search-stopwords.json`);
  stopWordsRequest.onload = function () {
    if (this.status != 200) {
      return;
    }
    stopWords = JSON.parse(this.responseText);
    buildIndex();
  }
  stopWordsRequest.send();

  let searchDataRequest = new XMLHttpRequest();

  searchDataRequest.open('GET', `${base}index.json`);
  searchDataRequest.onload = function () {
    if (this.status != 200) {
      return;
    }
    
    lunrInstance.data = JSON.parse(this.responseText);
    buildIndex();

    //@ts-ignore
    postMessage({ e: 'index-ready' });
  }

  searchDataRequest.send();
}

function buildIndex() {
  if (stopWords !== null && !isEmpty(lunrInstance.data)) {
    lunrInstance.index = lunr(function () {
      this.pipeline.remove(lunr.stopWordFilter);
      this.use(jpLurn.multiLanguage('en', 'ja'));
      this.ref('href');
      this.field('title', { boost: 20 });
      this.field('keywords', { boost: 50 });

      for (let prop in lunrInstance.data) {
        if (lunrInstance.data.hasOwnProperty(prop)) {
          this.add(lunrInstance.data[prop]);
        }
      }

      let docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
      lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
      this.pipeline.add(docfxStopWordFilter);
      this.searchPipeline.add(docfxStopWordFilter);
    });
  }
}

function isEmpty(obj: ISearchData) {
  if (!obj) return true;

  for (let prop in obj) {
    if (obj.hasOwnProperty(prop))
      return false;
  }

  return true;
}
