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
    $("#upload-button").click(ItemController.appendViaUpload);
    $("#commit-button").click(ItemController.commit);
    $("#upload").change(ItemController.upload);
    $("#title").click(ItemController.editTitle);
    $("#tags").click(ItemController.editTags);

    //get the repository name from query string
    var url = window.location.href;
    var indexOfQ = url.indexOf("?");
    if (indexOfQ < 0) {
      $("#title").text("untitled");
    } else {
      var queryString = url.substring(indexOfQ+1);
      var params = queryString.split("&");
      for (var i = 0, n = params.length; i < n; i++) {
        var param = params[i];
        var keyvalue = param.split("=");
        ItemController[keyvalue[0]] = keyvalue[1];
      }
      var gitfabDocumentURL = "https://api.github.com/repos/"+ItemController.owner+"/"+ItemController.repository+"/contents/gitfab.md?callback=?";
      $.getJSON(gitfabDocumentURL, ItemController.loadedGitFabDocument);
    }

    if (ItemController.access_token) {
      $("#login").hide();
      $("#toolbar").show();
    }
  },
  
  loadedGitFabDocument: function(result) {
    var base64 = new Base64();
    var content = base64.decodeStringAsUTF8(result.data.content.replace(/\n/g, ""));
    //parse
    var lines = content.split("\n");
    var title = ItemController.repository;
    var tags = lines[1].substring("tags:".length);
    $("#title").text(title);
    $("#tags").text(tags);
    var text;
    for (var i = 2, n = lines.length; i < n; i++) {
      var line = lines[i];
      if (line == "---") {
        ItemController.append2dom(text);
        text = null;
        continue;
      }
      if (text) {
        text += "\n" + line;
      } else {
        text = line;
      }
    }
  },
  
  editTextContent: function(e) {
    var target = $(e.currentTarget);
    target.unbind("click", ItemController.editTextContent);
    
    var text = target.get(0).markdown;
    ItemController.reusable_textarea.val(text);
    target.empty();
    target.append(ItemController.reusable_textarea);
    ItemController.reusable_textarea.focus();
    ItemController.reusable_textarea.blur(ItemController.commitTextContent);

    //この属性があると、textarea をクリックした場合でも blur イベントが発生してしまう。
    target.removeAttr("draggable");
    target.removeAttr("href");
  },
  
  commitTextContent: function(e) {
    var text = ItemController.reusable_textarea.val();
    var html = ItemController.encode4html(text);
    var target = ItemController.reusable_textarea.parent();
    target.html(html);
    target.click(ItemController.editTextContent);
    ItemController.reusable_textarea.unbind("blur", ItemController.commitTextContent);
    target.attr("draggable", "true");
    target.attr("href", "#");
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
    var target = null;
    var text = "";
    if (ItemController.upload_target) {
      target = ItemController.upload_target.get(0);
      text += target.markdown+"\n\n";
    } else {
      //append a process via upload
      var process = ItemController.append2dom("");
      target = process.find(".content").get(0);
      ItemController.upload_target = $(target);
    }
    var file = this.files[0];
    var url = URL.createObjectURL(file);
    if (file.type.match(/image.*/)) {
      text += "!["+file.name+"]("+url+")";
    } else {
      text += "["+file.name+"]("+url+")";
    }
    ItemController.updateProcess(text, ItemController.upload_target);
    if (!target.files) {
      target.files = {};
    }
    target.files[url] = file;
  },
  
  updateProcess: function(text, target) {
    target.get(0).markdown = text;
    var html = ItemController.encode4html(text);
    target.html(html);
    target.find("a").attr("target", "_blank");
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
    var text = textarea.val();
    ItemController.append2dom(text);
    textarea.val("");
  },

  appendViaUpload: function(e) {
    ItemController.upload_target = null;
    $("#upload").click();
  },
  
  append2dom: function(text) {
    //elements
    var process = $(document.createElement("li"));
    process.addClass("process");
    process.attr("id", ItemController.current_id++);

    var content = $(document.createElement("a"));
    content.attr("draggable", "true");
    content.attr("href", "#");
    content.addClass("content");
    content.bind('dragstart', ItemController.dragStart);
    content.bind('dragover', ItemController.dragOver);
    content.bind('drop', ItemController.dropEnd);
    content.click(ItemController.editTextContent);
    ItemController.updateProcess(text, content);
    
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
    
    $("#process-list-ul").append(process);
    return process;
  },
  
  commit: function(e) {
    //このタイトルのリポジトリを作成あるいはアップデート
    //var title = $("#title").text();
    //タグ
    var tags = $("#tags").text();
    var contentList = $(".content");
    var userDocument = "";
    for (var i = 0, n = contentList.length; i < n; i++) {
      var content = contentList.get(i);
      var text = content.markdown;
      var files = content.files;
      for (key in files) {
        var file = files[key];
        //replace url
        var fileURL = "https://raw.github.com/"+ItemController.owner+"/"+ItemController.repository+"/"+ItemController.master+"/"+file.name;
        text = text.replace(key, fileURL);
        //ここで file を上記URLにあうようにコミット
      }
      content.markdown = text;
      content.files = {};
      userDocument += text+"\n";
      userDocument += "--\n";
    }
    //ここで userDocument を gitfab.md の内容としてコミット

    console.log("--------------------");
    console.log("repository:"+ItemController.repository);
    console.log("tags:"+tags);
    console.log("document:");
    console.log(userDocument);
  },
  
  encode4html: function(text) {
    return window.markdown.toHTML(text);
  }
};

$(document).ready(function() {
  ItemController.init();
});