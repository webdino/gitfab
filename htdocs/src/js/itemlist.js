/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var LIST_API = "https://api.github.com/users/gitfab/subscriptions?callback=?";
var ITEM_PAGE = "item.php?";

var ItemListController = {
  init: function() {
    $.getJSON(LIST_API, ItemListController.loaded);
  },
  
  loaded: function(result) {
    var ul = $("#item-list");
    var itemlist = result.data;
    for (var i = 0, n = itemlist.length; i < n; i++) {
      var item = itemlist[i];
      var owner = item.owner.login;
      var repository = item.name;
      var master = item.master_branch;
      var li = $(document.createElement("li"));
      li.addClass("item");
      var link = $(document.createElement("a"));
      link.attr("href", ITEM_PAGE+"owner="+owner+"&repository="+repository+"&master="+master);
      link.text(item.full_name);
      li.append(link);
      ul.append(li);
    }
  }
};

$(document).ready(function() {
  ItemListController.init();
});