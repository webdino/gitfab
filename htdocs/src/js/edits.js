/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var EditController = {
  init: function() {
    //reusable elements
    EditController.reusable_input = $(document.createElement("input"));
    EditController.reusable_input.attr("id", "reusable_input");
    EditController.reusable_textarea = $(document.createElement("textarea"));
    EditController.reusable_textarea.attr("id", "reusable_textarea");

    $("#append-button").click(EditController.append);
    $("#upload").change(EditController.upload);
    $("#title").click(EditController.editTitle);
    $("#tags").click(EditController.editTags);
  },
  
  editTextContent: function(e) {
    if (e.target.nodeName == "A") {
      return;
    }
    var target = $(e.currentTarget);
    target.unbind("click", EditController.editTextContent);
    var text = target.text();
    EditController.reusable_textarea.val(text);
    target.empty();
    target.append(EditController.reusable_textarea);
    EditController.reusable_textarea.blur(EditController.commitTextContent);
    EditController.reusable_textarea.focus();
  },
  
  commitTextContent: function(e) {
    var text = EditController.reusable_textarea.val();
    var html = EditController.encode4html(text);
    var target = EditController.reusable_textarea.parent();
    target.html(html);
    target.click(EditController.editTextContent);
    EditController.reusable_textarea.unbind("blur", EditController.commitTextContent);
  },
  
  editTitle: function(e) {
    var title = $("#title");
    title.unbind("click", EditController.editTitle);
    var text = title.text();
    title.empty();
    title.addClass("editing");
    EditController.reusable_input.val(text);
    EditController.reusable_input.addClass("title");
    EditController.reusable_input.change(EditController.commitTitle);
    EditController.reusable_input.blur(EditController.commitTitle);
    title.append(EditController.reusable_input);
    EditController.reusable_input.focus();
  },
  
  commitTitle: function(e) {
    var text = EditController.reusable_input.val();
    var title = $("#title");
    title.text(text);
    title.removeClass("editing");
    title.click(EditController.editTitle);
    EditController.reusable_input.removeClass("title");
    EditController.reusable_input.unbind("change", EditController.commitTitle);
    EditController.reusable_input.unbind("blur", EditController.commitTitle);
  },
  
  editTags: function(e) {
    var tags = $("#tags");
    tags.unbind("click", EditController.editTags);
    var text = tags.text();
    tags.empty();
    tags.addClass("editing");
    EditController.reusable_input.val(text);
    EditController.reusable_input.addClass("tags");
    EditController.reusable_input.change(EditController.commitTags);
    EditController.reusable_input.blur(EditController.commitTags);
    tags.append(EditController.reusable_input);
    EditController.reusable_input.focus();
  },
  commitTags: function(e) {
    var text = EditController.reusable_input.val();
    var tags = $("#tags");
    tags.text(text);
    tags.removeClass("editing");
    tags.click(EditController.editTags);
    EditController.reusable_input.removeClass("tags");
    EditController.reusable_input.unbind("change", EditController.commitTags);
    EditController.reusable_input.unbind("blur", EditController.commitTags);
  },
  
  upload: function(e) {
    var file = this.files[0];
    if (file.type.match(/image.*/)) {
    
      var img = $(document.createElement("img"));
      img.file = file;
      var reader = new FileReader();
      reader.onload = function(e) { 
        //replace image
        EditController.upload_target.find(".image-container").remove();
        //removes upload button
        EditController.upload_target.parent().find(".button.upload").remove();

        img.attr("src", reader.result);
        var imgContainer = $(document.createElement("div"));
        imgContainer.addClass("image-container");
        imgContainer.append(img);
        EditController.upload_target.append(imgContainer);
        img.click(EditController.kickUploadFromImage);
      };
      reader.readAsDataURL(file);
    }
  },
  
  kickUpload: function(e) {
    var target = e.target;
    var parent = $(target.parentNode.parentNode);
    var content = $(parent.find(".content"));
    EditController.upload_target = content;
    $("#upload").click();
  },
  
  kickUploadFromImage: function(e) {
    var target = e.currentTarget;
    EditController.upload_target = $(target.parentNode.parentNode);
    $("#upload").click();
  },
  
  remove: function(e) {
    var target = $(e.currentTarget.parentNode.parentNode);
    target.remove();
  },
  
  append: function(e) {
    var textarea = $("#textarea");
  
    var html = EditController.encode4html(textarea.val());
    //elements
    var process = $(document.createElement("li"));
    process.addClass("process");
    var textcontent = $(document.createElement("div"));
    textcontent.addClass("text");
    textcontent.html(html);
    var content = $(document.createElement("div"));
    content.addClass("content");
    content.append(textcontent);
    textcontent.click(EditController.editTextContent);

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
    remove.click(EditController.remove);

    process.append(content);
    process.append(func);
    
    $("#process-list ul").append(process);
    
    textarea.val("");
  },
  
  encode4html: function(text) {
    var html = text;
    //changes <>
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    //find the name
    html = html.replace(/^(#\S+)/, "<div class='name'>$1</div>");
    //adds to link
    html = html.replace(/(http:\/\/\S+)/, "<a href='$1'>$1</a>");
    //replaces to br
    html = html.replace(/\n/g, "\n<br/>");
    return html;
  }
};

$(document).ready(function() {
  EditController.init();
});