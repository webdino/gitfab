/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var MATERIALS = "materials";
var MAIN_DOCUMENT = "README.md";

var ItemController = {
  init: function() {
    ItemController.base64 = new Base64();
    ItemController.current_id = 0;
    //get the repository name from query string
    var parameters = CommonController.getParameters();
    ItemController.access_token = parameters.access_token;
    ItemController.user = parameters.user;
    if (parameters.owner) {
      ItemController.owner = parameters.owner;
      ItemController.repository = parameters.repository;
      var gitfabDocumentURL = "https://api.github.com/repos/"+parameters.owner+"/"+parameters.repository+"/contents/"+MAIN_DOCUMENT+"?callback=?";
      $.getJSON(gitfabDocumentURL, ItemController.loadedGitFabDocument);
    } else {
      if (ItemController.user) {
        $("#owner").text(ItemController.user);
        $("#title").text("input-your-repository-name");
        ItemController.getAuthUser();
      } else {
        //not found
        $("#item").text("item not found");
      }
    }
  },
  
  setEditable: function() {
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
    $("#main").addClass("editable");
  },
  
  loadedGitFabDocument: function(result) {
    if (result.data.message) {
      alert(result.data.message);
      return;
    }
    ItemController.parseGitFabDocument(result);
    ItemController.getAuthUser();
  },
  
  parseGitFabDocument: function(result) {
    var content = ItemController.base64.decodeStringAsUTF8(result.data.content.replace(/\n/g, ""));
    //parse
    var lines = content.split("\n");
    var title = ItemController.repository;
    var tags = lines[1].substring("## ".length);
    var owner = ItemController.owner ? ItemController.owner : ItemController.user;
    $("#owner").text(owner);
    $("#title").text(title);
    $("#tags").text(tags);
    var text;
    for (var i = 4, n = lines.length; i < n; i++) {
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
  
  getAuthUser: function() {
    if (ItemController.access_token) {
//      $.getJSON(USER_API+ItemController.access_token, ItemController.loadAuthUser);
      ItemController.authorized();
    } else {
      $("#fork").click(function() {
        alert("please login");
      });
    }
  },
  
  loadAuthUser: function(result) {
    var username = result.data.login;
    ItemController.user = username;
    ItemController.authorized();
  },
  
  authorized: function() {
    CommonController.authorized(ItemController.user, ItemController.access_token);
    if (ItemController.owner) {
      if (ItemController.owner == ItemController.user) {
        ItemController.setEditable();
      } else {
        $("#fork").click(function () {
          ItemController.fork(function() {
            ItemController.watch(ItemController.user, ItemController.repository, function() {
              var url = "http://gitfab.org/item.php?owner="+ItemController.user+"&repository="+ItemController.repository+"&user="+ItemController.user+"&access_token="+ItemController.access_token;
              window.location.href = url;
            });
          });
        });
      }
    } else {
      if (ItemController.user) {
        ItemController.setEditable();
      }
    }
  },
  
  fork: function(callback) {
    var url = "https://api.github.com/repos/"+ItemController.owner+"/"+ItemController.repository+"/forks";
    $.ajax({
      type: "POST",
      url: url,
      headers: {
        "Authorization":" bearer "+ItemController.access_token
      },
      success: function(data){
        callback();
      },
      error: function(request, textStatus, errorThrown){
        var response = JSON.parse(request.responseText);
        alert("ERROR:"+response.errors[0].message);
      }
    });
  },
  
  editTextContent: function(e) {
    if (!ItemController.user) {
      e.preventDefault();
      return;
    }
    var currentTarget = e.currentTarget;
    var originalTarget = e.originalEvent.target;
    if (originalTarget.tagName == "A" && originalTarget != currentTarget) {
      return;
    }
    
    var target = $(currentTarget);
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
    var target = ItemController.reusable_textarea.parent();
    ItemController.updateProcess(text, target);
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
    if (!ItemController.user) {
      e.preventDefault();
      return false;
    }
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
    var repository = $("#title").text();
    //リポジトリ作成
    if (!ItemController.repository) {
      ItemController.newRepository(repository, function () {
        ItemController.watch(ItemController.user, ItemController.repository, ItemController.update);
      });
    } else if (ItemController.repository != repository) {
      //rename
      ItemController.renameRepository(repository, ItemController.update);
    } else {
      ItemController.update();
    }
  },

  watch: function(owner, repository, callback) {
    var url = WATCH_API+"owner="+owner+"&repository="+repository;
    $.getJSON(url, function(data) {
      if (data.message) {
        alert(data.message);
        return;
      }
      callback();
    });
  },
  
  update: function() {
    ItemController.loadShaMap(ItemController.commitDocument);
  },
  
  loadShaMap: function(callback) {
    var url = "https://api.github.com/repos/"+ItemController.user+"/"+ItemController.repository+"/git/trees/master?recursive=1&callback=?";
    $.getJSON(url, function(result) {
      var shamap = {};
      var tree = result.data.tree;
      for (var i = 0, n = tree.length; i < n; i++) {
        var node = tree[i];
        shamap[node.path] = node.sha;
      }
      callback(shamap);
    });
  },
  
  commitDocument: function(shamap) {
    var userDocument = "";
    userDocument += "# "+ItemController.repository;
    userDocument += "\n";
    userDocument += "## "+$("#tags").text();
    userDocument += "\n";
    userDocument += "This document is for [gitfab](http://gitfab.org)";
    userDocument += "\n";
    userDocument += "---";
    userDocument += "\n";

    var filemap = {};
    var contentList = $(".content");
    for (var i = 0, n = contentList.length; i < n; i++) {
      var content = contentList.get(i);
      var text = content.markdown;
      var files = content.files;
      for (key in files) {
        var file = files[key];
        filemap[key] = file;
        //replace url
        var fileURL = "https://raw.github.com/"+ItemController.user+"/"+ItemController.repository+"/master/"+MATERIALS+"/"+file.name;
        text = text.replace(key, fileURL);
      }
      content.markdown = text;
      content.files = {};
      userDocument += text+"\n";
      userDocument += "---\n";
    }
    //ここで userDocument を README.md の内容としてコミット
    ItemController.commitFile(MAIN_DOCUMENT, ItemController.base64.encodeStringAsUTF8(userDocument), "", shamap, function() {
      ItemController.commitFiles(filemap, shamap);
    });
  },

  commitFiles: function(filemap, shamap) {
    var file = null;
    for (var key in filemap) {
      file = filemap[key];
      delete filemap[key];
      break;
    }
    if (!file) {
      return;
    }
    var reader = new FileReader();
    reader.onload = function(e) {
      var content = reader.result;
      var index = content.indexOf(",");
      content = content.substring(index+1);
      var path = MATERIALS+"/"+file.name;
      ItemController.commitFile(path, content, "", shamap, function() {
        ItemController.commitFiles(filemap, shamap);
      });
    };
    reader.readAsDataURL(file);
  },

  commitFile: function(path, content, message, shamap, callback) {
    var url = "https://api.github.com/repos/"+ItemController.user+"/"+ItemController.repository+"/contents/"+path;
    var parameters = {
      path: path,
      message: message,
      content: content
    };
    if (shamap && shamap[path]) {
      parameters.sha = shamap[path];
    }
    $.ajax({
      type: "PUT",
      url: url,
      headers: {
        "Authorization":" bearer "+ItemController.access_token
      },
      data: JSON.stringify(parameters),
      dataType:"json",
      success: function(data){
        callback(data);
      },
      error: function(request, textStatus, errorThrown){
        alert("Create File ERROR:"+textStatus+"["+path+"]");
      }
    });
  },
  
  newRepository: function(name, callback) {
    var parameters = {
      name: name,
      auto_init: true
    };
    $.ajax({
      type: "POST",
      url: CREATE_REPOSITORY_API,
      headers: {
        "Authorization":" bearer "+ItemController.access_token
      },
      data: JSON.stringify(parameters),
      dataType:"json",
      success: function(data){
        ItemController.repository = name;
        callback(data);
      },
      error: function(request, textStatus, errorThrown){
        var response = JSON.parse(request.responseText);
        alert("ERROR:"+response.errors[0].message);
      }
    });
  },

  renameRepository: function(name, callback) {
    var url = "https://api.github.com/repos/"+ItemController.user+"/"+ItemController.repository;
    var parameters = {
      name: name,
    };
    $.ajax({
      type: "PATCH",
      url: url,
      headers: {
        "Authorization":" bearer "+ItemController.access_token
      },
      data: JSON.stringify(parameters),
      dataType:"json",
      success: function(data){
        ItemController.repository = name;
        callback(data);
      },
      error: function(request, textStatus, errorThrown){
        var response = JSON.parse(request.responseText);
        alert("ERROR:"+response.errors[0].message);
      }
    });
  },
  
  encode4html: function(text) {
    return window.markdown.toHTML(text);
  }
};

$(document).ready(function() {
  ItemController.init();
});