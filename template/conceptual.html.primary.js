// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.

var common = require('./common.js');
var extension = require('./conceptual.extension.js')
var defaultTheme = "igniteui";
exports.transform = function (model) {
  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  model._disableToc = model._disableToc || !model._tocPath || (model._navPath === model._tocPath);
  model.docurl = model.docurl || common.getImproveTheDocHref(model, model._gitContribute, model._gitUrlPattern);

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }
  
  if(model._path){
    model._path = model._path.slice(0, model._path.lastIndexOf('.html'));
  }

  var theme = "";
  if(model._docfxTheme != null){
    theme = model._docfxTheme;
  } else {
    theme = defaultTheme;
  }
  model[theme + "Theme"] = true;
  model._globalStyle = model["_" + theme];

  model._isLangEn = true;
  model._isLangJa = false;
  model._isLangKr = false;
  model._rel = model._rel || './';
  model._appLang = "en";
  if (model._language) {
    if (model._language === "ja") {
      model._isLangJa = true;
      model._isLangEn = model._isLangKr = false;
      model._appLang = "ja";
    } else if (model._language === "kr") {
      model._isLangKr = true;
      model._isLangEn = model._isLangJa = false;
      model._appLang = "ko";
    }
  }

  model._isIgnite = false;
  model._isAngular = false;
  model._isAppBuilder = false;
  model._isBlazor = false;
  model._isReact = false;
  model._isWC = false;
  if (model._platform) {
    if (model._platform === "angular") {
      model._isAngular = true;
      model._isIgnite = true;
    } else if (model._platform === "appbuilder") {
      model._isAppBuilder = true;
      model._isIgnite = true;
    } else if (model._platform === "blazor") {
      model._isBlazor = true;
      model._isIgnite = true;
    } else if (model._platform === "react") {
      model._isReact = true;
      model._isIgnite = true;
    } else if (model._platform === "web-components") {
      model._isWC = true;
      model._isIgnite = true;
    }
  }
  return model;
}