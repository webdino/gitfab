/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemController = {
  init: function() {
    ItemController.current_id = 0;
    //reusable elements
    ItemController.reusable_input = $(document.createElement("input"));
    ItemController.reusable_input.attr("id", "reusable_input");
    ItemController.reusable_textarea = $(document.createElement("textarea"));
    ItemController.reusable_textarea.attr("id", "reusable_textarea");

    $("#append-button").click(ItemController.append);
    $("#commit-button").click(ItemController.commit);
    $("#upload").change(ItemController.upload);
    $("#title").click(ItemController.editTitle);
    $("#tags").click(ItemController.editTags);
  },
  
  editTextContent: function(e) {
    if (e.target.nodeName == "A") {
      return;
    }

    var target = $(e.currentTarget);
    target.unbind("click", ItemController.editTextContent);
    
    var text = target.text();
    ItemController.reusable_textarea.val(text);
    target.empty();
    target.append(ItemController.reusable_textarea);
    ItemController.reusable_textarea.focus();
    ItemController.reusable_textarea.blur(ItemController.commitTextContent);

    //この属性があると、textarea をクリックした場合でも blur イベントが発生してしまう。
    var content = target.parent(".content");
    content.removeAttr("draggable");
    content.removeAttr("href");
  },
  
  commitTextContent: function(e) {
    var text = ItemController.reusable_textarea.val();
    var html = ItemController.encode4html(text);
    var target = ItemController.reusable_textarea.parent();
    target.html(html);
    target.click(ItemController.editTextContent);
    ItemController.reusable_textarea.unbind("blur", ItemController.commitTextContent);
    
    var content = target.parent(".content");
    content.attr("draggable", "true");
    content.attr("href", "#");
    
  },
  
  editTitle: function(e) {
    var title = $("#title");
    title.unbind("click", ItemController.editTitle);
    var text = title.text();
    title.empty();
    title.addClass("editing");
    ItemController.reusable_input.val(text);
    ItemController.reusable_input.addClass("title");
    ItemController.reusable_input.change(ItemController.commitTitle);
    ItemController.reusable_input.blur(ItemController.commitTitle);
    title.append(ItemController.reusable_input);
    ItemController.reusable_input.focus();
  },
  
  commitTitle: function(e) {
    var text = ItemController.reusable_input.val();
    var title = $("#title");
    title.text(text);
    title.removeClass("editing");
    title.click(ItemController.editTitle);
    ItemController.reusable_input.removeClass("title");
    ItemController.reusable_input.unbind("change", ItemController.commitTitle);
    ItemController.reusable_input.unbind("blur", ItemController.commitTitle);
  },
  
  editTags: function(e) {
    var tags = $("#tags");
    tags.unbind("click", ItemController.editTags);
    var text = tags.text();
    tags.empty();
    tags.addClass("editing");
    ItemController.reusable_input.val(text);
    ItemController.reusable_input.addClass("tags");
    ItemController.reusable_input.change(ItemController.commitTags);
    ItemController.reusable_input.blur(ItemController.commitTags);
    tags.append(ItemController.reusable_input);
    ItemController.reusable_input.focus();
  },
  commitTags: function(e) {
    var text = ItemController.reusable_input.val();
    var tags = $("#tags");
    tags.text(text);
    tags.removeClass("editing");
    tags.click(ItemController.editTags);
    ItemController.reusable_input.removeClass("tags");
    ItemController.reusable_input.unbind("change", ItemController.commitTags);
    ItemController.reusable_input.unbind("blur", ItemController.commitTags);
  },
  
  upload: function(e) {
    var file = this.files[0];
    if (file.type.match(/image.*/)) {
      var img = $(document.createElement("img"));
      var reader = new FileReader();
      reader.onload = function(e) { 
        //replace image
        ItemController.upload_target.find(".image-container").remove();
        //removes upload button
        ItemController.upload_target.parent().find(".button.upload").remove();
        ItemController.upload_target.get(0).uploaded_file = file;

        img.attr("src", reader.result);
        var imgContainer = $(document.createElement("div"));
        imgContainer.addClass("image-container");
        imgContainer.append(img);
        ItemController.upload_target.append(imgContainer);
        img.click(ItemController.kickUploadFromImage);
      };
      reader.readAsDataURL(file);
    }
  },
  
  kickUpload: function(e) {
    var target = e.target;
    var parent = $(target.parentNode.parentNode);
    var content = $(parent.find(".content"));
    ItemController.upload_target = content;
    $("#upload").click();
  },
  
  kickUploadFromImage: function(e) {
    var target = e.currentTarget;
    ItemController.upload_target = $(target.parentNode.parentNode);
    $("#upload").click();
  },
  
  remove: function(e) {
    var target = $(e.currentTarget.parentNode.parentNode);
    target.remove();
  },
  
  dragStart: function(e) {
    var source = $(e.currentTarget);
    var dataTransfer = e.originalEvent.dataTransfer;
    dataTransfer.setData("text/plain", source.parent().attr("id"));
    return true;
  },
  
  dragOver: function(e) {
    e.preventDefault();
    return false;
  },
  
  dropEnd: function(e) {
    var target = $(e.currentTarget).parent(".process");
    var targetid = target.attr("id");
    var dataTransfer = e.originalEvent.dataTransfer;
    var sourceid = dataTransfer.getData('text/plain');
    if (targetid == sourceid) {
      return;
    }
    e.stopPropagation();
    
    var source = $("#"+sourceid);
    var processes = $(".process");
    var sourceIndex = processes.index(source);
    var targetIndex = processes.index(target);
    var isBefore = sourceIndex > targetIndex;
    
    //exchange
    if (isBefore == true) {
      target.before(source);
    } else {
      target.after(source);
    }
    return false;
  },
  
  append: function(e) {
    var textarea = $("#textarea");
  
    var html = ItemController.encode4html(textarea.val());
    //elements
    var process = $(document.createElement("li"));
    process.addClass("process");
    process.attr("id", ItemController.current_id++);
    var textcontent = $(document.createElement("div"));
    textcontent.addClass("text");
    textcontent.html(html);
    textcontent.click(ItemController.editTextContent);

    var content = $(document.createElement("a"));
    content.attr("draggable", "true");
    content.attr("href", "#");
    content.addClass("content");
    content.append(textcontent);
    content.bind('dragstart', ItemController.dragStart);
    content.bind('dragover', ItemController.dragOver);
    content.bind('drop', ItemController.dropEnd);
    
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
    upload.click(ItemController.kickUpload);
    remove.click(ItemController.remove);

    process.append(content);
    process.append(func);
    
    $("#process-list ul").append(process);
    
    textarea.val("");
  },
  
  commit: function(e) {
    //このタイトルのリポジトリを作成あるいはアップデート
    var title = $("#title").text();
    //タグ
    var tags = $("#tags").text();
    var contentList = $(".content");
    var userDocument = "";
    for (var i = 0, n = contentList.length; i < n; i++) {
      var content = $(contentList.get(i));
      var textContent = content.find(".text").text();
      var file = content.get(0).uploaded_file;

      userDocument += textContent+"\n";
      if (file) {
        userDocument += file.name+"\n";
        //file をコミット
      }
      userDocument += "--\n";
      
    }
    //userDocument をコミット

    console.log("--------------------");
    console.log("title:"+title);
    console.log("tags:"+tags);
    console.log("document:");
    console.log(userDocument);
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
  ItemController.init();
});