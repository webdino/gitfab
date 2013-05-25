/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var EditController = {
  init: function() {
    $("#send-button").click(EditController.send);
    $("#upload").change(EditController.upload)
  },
  
  upload: function(e) {
    var target = EditController.upload_target;
    var parent = $(target.parentNode.parentNode);
    var content = $(parent.find(".content"));
    for (var i = 0, n = this.files.length; i < n; i++) {
      var file = this.files[i];
      if (file.type.match(/image.*/)) {
        var img = $(document.createElement("img"));
        img.file = file;
        var reader = new FileReader();
        reader.onload = function(e) { 
          img.attr("src", reader.result);
          var imgContainer = $(document.createElement("div"));
          imgContainer.append(img);
          content.append(imgContainer);
        };
        reader.readAsDataURL(file);
      }
    }
  },
  
  kickUpload: function(e) {
    EditController.upload_target = e.target;
    $("#upload").click();
  },
  
  send: function(e) {
    var html = $("#textarea").val();
    //changes <>
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    //find the name
    html = html.replace(/^(#\S+)/, "<div class='name'>$1</div>");
    //adds to link
    html = html.replace(/(http:\/\/\S+)/, "<a href='$1'>$1</a>");
    //replaces to br
    html = html.replace(/\n/g, "<br/>");
    //elements
    var process = $(document.createElement("li"));
    process.addClass("process");

    var content = $(document.createElement("div"));
    content.addClass("content");
    content.html(html);

    var func = $(document.createElement("div"));
    func.addClass("function");
    var upload = $(document.createElement("div"));
    upload.addClass("button");
    upload.addClass("upload");
    var remove = $(document.createElement("div"));
    remove.addClass("button");
    remove.addClass("remove");
    func.append(upload);
    func.append(remove);
    upload.click(EditController.kickUpload);

    process.append(content);
    process.append(func);
    
    $("#process-list ul").append(process);
  }
};

$(document).ready(function() {
  EditController.init();
});