/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var Logger = {
  on: function() {
    clearTimeout(Logger.timer);
    $("#logger").show();
  },

  request: function(url) {
    Logger.log("request: "+url);
  },
  
  response: function(url) {
    Logger.log("response: "+url);
  },
  
  error: function(content) {
    Logger.log("ERROR: "+content, "error");
  },
  
  log: function(content, className) {
    var element = $(document.createElement("div"));
    element.text(content);
    if (className) {
      element.addClass(className);
    }
    $("#logger").append(element);
  },
  
  off: function() {
    Logger.timer = setTimeout(function() {
      $("#logger").hide();
      $("#logger").html("");
    }, 500);
  }
}