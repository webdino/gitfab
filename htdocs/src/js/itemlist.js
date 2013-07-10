/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemListController = {
  init: function() {
    Logger.on();
    var parameters = CommonController.getParametersFromQuery();
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
      var link = $(document.createElement("a"));
      var url = CommonController.getItemPageURL(item.owner, item.name);
      link.attr("href", url);

      var thumbnail = null;
      if (item.thumbnail == "") {
        thumbnail = $(document.createElement("div"));
        thumbnail.addClass("dummy");
        thumbnail.text("no thumbnail");
      } else {
        thumbnail = $(document.createElement("img"));
        thumbnail.attr("src", item.thumbnail);
      }
      thumbnail.addClass("thumbnail");

      var avatar = $(document.createElement("img"));
      avatar.attr("src", item.avatar);
      avatar.addClass("avatar");

      var owner = $(document.createElement("div"));
      owner.addClass("owner");
      owner.text(item.owner);

      var repository = $(document.createElement("div"));
      repository.addClass("repository");
      repository.text(item.name);

      link.append(avatar);
      link.append(repository);
      link.append(owner);
      link.append(thumbnail);
      
      li.append(link);
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