/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemListController = {
  init: function() {
    Logger.on();
    var parameters = CommonController.getParametersFromQuery();
    var tag = parameters.tag;
    var owner = parameters.owner;
    if (tag) {
      document.title = "gitfab tag:"+tag;
    } else if (owner) {
      document.title = "gitfab owner:"+owner;
    }
    CommonController.getItemListFromDatabase(parameters.tag, parameters.owner, ItemListController.loadedItemList);
//    CommonController.getItemList(ItemListController.loadedItemList);
  },
  
  loadedItemList: function(result, error) {
//    ItemListController.parseItemList(result, error);
    ItemListController.parseItemListOfDatabase(result, error);
    var parameters = CommonController.getParametersFromQuery();
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

  parseItemListOfDatabase: function(result, error) {
    if (CommonController.showError(error) == true) return;
    var ul = $("#item-list");
    var itemlist = result.itemlist;
    for (var i = 0, n = itemlist.length; i < n; i++) {
      var item = itemlist[i];
      var li = $(document.createElement("li"));
      li.addClass("item");
      var ui = CommonController.createRepositoryUI(item.owner, item.name, item.avatar, item.thumbnail);
      li.append(ui);
      ul.append(li);
    }
  },
  
  parseItemList: function(itemlist, error) {
    if (CommonController.showError(error) == true) return;
    var ul = $("#item-list");
    for (var i = 0, n = itemlist.length; i < n; i++) {
      var item = itemlist[i];
      var owner = item.owner.login;
      var repository = item.name;
      var li = $(document.createElement("li"));
      li.addClass("item");
      var link = $(document.createElement("a"));
      var url = CommonController.getItemPageURL(owner, repository);
      link.attr("href", url);

      var avatar = $(document.createElement("img"));
      avatar.attr("src", item.owner.avatar_url);
      var textContent = $(document.createElement("span"));
      textContent.text(item.full_name);
      link.append(avatar);
      link.append(textContent);
      
      li.append(link);
      ul.append(li);
    }
  },
  
  authorized: function(result, error) {
  console.log(result);
    Logger.off();
    if (CommonController.showError(error) == true) return;
    CommonController.updateUI(result.user, result.avatar_url);
  },
};

$(document).ready(function() {
  ItemListController.init();
});