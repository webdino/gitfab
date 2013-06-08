/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemListController = {
  init: function() {
    $.getJSON(LIST_API, ItemListController.loadItemList);
  },
  
  loadItemList: function(result) {
    ItemListController.parseItemList(result);

    var parameters = CommonController.getParameters();
    if (!parameters.code) {
      return;
    }
    $.get("api/token.php?code="+parameters.code, function(data) {
      var regex = /access_token=([^&]+)/;
      var result = regex.exec(data);
      if (!result) {
        $("#login").text(data);
        return;
      }
      ItemListController.access_token = result[1];
      $.getJSON(USER_API+ItemListController.access_token, ItemListController.loadAuthUser);
    });
  },
  
  parseItemList: function(result) {
    var ul = $("#item-list");
    var itemlist = result.data;
    for (var i = 0, n = itemlist.length; i < n; i++) {
      var item = itemlist[i];
      var owner = item.owner.login;
      var repository = item.name;
      var li = $(document.createElement("li"));
      li.addClass("item");
      var link = $(document.createElement("a"));
      var url = ITEM_PAGE+"owner="+owner+"&repository="+repository;
      link.attr("href", url);
      link.text(item.full_name);
      li.append(link);
      ul.append(li);
    }
  },
  
  loadAuthUser: function(result) {
    var username = result.data.login;
    CommonController.authorized(username, ItemListController.access_token);
    
    var itemlist = $(".item a");
    for (var i = 0, n = itemlist.length; i < n; i++) {
      var item = $(itemlist[i]);
      var href = item.attr("href");
      href += "&access_token=" + ItemListController.access_token+"&user="+username;
      item.attr("href", href);
    }
  }
};

$(document).ready(function() {
  ItemListController.init();
});