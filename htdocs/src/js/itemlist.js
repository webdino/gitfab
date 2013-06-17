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
    CommonController.setParameters(ItemListController);
    if (ItemListController.user) {
      CommonController.updateUI(ItemListController.user);
      Logger.off();
    } else {
      var parameters = CommonController.getParametersFromQuery();
      if (!parameters.code) {
        Logger.off();
        return;
      }
      CommonController.authorize(parameters.code, ItemListController.authorized);
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
      link.text(item.full_name);
      li.append(link);
      ul.append(li);
    }
  },
  
  authorized: function(result, error) {
    Logger.off();
    if (CommonController.showError(error) == true) return;
    CommonController.updateUI(result.user);
  },
};

$(document).ready(function() {
  ItemListController.init();
});