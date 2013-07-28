/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemListController = {
  init: function() {
    Logger.on();
    var parameters = CommonController.getParametersFromQuery();
    document.title = "gitFAB"+(parameters.QueryString ? "/?"+parameters.QueryString : "");
    ItemListController.parameters = parameters;
    if (parameters.tag != null && parameters.tag.length == 0) {
      CommonController.getTagList(null, ItemListController.loadedTagList);
    } else {
      CommonController.getItemListFromDatabase(parameters.tag, parameters.owner, ItemListController.loadedItemList);
    }
  },
  
  loadedItemList: function(result, error) {
    if (CommonController.showError(error) != true) {
      if (result.itemlist.length == 0) {
        if (ItemListController.parameters.tag) {
          CommonController.getTagList(null, ItemListController.loadedTagList);
          return;
        }
      } else {
        ItemListController.parseItemList(result);
      }
    }
    ItemListController.postLoadItemList();      
  },

  parseItemList: function(result) {
    var ul = $("#item-list");
    var itemlist = result.itemlist;
    var length = itemlist.length;
    for (var i = 0; i < length; i++) {
      var item = itemlist[i];
      var li = $(document.createElement("li"));
      li.addClass("item");
      var ui = CommonController.createRepositoryUI(item.owner, item.name, item.avatar, item.thumbnail, item.tags);
      li.append(ui);
      ul.append(li);
    }
  },
  
  loadedTagList: function(result, error) {
    if (CommonController.showError(error) != true) {
      var taglist = result.taglist;
      var container = $("#item-list");
      var title = $(document.createElement("div"));
      title.text("item not found. please select from following tags.");
      title.attr("id", "tag-title");
      container.append(title);
      var defaultFontSize = 30;
      for (var i = 0, n = taglist.length; i < n; i++) {
        var tagResult = taglist[i];
        var element = $(document.createElement("a"));
        element.text(tagResult.tag);
        element.css("font-size", defaultFontSize+"px");
        element.addClass("tag");
        var url = CommonController.getTagURL(tagResult.tag);
        element.attr("href", url);
        container.append(element);
      }
    }
    ItemListController.postLoadItemList();      
  },

  postLoadItemList: function() {
    var parameters = ItemListController.parameters;
    if (parameters.code) {
      CommonController.authorize(parameters.code, ItemListController.authorized);
    } else {
      CommonController.setParameters(ItemListController);
      if (ItemListController.user) {
        CommonController.updateUI(ItemListController.user, ItemListController.avatar_url);
      }
      Logger.off();
    }
  },

  authorized: function(result, error) {
    Logger.off();
    if (CommonController.showError(error) == true) return;
    CommonController.updateUI(result.user, result.avatar_url);
  },
};

$(document).ready(function() {
  ItemListController.init();
});