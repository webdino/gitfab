/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var Slide = {
  setContentList: function(contentlist) {
    Slide.contentlist = contentlist;
  },

  show: function() {
    $("#slide-container").empty();
    Slide.current_index = 0;
    Slide.setContent(Slide.current_index);
    var html = $("html");
    html.css("overflow", "hidden");
    html.keypress(Slide.key);
    $("#slide").show();
  },

  next: function() {
    if (Slide.current_index + 1 == Slide.contentlist.length) {
      return;
    }
    Slide.removeHeaderNumber();
    Slide.current_index += 1;
    Slide.setContent(Slide.current_index);
  },

  previous: function() {
    if (Slide.current_index == 0) {
      return;
    }
    Slide.removeHeaderNumber();
    Slide.current_index -= 1;
    Slide.setContent(Slide.current_index);
  },

  setContent: function(index) {
    var container = $("#slide-container");
    container.empty();
    var content = Slide.contentlist[index];
    container.get(0).appendChild(content);
    Slide.setHeaderNumber();

  },
  setHeaderNumber: function(){  
    var header = $("#slide-container").find(':header')[0];
    if(header != undefined)header.innerHTML = Slide.current_index-1+"."+ header.innerHTML;
  },
  removeHeaderNumber: function(){  
    var header = $("#slide-container").find(':header')[0];
    if(header != undefined)header.innerHTML = header.innerHTML.substring(header.innerHTML.indexOf(".")+1);
  },

  key: function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    switch (code) {
      case 27 : {
        Slide.close();
        break;
      }
      case  37 :
      case  38 : {
        Slide.previous();
        break;
      }
      case  39 :
      case  40 : {
        Slide.next();
        break;
      }
    }
  },

  close: function() {
    var html = $("html");
    html.css("overflow", "auto");
    html.unbind("keypress", Slide.key);
    var slide = $("#slide");
    slide.hide();
  }
}
