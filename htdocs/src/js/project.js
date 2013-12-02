/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ProjectController = {

  init: function () {
    ProjectController.markdownParser = new Showdown.converter();
    ProjectController.current_item_id = 0;

    var user = CommonController.getUser();
    var owner = CommonController.getOwner();
    var repository = CommonController.getRepository();
    var branch = CommonController.getBranch();
    var token = CommonController.getToken();
    var avatarURL = CommonController.getAvatarURL();
    document.title = "gitFAB/" + owner + "/" + repository;

    //header
    if (user) {
      CommonController.updateUI(user, avatarURL);
      $("#main").addClass("hasToolbar");
    } 

    //repository
    if (repository == CREATE_PROJECT_COMMAND) {
      ProjectController.newGitFABDocument(user, avatarURL);
      $("#fork-button").hide();
    } else {
      var gitfabDocument = ProjectController.getGitFABDocument();
      if (gitfabDocument.length == 0) {
        $("#project").text("project not found["+owner+"/"+repository+"]");
        return;
      }
      ProjectController.parseGitFABDocument(gitfabDocument, owner, repository, branch, user);
      ProjectController.loadAdditionalInformation(owner, repository, branch);

      if (!user) {
        $("#fork-button").click(function() { alert("please login"); });
      } else {
        $("#fork-button").click(function() {ProjectController.forkProject(token, user, owner, repository, branch);});
      }
    }

    //editor
    if (user == owner) {
      ProjectEditor.enable(user, repository, branch);
      $("#commit-button").click(function() {ProjectController.commitProject(token, user, owner, repository, branch);});
      $("#delete-button").click(function() {ProjectController.deleteProject(token, user, owner, repository, branch);});
      ProjectController.originalThumbnail = ProjectController.findThumbnail();
    }

    //slide button
    $("#slide-button").click(ProjectController.slideshow);
  },

  newGitFABDocument: function(user, avatar_url) {
    ProjectController.appendOwnerName(user);
    ProjectController.appendOwnerIcon(avatar_url);
    $("#repository").text("input-your-repository-name");
    $("#tags").text("input-tags");
  },

  getGitFABDocument: function() {
    return document.getElementById("gitfab-document").innerHTML;
  },

  parseGitFABDocument: function (content, owner, repository, branch, user) {
    //parse
    var lines = content.split("\n");
    var title = branch == "master" ? repository : branch;
    var tags = lines[1].substring("## ".length);

    tags = tags.split(',');
    ProjectController.appendOwnerName(owner);

    $("#repository").text(title);
    for(key in tags) {
      var tag = $(document.createElement("a"));
      if(owner != user) {
        tag.attr("href","/?tag="+$.trim(tags[key]));
      }
      tag.text(tags[key]+" ");
      $("#tags").append(tag); 
    }
    var text;
    for (var i = 4, n = lines.length; i < n; i++) {
      var line = lines[i];
      if (line == "---") {
        ProjectController.append2dom(text);
        text = null;
        continue;
      }
      if (text) {
        text += "\n" + line;
      } else {
        text = line;
      }
    }
    ProjectController.updateIndex();
    var thumbnail = ProjectController.findThumbnail();
    $("#thumbnail").attr("src", thumbnail.src);
  },

  append2dom: function (text) {
    var item = $(document.createElement("li"));
    item.addClass("item");
    item.attr("id", ProjectController.current_item_id++);
    var content = $(document.createElement("a"));
    content.addClass("content");
    ProjectController.updateItem(text, content);
    item.append(content);
    $("#item-list-ul").append(item);
    return item;
  },

  appendOwnerName: function(name) {
    var a = $(document.createElement("a"));
    a.attr("href", "/"+name+"/");
    a.text(name);
    $("#owner").append(a);
  },

  appendOwnerIcon: function(url) {
    var icon = $(document.createElement("img"));
    icon.attr("src", url);
    $("#owner").children().append(icon);
  },

  updateIndex: function () {
    var container = $("#index ul");
    container.empty();
    var headings = $(".content h1");
    for (var i = 0, n = headings.length; i < n; i++) {
      var h1 = headings.get(i);
      var li = $(document.createElement("li"));
      var a = $(document.createElement("a"));
      a.attr("href", "#" + i);
      a.text(h1.textContent);
      li.append(a);
      container.append(li);
    }
  },

  findThumbnail: function () {
    var resources = $(".content img,.content video");
    var thumbnail = {};
    var resource;
    for (var i = 0, n = resources.length; i < n; i++) {
      resource = resources[i];
      if (resource.tagName.toUpperCase() == "IMG") {
        var src = resource.getAttribute("fileurl");
        if (!src) {
          src = resource.getAttribute("src");
        }
        thumbnail.src = src;
        break;
      }
      var poster = resource.getAttribute("poster");
      if (poster) {
        thumbnail.src = poster;
        break;
      }
    }
    if (thumbnail.src) {
      resource = $(resource);
      thumbnail.aspect = resource.width() / resource.height();
    }
    return thumbnail;
  },

  updateItem: function (text, target) {
    target.get(0).markdown = text;
    var html = ProjectController.encode4html(text);
    target.html(html);
    target.find("a").attr("target", "_blank");
    ProjectController.updateIndex();
  },

  encode4html: function (text) {
    return ProjectController.markdownParser.makeHtml(text);
  },

  loadAdditionalInformation: function (owner, repository, branch) {
    var promise = CommonController.getAdditionalInformation(owner, repository, branch);
    promise.then(function(result) {
      ProjectController.appendOwnerIcon(result.owner.avatar_url);
      //find a parent and children at here
    });
  },

  //update the project ========================================
  forkProject: function(token, user, owner, repository, branch) {
    Logger.on();
    var promise = null;
    if (user == owner) {
      var newBranch = "duplicate-of-"+(branch == MASTER_BRANCH ? repository : branch);
      promise = CommonController.newBranch(token, owner, repository, branch, newBranch);
      branch = newBranch;
    } else {
      promise = CommonController.fork(token, owner, repository);
      promise.then(function() {
        branch = MASTER_BRANCH;
        return CommonController.watch(user, repository);
      });
    }
    promise.then(function() {
      return CommonController.newLocalRepository(user, repository, branch);
    })
    .fail(function(error) {
      CommonController.showError(error);
      Logger.error(error);
    })
    .done(function() {
      var url = CommonController.getProjectPageURL(user, repository, branch);
      ProjectController.href(url);
    });    
  },

  deleteProject: function(token, user, owner, repository, branch) {
    if (!window.confirm("are you sure to remove this project?")) {
      return;
    }

    Logger.on();

    var promise4github = null;
    var promise4local = null;
    if (branch == MASTER_BRANCH) {
      promise4github = CommonController.deleteRepository(token, user, repository);
      promise4local = CommonController.deleteLocalRepository(user, repository);
    } else {
      promise4github = CommonController.deleteBranch(token, user, repository, branch);
      promise4local = CommonController.deleteLocalBranch(user, repository, branch);
    }
    var promise = CommonController.when(promise4github, promise4local);
    promise.then(function() {
    })
    .fail(function(error) {
      CommonController.showError(error);
      Logger.error(error);
    })
    .done(function() {
      ProjectController.href("/");
    });
  },

  commitProject: function(token, user, owner, repository, branch) {
    var projectName = $.trim($("#repository").text());
    if (projectName.length == 0) {
      CommonController.showError("please input the project name");
      return;
    }

    Logger.on();

    var avatar = $("#login img").attr("src");
    var tags = $.trim($("#tags").text());
    var promise = null;
    var isURLChanged = false;
    var shaTree = null;
    var thumbnailAspect = 0;
    var thumbnailSrc = "";
    if (repository == CREATE_PROJECT_COMMAND) {
      promise = ProjectController.newRepository(token, user, projectName);
      repository = projectName;
      branch = MASTER_BRANCH;
      isURLChanged = true;
    } else {
      if (branch == MASTER_BRANCH && projectName != repository) {
        promise = ProjectController.renameRepository(token, user, projectName, repository);
        repository = projectName;
        isURLChanged = true;
      } else if (branch != MASTER_BRANCH && projectName != branch) {
        promise = ProjectController.renameBranch();
        branch = projectName;
        isURLChanged = true;
      } else {
        promise = CommonController.emptyPromise();
      }
    }
    promise.then(function() {
      return CommonController.getSHATree(user, repository, branch);
    })
    .then(function(result) {
      shaTree = result.data.tree;
      return ProjectController.commitElements(token, user, repository, branch, tags, shaTree);
    })
    .then(function() {
      var thumbnail = ProjectController.findThumbnail();
      var originalThumbnail = ProjectController.originalThumbnail;
      if (thumbnail.src && !(originalThumbnail.src && originalThumbnail.src == thumbnail.src)) {
        thumbnailAspect = thumbnail.aspect;
        thumbnailSrc = CommonController.getThumbnailURL(user, repository, branch);
        return ProjectController.commitThumbnail(token, user, repository, branch, thumbnail, shaTree);
      }
    })
    .then(function() {
      return ProjectController.updateRepositoryMeta(user, repository, branch, tags, avatar, thumbnailSrc, thumbnailAspect);
    })
    .fail(function(error) {
      CommonController.showError(error);
      Logger.error(error);
    })
    .done(function() {
      if (isURLChanged == true) {
        var url = CommonController.getProjectPageURL(user, repository, branch);
        ProjectController.href(url);
      } else {
        Logger.off();
      }
    });
  },

  updateRepositoryMeta: function(user, repository, branch, tags, avatar, thumbnail, aspect) {
    return CommonController.updateRepositoryMetadata(user, repository, branch, tags, avatar, thumbnail, aspect);
  },

  newRepository: function(token, user, repository) {
    var promise4github = CommonController.newRepository(token, repository);
    promise4github.then(function() {
      return CommonController.watch(user, repository);
    });
    var promise4local = CommonController.newLocalRepository(user, repository, MASTER_BRANCH);
    return CommonController.when(promise4github, promise4local);
  },

  renameRepository: function(token, user, newRepository, previousRepository) {
    var promise4github = CommonController.renameRepository(token, user, newRepository, previousRepository);
    var promise4local = CommonController.renameLocalRepository(user, newRepository, previousRepository);
    return CommonController.when(promise4github, promise4local);
  },

  renameBranch: function(token, user, repository, newBranch, previousBranch) {
    var promise4github = CommonController.renameBranch(token, user, repository, newBranch, previousBranch);
    var promise4local = CommonController.renameLocalBranch(user, repository, newBranch, previousBranch);
    return CommonController.when(promise4github, promise4local);
  },

  commitElements: function(token, user, repository, branch, tags, shatree) {
    var base64 = new Base64();
    var elements = ProjectController.prepareCommitElements(user, repository, branch, tags);
    var promiseList = [];
    promiseList[0] = CommonController.commit(token, user, repository, branch, MAIN_DOCUMENT, base64.encodeStringAsUTF8(elements.document), "", shatree);
    if (elements.customCSS) {
      promiseList.push( CommonController.commit(token, user, repository, branch, CUSTOM_CSS, base64.encodeStringAsUTF8(elements.customCSS), "", shatree) );
    }
    var attachments = elements.attachments;
    for (var attachmentName in attachments) {
      var attachment = attachments[attachmentName];
      var path = MATERIALS_DIR + "/" + attachment.name;
      var promise4read = CommonController.readFile(attachment);
      promise4read.then(function(content) {
        var commitPromise = CommonController.commit(token, user, repository, branch, path, content, "", shatree);
        promiseList.push(commitPromise);
      });
    }
    return CommonController.when.apply(null, promiseList);
  },

  prepareCommitElements: function(user, repository, branch, tags) {
    var userDocument = "";
    userDocument += "# " + repository;
    userDocument += "\n";
    userDocument += "## " + tags;
    userDocument += "\n";
    userDocument += "This document is made by [gitfab](http://gitfab.org)";
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
        var fileURL = CommonController.getFileURL(user, repository, branch, MATERIALS_DIR + "/" + file.name);
        text = text.replace(key, fileURL);
        $("img[src='" + key + "']").attr("fileurl", fileURL);
      }
      content.markdown = text;
      content.files = {};
      userDocument += text + "\n";
      userDocument += "---\n";
    }
    var elements = {"document": userDocument, "attachments": filemap};
    var stylesheet = $("#" + CUSTOME_CSS_ID);
    if (stylesheet.length != 0) {
      elements.customCSS = stylesheet.text();
    }
    return elements;
  },

  commitThumbnail: function(token, user, repository, branch, thumbnail, shaTree) {
    var promise = CommonController.getImage(thumbnail.src);
    promise.then(function(image) {
      var canvas = document.createElement("canvas");
//      $(canvas).hide();
//      document.body.appendChild(canvas);
      var context = canvas.getContext("2d");
      var width = 400;
      var height = width * image.naturalHeight / image.naturalWidth;
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      context.drawImage(image, 0, 0, width, height);
//      canvas.setAttribute("width", image.naturalWidth);
//      canvas.setAttribute("height", image.naturalHeight);
//      context.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, image.naturalWidth, image.naturalHeight);
//      $(canvas).css({width: width+"px", height: height+"px"});
      var data = canvas.toDataURL("image/jpeg");
      var index = data.indexOf(",");
      data = data.substring(index + 1);
//      $(canvas).remove();
      return CommonController.commit(token, user, repository, branch, THUMBNAIL, data, "", shaTree);
    });
    return promise;
  },
  
  href: function(url) {
    setTimeout(function () {
      window.location.href = url;
      Logger.off();
    }, 500);
  },

  slideshow: function () {
    var contentlist = [];
    var meta = $(document.getElementById("meta").cloneNode(true));
    var thumbnail = ProjectController.findThumbnail();
    if (thumbnail) {
      meta.css("background-image", "url(" + thumbnail.src + ")");
    }
    var index = $(document.getElementById("index").cloneNode(true));
    contentlist.push(meta.get(0));
    contentlist.push(index.get(0));
    //contents
    var contents = $(".content");
    for (var i = 0, n = contents.length; i < n; i++) {
      var content = contents.get(i);
      var element = $(document.createElement("section"));
      element.addClass("content");
      element.html(content.innerHTML);
      contentlist.push(element.get(0));
    }
    Slide.setContentList(contentlist);
    Slide.show();
  }
};

$(document).ready(function () {
  ProjectController.init();
});