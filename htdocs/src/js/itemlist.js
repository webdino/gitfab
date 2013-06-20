/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemListController = {
  init: function() {
    Logger.on();
    CommonController.getItemList(ItemListController.loadedItemList);
  },
  
  loadedItemList: function(result, error) {
    ItemListController.parseItemList(result, error);
    var parameters = CommonController.getParametersFromQuery();
    if (parameters.code) {
      CommonController.authorize(parameters.code, ItemListController.authorized);
    } else {
      CommonController.setParameters(ItemListController);
      if (ItemListController.user) {
        CommonController.updateUI(ItemListController.user, ItemListController.avatar_url);
        Logger.off();
      }
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