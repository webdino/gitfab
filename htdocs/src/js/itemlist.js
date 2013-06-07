/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var LIST_API = "https://api.github.com/users/gitfab/subscriptions?callback=?";
var TOKEN_API = "https://github.com/login/oauth/access_token";
var USER_API = "https://api.github.com/user?callback=?&access_token=";
var ITEM_PAGE = "item.php?";

var ItemListController = {
  init: function() {
    $.getJSON(LIST_API, ItemListController.loadItemList);

    var url = window.location.href;
    var indexOfQ = url.indexOf("?");
    if (indexOfQ < 0) {
    } else {
      var queryString = url.substring(indexOfQ+1);
      var params = queryString.split("&");
      for (var i = 0, n = params.length; i < n; i++) {
        var param = params[i];
        var keyvalue = param.split("=");
        ItemListController[keyvalue[0]] = keyvalue[1];
      }
    }

    if (ItemListController.code) {
      $.get("api/token.php?code="+ItemListController.code, function(data) {
        var regex = /access_token=([^&]+)/;
        var result = regex.exec(data);
        ItemListController.access_token = result[1];
        $.getJSON(USER_API+ItemListController.access_token, ItemListController.loadAuthUser);
      });
    }
    
  },
  
  loadAuthUser: function(result) {
    var username = result.data.login;
    $("#login").text(username);
    $("#toolbar").show();
  },
  
  loadItemList: function(result) {
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
      if (ItemListController.access_token) {
        url += "&access_token="+ItemListController.access_token;
      }
      link.attr("href", url);
      link.text(item.full_name);
      li.append(link);
      ul.append(li);
    }
  }
};

$(document).ready(function() {
  ItemListController.init();
});