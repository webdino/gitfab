/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ItemController = {
  init: function() {
    ItemController.markdownParser = new Showdown.converter();
    ItemController.base64 = new Base64();
    ItemController.current_id = 0;

    CommonController.setParameters(ItemController);
    document.title = "gitfab/"+ItemController.owner+"/"+ItemController.repository;

    if (ItemController.user) {
      CommonController.updateUI(ItemController.user, ItemController.avatar_url);
    }

    if (ItemController.user == ItemController.owner) {
      if (ItemController.repository == ":create") {
        //new repository
        ItemController.repository = null;
        $("#owner").text(ItemController.user);
        $("#title").text("input-your-repository-name");
        ItemController.setEditable();
      } else {
        //update repository
        ItemController.loadGitfabDocument(true);
      }
    } else if (ItemController.repository) {
      ItemController.loadGitfabDocument(false);
      if (!ItemController.user) {
        $("#fork-button").click(function() {
          alert("please login");
        });
      } else {
        $("#fork-button").click(function () {
          ItemController.fork();
        });
      }
    } else {
      //not found
      $("#item").text("item not found");
    }
  },
  
  loadGitfabDocument: function(isEditable) {
    Logger.on();
    CommonController.getGitfabDocument(ItemController.owner, ItemController.repository, function(gitfabDocument, error) {
      Logger.off();
      if (CommonController.showError(error) == true) return;
      ItemController.parseGitFabDocument(gitfabDocument);
      if (isEditable == true) {
        ItemController.setEditable();
      }
      ItemController.loadRepositoryInformation();
    });
  },
  
  loadRepositoryInformation: function() {
    CommonController.getRepositoryInformation(ItemController.owner, ItemController.repository, function(result, error) {

      var userName = $(document.createElement("span"));
      userName.text(result.owner.login);
      var userImg = $(document.createElement("img"));
      userImg.attr("src", result.owner.avatar_url);
      $("#owner").html("");
      $("#owner").append(userImg).append(userName);    

      //parent
      if (result.parent) {
        var owner = result.parent.owner.login;
        var repository = result.parent.name;
        ItemController.appendRepositoryUITo($("#parent-item"), owner, repository);
        $("#parent-item-label").text("parent item");
      } else {
        $("#parent-item").hide();
        $("#parent-item-label").text("this is a root item");
      }
      if (result.forks_count == 0) {
        return;
      }
      $("#child-item-list-label").text("child item list");
      CommonController.getForksInformation(ItemController.owner, ItemController.repository, function(forks, error) {
        for (var i = 0, n = forks.length; i < n; i++) {
          var fork = forks[i];
          var owner = fork.owner.login;
          var repository = fork.name;
          var container = $(document.createElement("div"));
          container.addClass("child-item");
          $("#child-item-list").append(container);
          ItemController.appendRepositoryUITo(container, owner, repository);
        }
      });
    });
  },
  
  appendRepositoryUITo: function(container, owner, name) {
    CommonController.getMataData(owner, name, function(result, error) {
      if (error) {
        CommonController.showError(error);
        return;
      }
      var metadata = result.metadata;
      var avatar = metadata.avatar;
      var thumbnail = metadata.thumbnail;
      var ui = CommonController.createRepositoryUI(owner, name, avatar, thumbnail);
      container.append(ui);
    });
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
    $("#delete-button").click(ItemController.deleteRepository);

    $("#upload").change(ItemController.upload);
    $("#title").click(ItemController.editTitle);
    $("#tags").click(ItemController.editTags);
    $("#main").addClass("editable");
  },
  
  parseGitFabDocument: function(result) {
    var content = ItemController.base64.decodeStringAsUTF8(result.content.replace(/\n/g, ""));
    //parse
    var lines = content.split("\n");
    var title = ItemController.repository;
    var tags = lines[1].substring("## ".length);
    var owner = ItemController.owner ? ItemController.owner : ItemController.user;
    var userName = $(document.createElement("span"));
    userName.text(owner);
    $("#owner").append(userName);
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
    var areaHeight = window.innerHeight < target.height() ? window.innerHeight : target.height();
    ItemController.reusable_textarea.height(areaHeight);
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
    ItemController.updatesection(text, target);
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
      //append a section via upload
      var section = ItemController.append2dom("");
      target = section.find(".content").get(0);
      ItemController.upload_target = $(target);
    }
    var file = this.files[0];

    var urlObject = window.URL ? window.URL : window.webkitURL;
    var url = urlObject.createObjectURL(file);
    if (file.type.match(/image.*/)) {
      text += "!["+file.name+"]("+url+")";
    } else {
      text += "["+file.name+"]("+url+")";
    }
    ItemController.updatesection(text, ItemController.upload_target);
    if (!target.files) {
      target.files = {};
    }
    target.files[url] = file;
  },
  
  updatesection: function(text, target) {
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
    var target = $(e.currentTarget).parent(".section");
    var targetid = target.attr("id");
    var dataTransfer = e.originalEvent.dataTransfer;
    var sourceid = dataTransfer.getData('text/plain');
    if (targetid == sourceid) {
      return;
    }
    e.stopPropagation();
    
    var source = $("#"+sourceid);
    var sections = $(".section");
    var sourceIndex = sections.index(source);
    var targetIndex = sections.index(target);
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
    var section = $(document.createElement("li"));
    section.addClass("section");
    section.attr("id", ItemController.current_id++);

    var content = $(document.createElement("a"));
    content.attr("draggable", "true");
    content.attr("href", "#");
    content.addClass("content");
    content.bind('dragstart', ItemController.dragStart);
    content.bind('dragover', ItemController.dragOver);
    content.bind('drop', ItemController.dropEnd);
    content.click(ItemController.editTextContent);
    ItemController.updatesection(text, content);
    
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

    section.append(content);
    section.append(func);
    
    $("#section-list-ul").append(section);
    return section;
  },
  
  commit: function(e) {
    //このタイトルのリポジトリを作成あるいはアップデート
    Logger.on();
    var repository = $("#title").text();
    ItemController.oldrepository = "";
    if (!ItemController.repository) {
      //new
      ItemController.newRepository(repository);
    } else if (ItemController.repository != repository) {
      //rename
      ItemController.renameRepository(repository);
    } else {
      //update
      ItemController.updateRepository();
    }
  },

  watch: function(owner, repository, callback) {
    CommonController.watch(owner, repository, callback);
  },
  
  updateRepository: function() {
    CommonController.getSHATree(ItemController.user, ItemController.repository, ItemController.commitDocument);
  },
  
  updateMetadata: function(callback) {
    var tags = $("#tags").text();
    var avatar = $("#login img").attr("src");
    var resources = $(".content img,.content video");
    var thumbnail = "";
    for (var i = 0, n = resources.length; i < n; i++) {
      var resource = resources[i];
      if (resource.tagName.toUpperCase() == "IMG") {
        thumbnail = resource.getAttribute("fileurl");
        if (!thumbnail) {
          thumbnail = resource.getAttribute("src");
        }
        break;
      }
      var poster = resource.getAttribute("poster");
      if (poster) {
        thumbnail = poster;
        break;
      }
    }
    CommonController.updateMetadata(ItemController.user, ItemController.repository, ItemController.oldrepository, tags, avatar, thumbnail, callback);
  },

  commitDocument: function(result, error) {
    if (CommonController.showError(error) == true) return;

    var tree = result.tree;

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
        var fileURL = CommonController.getFileURL(ItemController.user, ItemController.repository, MATERIALS+"/"+file.name);
        text = text.replace(key, fileURL);
        $("img[src='"+key+"']").attr("fileurl", fileURL);
      }
      content.markdown = text;
      content.files = {};
      userDocument += text+"\n";
      userDocument += "---\n";
    }
    //ここで userDocument を README.md の内容としてコミット
    ItemController.commitChain(MAIN_DOCUMENT, ItemController.base64.encodeStringAsUTF8(userDocument), "", tree, filemap);
  },

  commitChain: function(path, content, message, tree, filemap) {
    CommonController.commit(ItemController.token, ItemController.user, ItemController.repository, path, content, message, tree, function() {
      var file = null;
      for (var key in filemap) {
        file = filemap[key];
        delete filemap[key];
        break;
      }
      if (!file) {
        ItemController.updateMetadata(function() {
          //done
          Logger.off();
        });
        return;
      }
      var reader = new FileReader();
      reader.onload = function(e) {
        var content = reader.result;
        var index = content.indexOf(",");
        content = content.substring(index+1);
        var path = MATERIALS+"/"+file.name;
        ItemController.commitChain(path, content, "", tree, filemap);
      };
      reader.readAsDataURL(file);
    });
  },
  
  newRepository: function(name) {
    CommonController.newRepository(ItemController.token, name, function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }

      ItemController.repository = name;
      ItemController.watch(ItemController.user, ItemController.repository, function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        ItemController.updateRepository();
      });
    });
  },
  
  renameRepository: function(name) {
    CommonController.renameRepository(ItemController.token, ItemController.user, name, ItemController.repository, function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }
      ItemController.oldrepository = ItemController.repository;
      ItemController.repository = name;
      ItemController.updateRepository();
    });
  },
  
  deleteRepository: function() {
    if (!window.confirm("are you sure to remove this item?")) {
      return;
    }
    Logger.on();
    CommonController.deleteRepository(ItemController.token, ItemController.owner, ItemController.repository, function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }
      Logger.log("reload:/");
      setTimeout(function() {
        window.location.href = "/";
        Logger.off();
      }, 500);
    });
  },

  fork: function() {
    Logger.on();
    CommonController.fork(ItemController.token, ItemController.owner, ItemController.repository, function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }
      ItemController.watch(ItemController.user, ItemController.repository, function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        };
        ItemController.oldrepository = "";
        ItemController.updateMetadata(function() {
          var url = CommonController.getItemPageURL(ItemController.user, ItemController.repository);
          Logger.log("reload: "+url);
          setTimeout(function() {
            window.location.href = url;
            Logger.off();
          }, 500);
        });
      });
    });
  },
  
  encode4html: function(text) {
    return ItemController.markdownParser.makeHtml(text);
  }
};

$(document).ready(function() {
  ItemController.init();
});