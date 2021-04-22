//@ts-ignore
import lunr from 'lunr';

interface ISearchItem {
  href: string,
  title: string,
  keywords: string
}

interface ILunr {
  index?: lunr.Index;
  data: ISearchData
}

interface ISearchData {
  [ref: string]: ISearchItem
}

const ctx: Worker = self as any;
const lunrInstance = initLunr()!;

ctx.onmessage = (oEvent) => {
  let q = oEvent.data.q;
  let hits = lunrInstance?.index?.search(q);
  let results: ISearchItem[] = [];
  hits?.forEach((hit) => {
    let item = lunrInstance?.data[hit.ref];
    results.push({ href: item.href, title: item.title, keywords: item.keywords });
  });
  //@ts-ignore
  postMessage({ e: 'query-ready', q: q, d: results });
}

function initLunr(): ILunr {
  let lunrIndex: lunr.Index | undefined;
  let stopWords: string[];
  let searchData: ISearchData = {};
  lunr.tokenizer(/[\s\-\.]+/);

  let stopWordsRequest = new XMLHttpRequest();
  stopWordsRequest.open('GET', '/search-stopwords.json');
  stopWordsRequest.onload = function () {
    if (this.status != 200) {
      return;
    }
    stopWords = JSON.parse(this.responseText);
    lunrIndex = buildIndex();
  }
  stopWordsRequest.send();

  let searchDataRequest = new XMLHttpRequest();

  searchDataRequest.open('GET', '/index.json');
  searchDataRequest.onload = function () {
    if (this.status != 200) {
      return;
    }
    searchData = JSON.parse(this.responseText);

    buildIndex();

    //@ts-ignore
    postMessage({ e: 'index-ready' });
  }

  searchDataRequest.send();

  return {index: lunrIndex, data: searchData}


  function buildIndex() {
    if (stopWords !== null && !isEmpty(searchData)) {
      lunrIndex = lunr(function () {
        this.pipeline.remove(lunr.stopWordFilter);
        this.ref('href');
        this.field('title', { boost: 50 });
        this.field('keywords', { boost: 20 });
  
        for (let prop in searchData) {
          if (searchData.hasOwnProperty(prop)) {
            this.add(searchData[prop]);
          }
        }
  
        let docfxStopWordFilter = lunr.generateStopWordFilter(stopWords);
        lunr.Pipeline.registerFunction(docfxStopWordFilter, 'docfxStopWordFilter');
        this.pipeline.add(docfxStopWordFilter);
        this.searchPipeline.add(docfxStopWordFilter);
      });
      return lunrIndex;
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
}

