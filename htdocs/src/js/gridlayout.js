/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var GridLayout = {
  doLayout: function(gridsize, containerwidth, margin, elements, informations) {
    var area = gridsize*gridsize;
    var lineElements = [];
    for (var i = 0, n = elements.length, x = margin; i < n; i++) {
      var information = informations[i];
      var element = elements[i];
      var ratio = area / information.aspect;
      var sqrt = Math.sqrt(ratio);
      var height = sqrt;
      var width = height*information.aspect;
      element.tempWidth = width;
      element.tempAspect = information.aspect;

      var nextx = x + width + margin;
      if (nextx > containerwidth) {
        GridLayout.doLineLayout(lineElements, containerwidth, margin);
        lineElements = [];
        lineElements.push(element)
        x = margin + width + margin;
      } else {
        lineElements.push(element)
        x = nextx;
      }
    }
    GridLayout.doLineLayout(lineElements, containerwidth, margin);
  },

  doLineLayout: function(elements, containerwidth, margin) {
    var totalWidth = margin;
    for (var i = 0, n = elements.length; i < n; i++) {
      totalWidth += elements[i].tempWidth + margin;
    }
    var diff = containerwidth - totalWidth;
    var diffPerElement = diff / elements.length;
    for (var i = 0, n = elements.length; i < n; i++) {
      var element = elements[i];
      var width = element.tempWidth + diffPerElement;
      var height = width / element.tempAspect;
      element.addClass("grid");
      element.css({width:width+"px", height:height+"px", "margin-left": margin+"px"});
    }
  }
};