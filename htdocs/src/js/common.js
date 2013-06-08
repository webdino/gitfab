/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var LIST_API = "https://api.github.com/users/gitfab/subscriptions?callback=?";
var TOKEN_API = "https://github.com/login/oauth/access_token";
var USER_API = "https://api.github.com/user?callback=?&access_token=";
var ITEM_PAGE = "item.php?";

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
    $("#login").text(username);
    $("#create").attr("href", ITEM_PAGE+"access_token="+token);
    $("#create").show()
    $("#toolbar").show()
  }
}