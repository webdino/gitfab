/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var TagListController = {
  init: function() {
    CommonController.getTagList(null, TagListController.loaded);
  },

  loaded: function(result, message) {
    if (message) {
      CommonController.showError(message);
      return;
    }
    var taglist = result.taglist;
    var container = $("#tag-list");
    var defaultFontSize = 12;
    for (var i = 0, n = taglist.length; i < n; i++) {
      var tagResult = taglist[i];
      var tagContainer = $(document.createElement("div"));
      var element = $(document.createElement("a"));
      element.text(tagResult.tag);
      element.css("font-size", defaultFontSize+"px");
      var url = CommonController.getTagURL(tagResult.tag);
      element.attr("href", url);
      tagContainer.append(element);
      container.append(tagContainer);
    }
  }
}

$(document).ready(function() {
  TagListController.init();
});