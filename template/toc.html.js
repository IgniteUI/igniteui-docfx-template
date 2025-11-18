// Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See LICENSE file in the project root for full license information.
var extension = require("./toc.extension.js");

const labels = {
  NEW: "NEW",
  UPDATED: "UPDATED",
  PREVIEW: "PREVIEW",
  BETA: "BETA",
  DEPRECATED: "DEPRECATED label text example", // for the purposes of this example, if one day we decide to add a new label type
};

exports.transform = function (model) {

  if (extension && extension.preTransform) {
    model = extension.preTransform(model);
  }

  transformItem(model, 1, null);
  if (model.items && model.items.length > 0) model.leaf = false;
  model.title = "Table of Content";

  if (extension && extension.postTransform) {
    model = extension.postTransform(model);
  }

  var sortableHeaders = model.items.filter(function (item) {
    return item && item.header && item.sortable;
  });

  if (sortableHeaders.length > 0) {
    model.items = alphabeticalSort(model.items);
  }

  return model;
};

function alphabeticalSort(items) {
  var globalCollection = [];
  var currentChain = false;
  var collection = [];
  var topicHeader = null;
  for (var i = 0; i < items.length; i++) {
    if (items[i].header) {
      if (items[i].sortable && !currentChain) {
        if (collection.length > 0 && topicHeader) {
          globalCollection = appendToGlobalCollection(
            globalCollection,
            collection,
            topicHeader
          );
          collection = [];
        }
        currentChain = true;
        topicHeader = items[i];
      } else if (items[i].sortable && currentChain) {
        if (collection.length > 1) {
          collection.sort(function (a, b) {
            return a.name.localeCompare(b.name);
          });
        }
        globalCollection = appendToGlobalCollection(
          globalCollection,
          collection,
          topicHeader
        );
        currentChain = true;
        topicHeader = items[i];
        collection = [];
      } else if (!items[i].sortable && currentChain) {
        if (collection.length > 1) {
          collection.sort(function (a, b) {
            return a.name.localeCompare(b.name);
          });
        }
        globalCollection = appendToGlobalCollection(
          globalCollection,
          collection,
          topicHeader
        );
        currentChain = false;
        topicHeader = items[i];
        collection = [];
      } else if (!items[i].sortable && !currentChain) {
        if (topicHeader) {
          globalCollection = appendToGlobalCollection(
            globalCollection,
            collection,
            topicHeader
          );
          currentChain = false;
          topicHeader = items[i];
          collection = [];
        } else {
          topicHeader = items[i];
          currentChain = false;
          collection = [];
        }
      }
    } else {
      if (items[i].items.length > 1 && currentChain) {
        if (items[i].sortable) {
          sortItems(items[i]);
        }
      }
      collection.push(items[i]);
    }
  }

  if (collection.length > 0 && currentChain) {
    collection.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
  }
  globalCollection = appendToGlobalCollection(
    globalCollection,
    collection,
    topicHeader
  );
  return globalCollection;
}

function appendToGlobalCollection(global, current, header) {
  current.unshift(header);
  global = global.concat(current);
  return global;
}

function transformItem(item, level, parent) {
  // set to null incase mustache looks up
  item.topicHref = item.topicHref || null;
  item.tocHref = item.tocHref || null;
  item.name = item.name || null;
  item.premium = item.premium || false;

  if (parent && item.premium) {
    parent.premium = true;
  }

  item.level = level;
  if (item.items && item.items.length > 0) {
    var length = item.items.length;
    for (var i = 0; i < length; i++) {
      transformItem(item.items[i], level + 1, item);
    }
  } else {
    item.items = [];
    item.leaf = true;
  }

  if (item.sortable) {
    sortItems(item);
  }

  if (item.new || item.updated || item.preview || item.beta) {
    item.withBadge = true;
    switch (true) {
      case item.updated:
        item.labelText = labels.UPDATED;
        break;
      case item.new:
        item.labelText = labels.NEW;
        break;
      case item.preview:
        item.labelText = labels.PREVIEW;
        break;
      case item.beta:
        item.labelText = labels.BETA;
        break;
      default:
        item.labelText = undefined;
        break;
    }
    item.labelType = item.labelText ? item.labelText.toLowerCase() : null;
  } else if (item.items && item.items.length > 0) {
    const label = getLabelFromDirectChildren(item.items, item);
    item.labelText = typeof label !== "undefined" ? label : null;
    item.labelType = item.labelText !== null ? label.toLowerCase() : "";
    item.withBadge = item.labelType !== "";
  } else {
    item.labelText = null;
    item.labelType = "";
    item.withBadge = "";
    item.newType = "";
  }
}

function sortItems(item) {
  if (item.items && item.items.length > 1) {
    item.items.sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    for (var i in item.items) {
      sortItems(item.items[i]);
    }
  }
}

function getLabelFromDirectChildren(items, parent) {
  const childLabels = [];
  if (!parent.name) {
    return;
  }
  var labelToReturn;
  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    var itemLabel;

    switch (true) {
      case item.updated:
        itemLabel = labels.UPDATED;
        break;
      case item.new:
        itemLabel = labels.NEW;
        break;
      case item.preview:
        itemLabel = labels.PREVIEW;
        break;
      case item.beta:
        itemLabel = labels.BETA;
        break;
      default:
        itemLabel = undefined;
        break;
    }

    if (typeof itemLabel !== "undefined") {
      childLabels.push(itemLabel);
    }
  }

  if (childLabels.length === 0) {
    labelToReturn = undefined;
  } else if (childLabels.includes(labels.UPDATED)) {
    labelToReturn = labels.UPDATED;
    parent.updated = true;
  } else if (childLabels.includes(labels.PREVIEW)) {
    labelToReturn = labels.PREVIEW;
    parent.preview = true;
  } else if (childLabels.includes(labels.BETA)) {
    labelToReturn = labels.BETA;
    parent.beta = true;
  } else {
    parent.new = true;
    labelToReturn = labels.NEW;
  }
  return labelToReturn;
}
