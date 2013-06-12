/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var LIST_API = "https://api.github.com/users/gitfab/subscriptions?callback=?";
var TOKEN_API = "https://github.com/login/oauth/access_token";
var USER_API = "https://api.github.com/user?callback=?&access_token=";
var CREATE_REPOSITORY_API = "https://api.github.com/user/repos";
var ITEM_PAGE = "item.php?";
var ITEM_LIST_PAGE = "itemlist.php?";
var WATCH_API = "api/watch.php?";
var TOKEN_API = "api/token.php?";


var CommonController = {
  getParameters: function() {
    var parameters = {};
    var url = window.location.href;
    var indexOfQ = url.indexOf("?");
    if (indexOfQ >= 0) {
      var queryString = url.substring(indexOfQ+1);
      var params = queryString.split("&");
      for (var i = 0, n = params.length; i < n; i++) {
        var param = params[i];
        var keyvalue = param.split("=");
        parameters[keyvalue[0]] = keyvalue[1];
      }
    }
    return parameters;
  },
  
  authorized: function(username, token) {
    $("#login").text("logged in as "+username);
    $("#create").attr("href", ITEM_PAGE+"access_token="+token+"&user="+username);
    $("#create").show()
    $("#toolbar").show()
    $("#logo a").attr("href", ITEM_LIST_PAGE+"access_token="+token+"&user="+username);
  }
}