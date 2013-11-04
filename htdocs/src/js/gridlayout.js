/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var GridLayout = {
  doLayout: function(containerwidth, container, elements, informations) {
    var DEFAULT_REPOSITORY_UI_SIZE = 180;
    var GRID_MARGIN = 10;
//    GridLayout.doVerticalLayout(DEFAULT_REPOSITORY_UI_SIZE, containerwidth, GRID_MARGIN, container, elements, informations);
//    GridLayout.doHorizontalLayout(DEFAULT_REPOSITORY_UI_SIZE, containerwidth, GRID_MARGIN, container, elements, informations);
//    GridLayout.doSquareLayout(DEFAULT_REPOSITORY_UI_SIZE, containerwidth-15, GRID_MARGIN, container, elements, informations);
    GridLayout.doCardLayout(DEFAULT_REPOSITORY_UI_SIZE, containerwidth-15, GRID_MARGIN, container, elements, informations);

/*
    for (var i = 0, n = elements.length; i < n; i++) {
      var element = elements[i];
      container.append(element);
    }
*/
  },

  doCardLayout: function(gridsize, containerwidth, margin, container, elements, informations) {
    var columns = Math.floor(containerwidth/(gridsize+margin));
    if (columns == 0) {
      columns = 1;
    }
    var wOfProject = (containerwidth-(margin*columns+1))/columns;
    var wOfMargin = (containerwidth - (wOfProject*columns)) / columns;

    if (!GridLayout.current_height_list) {
      GridLayout.current_height_list = [];
      for (var i = 0; i < columns; i++) {
        GridLayout.current_height_list[i] = 0;
      }
    }
    var hOfCurrents = GridLayout.current_height_list;

    for (var i = 0, n = elements.length; i < n; i++) {
      var element = elements[i];
      element.addClass("grid");
      var width = wOfProject;
      var columnIndex = 0;
      var currentHeight = hOfCurrents[0];
      for (var j = 1; j < columns; j++) {
        if (currentHeight > hOfCurrents[j]) {
          columnIndex = j;
          currentHeight = hOfCurrents[j];
        }
      }
      var thumbnail = element.find(".thumbnail");
      var thumbnailHeight = thumbnail.height();
      if (thumbnailHeight == 0) {
        var information = informations[i];
        if (information.aspect && information.aspect > 0) {
          $(thumbnail).css("height", wOfProject/information.aspect);
        }
      }

      var left = wOfMargin + columnIndex * (wOfProject + wOfMargin);
      var top = hOfCurrents[columnIndex] + wOfMargin;
      element.css({width:width+"px", "left": left+"px", "top": top+"px"});
      container.append(element);

      var height = element.height();
      hOfCurrents[columnIndex] = height + top;
    }
    //find highest height
    var maxHeight = GridLayout.current_height_list[0];
    for (var i = 1; i < columns; i++) {
      maxHeight = Math.max(maxHeight, GridLayout.current_height_list[i]);
    }
    container.height(maxHeight+wOfMargin);
  },

  doSquareLayout: function(gridsize, containerwidth, margin, container, elements, informations) {
    var columns = Math.floor(containerwidth/(gridsize+margin));
    if (columns == 0) {
      columns = 1;
    }
    var wOfProject = (containerwidth-(margin*columns+1))/columns;

    for (var i = 0, n = elements.length, x = margin; i < n; i++) {
      var information = informations[i];
      var element = elements[i];
      element.addClass("grid");
      var height = wOfProject;
      var width = wOfProject;
      element.css({width:width+"px", height:height+"px", "margin-left": margin+"px"});
      container.append(element);
    }
  },

  doVerticalLayout: function(gridsize, containerwidth, margin, container, elements, informations) {
    var columns = Math.floor(containerwidth/gridsize);
    if (columns == 0) {
      columns = 1;
    }
    var wOfProject = containerwidth/columns;

    var columnHs = [];
    for (var i = 0; i < columns; i++) {
      columnHs.push(0);
    }
    var maxH = 0;
    for (var i = 0, n = elements.length; i < n; i++) {
      var information = informations[i];
      var element = elements[i];
      container.append(element);
      var width = wOfProject;
      var height = wOfProject/information.aspect;
      var minH = Number.MAX_VALUE;
      var minIndex = 0;
      for (var j = 0; j < columns; j++) {
        if (minH > columnHs[j]) {
          minH = columnHs[j];
          minIndex = j;
        }
      }
      element.css({position:"absolute", width:width+"px", height:height+"px", top:columnHs[minIndex]+"px", left:(minIndex*width)+"px"});
      columnHs[minIndex] += height;
      maxH = Math.max(maxH, columnHs[minIndex]);
    }
    container.height(maxH);
  },

  doHorizontalLayout: function(gridsize, containerwidth, margin, container, elements, informations) {
    var area = gridsize*gridsize;
    var lineElements = [];
    for (var i = 0, n = elements.length, x = margin; i < n; i++) {
      var information = informations[i];
      var element = elements[i];
      container.append(element);
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