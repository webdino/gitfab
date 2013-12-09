/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var ProjectController = {

  init: function () {
    ProjectController.doLayout();
    ProjectController.markdownParser = new Showdown.converter();
    ProjectController.current_item_id = 0;
    ProjectController.readmeSHA = null;
    ProjectController.thumbnailSHA = null;

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
      CommonController.getOwnersProjectList(user)
      .then(function(result) {
        ProjectController.myProjectList = result.projectList;
      })
      .fail(function(error) {
        CommonController.showError(error);
      });
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
      var thumbnailSrc = CommonController.getThumbnailURL(owner, repository, branch);
      $("#thumbnail").attr("src", thumbnailSrc);

      ProjectController.loadAdditionalInformation(owner, repository, branch);
      ProjectController.loadCommitHistories(owner, repository, branch);

      if (!user) {
        $("#fork-button").click(function() { alert("please login"); });
      } else {
        $("#fork-button").click(function() {ProjectController.forkProject(token, user, owner, repository, branch);});
      }

      if($(".content").length != 0){ 
        var abstractHTML = $(".content:first").html();      
        var abstractTitle = abstractHTML.split("</h1>")[0].split(">");
        // abstractTitle = abstractTitle[0].split(">");

        var abstractText = $(".content:first").text();
        abstractText = abstractText.split(abstractTitle[1])[1];
        abstractText = abstractText.substring(0,200);

        $("#abstract-title").text(abstractTitle[1]);
        $("#abstract-text").text(abstractText);
      }


    }

    //editor
    if (user == owner) {
      ProjectEditor.enable(user, repository, branch);
      $("#commit-button").click(function() {ProjectController.commitProject(token, user, owner, repository, branch);});
      $("#delete-button").click(function() {ProjectController.deleteProject(token, user, owner, repository, branch);});
    } else {
      $("#commit-button").hide();
      $("#customize-css").hide();
      $("#delete-button").hide();
    }

    //slide button
    $("#slide-button").click(ProjectController.slideshow);

    $(window).resize(ProjectController.doLayout);
  },

  doLayout: function() {
    var wOfWindow = $(window).width();
    var wOfSub = $("#sub").width();
    var wOfMain = wOfWindow-wOfSub;
    $("#main").width(wOfMain);
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

    ProjectController.appendOwnerName(owner);
    ProjectController.parseTagString(tags);

    $("#repository").text(title);

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
  },

  parseTagString: function(text) {
    var tagsElement = $("#tags");
    tagsElement.empty();
    var user = CommonController.getUser();
    var owner = CommonController.getOwner();
    var tags = text.split(",");
    for(key in tags) {
      var tag = $(document.createElement("a"));
      if(owner != user) {
        tag.attr("href","/?tag="+$.trim(tags[key]));
      }
      tag.text(tags[key]);
      tagsElement.append(tag); 
    }
  },

  getTagString: function() {
    var tags = $("#tags");
    var tagList = tags.find("a");
    var text = "";
    for (var i = 0, n = tagList.length; i < n; i++) {
      if (i != 0) {
        text += ",";
      }
      text += tagList.get(i).textContent;
    }
    return text;
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
      console.log(result);
    });
  },

  loadCommitHistories: function (owner, repository, branch) {
    var promise = CommonController.getCommitHistories(owner, repository, branch);
    promise.then(function(result) {
      var ulElement = $(document.createElement("ul"));
      for (var i = 0, n = result.length; i < n; i++) {
        var hisotry = result[i];
        var sha = hisotry.sha;
        var date = hisotry.commit.committer.date;
        var thumbnailURL = CommonController.getHistoricalFileURL(owner, repository, sha, THUMBNAIL);

        var liElement = $(document.createElement("li"));
        var dateElement = $(document.createElement("label"));
        var thumbnailElement = $(document.createElement("img"));

        dateElement.text(date);
        thumbnailElement.attr("src", thumbnailURL);
        liElement.append(thumbnailElement);
        liElement.append(dateElement);

        ulElement.append(liElement);
      }
      $("#histories").append(ulElement);
    })
    .fail(function(e) {
      var element = $(document.createElement("label"));
      element.addClass("error");
      element.text(e);
      $("#versions").append(element);
    });
  },

  //update the project ========================================
  forkProject: function(token, user, owner, repository, branch) {
    var promise = null;
    var parentOwner;
    var parentRepository;
    var parentBranch;
    var childOwner;
    var childRepository;
    var childBranch;
    if (user == owner) {// fork from itself
        var newBranch = "duplicate-of-"+(branch == MASTER_BRANCH ? repository : branch);
        Logger.on();
        promise = CommonController.newBranch(token, owner, repository, branch, newBranch);
        branch = newBranch;
    } else { // fork from others
      var projectName = branch == MASTER_BRANCH ? repository : branch;
      projectName = owner+"-"+projectName;
      if (ProjectController.existProjectName(projectName) == true) {
        CommonController.showError("Already this project name["+projectName+"] exists.");        
        return;
      }
      Logger.on();
      promise = ProjectController.cloneProject(token, user, owner, repository, branch, projectName);
      parentOwner = owner;
      parentRepository = repository;
      parentBranch = branch;
      childOwner = user;
      childRepository = projectName;
      childBranch = MASTER_BRANCH;
      repository = projectName;
      branch = MASTER_BRANCH;
    }
    promise.then(function(){
      var avatar = $("#dashboard img").attr("src");
      var tags = ProjectController.getTagString();
      var image = $("#thumbnail");
      var thumbnailAspect = image.width() / image.height();
      var thumbnailSrc = image.attr("src");
      return CommonController.newLocalRepository(user, repository, branch, tags, avatar, thumbnailSrc, thumbnailAspect);
    })
    .then(function() {
      if (parentOwner) {
        return CommonController.newLocalFork(parentOwner, parentRepository, parentBranch, childOwner, childRepository, childBranch);
      }
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

  cloneProject: function(token, user, owner, repository, branch, projectName) {
    var deferred = new $.Deferred();
    var originalTree;

    CommonController.newRepository(token, projectName)
    .then(function(result) {
      return CommonController.watch(user, projectName);
    })
    .then(function(result) {
      return CommonController.getSHATree(owner, repository, branch);
    })
    .then(function(result) {
      originalTree = result.tree;
      return CommonController.getSHATree(user, projectName, MASTER_BRANCH);
    })
    .then(function(result) {
      var promiseList = [];
      var tree = result.tree;
      var pathmap = {};
      for (var i = 0, n = originalTree.length; i < n; i++) {
        var element = originalTree[i];
        if (element.type == "tree") {
          continue;
        }
        pathmap[element.url] = element.path;
        var promise = 
        CommonController.getGithubJSON(element.url)
        .then(function(response) {
          var contents = response.content.replace(/\n/g, "");
          var url = response.url;
          var path = pathmap[url];
          return CommonController.commit(token, user, projectName, MASTER_BRANCH, path, contents, "", tree);
        });
        promiseList.push(promise);
      }
      return CommonController.when.apply($, promiseList);
    })
    .fail(function(error) {
      deferred.reject(error);
    })
    .done(function() {
      deferred.resolve();
    });
    return deferred.promise();
  },

  deleteProject: function(token, user, owner, repository, branch) {
    if (!window.confirm("Are you sure to remove this project?")) {
      return;
    }

    var promise4github = null;
    var promise4local = null;
    if (branch == MASTER_BRANCH) {
      for (var i = 0, n = ProjectController.myProjectList.length; i < n; i++) {
        var myProject = ProjectController.myProjectList[i];
        if (myProject.name == repository && myProject.branch != MASTER_BRANCH) {
          CommonController.showError("Because this project has some branches, so could not delete it.");
          return;
        }
      }
      promise4github = CommonController.deleteRepository(token, user, repository);
      promise4local = CommonController.deleteLocalRepository(user, repository);
    } else {
      promise4github = CommonController.deleteBranch(token, user, repository, branch);
      promise4local = CommonController.deleteLocalBranch(user, repository, branch);
    }
    Logger.on();
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
      CommonController.showError("Please input the project name");
      return;
    }
    if (projectName.indexOf("duplicate-of-") == 0) {
      CommonController.showError("Project name must not start with 'duplicate-of-'");
      return;
    }
    for (i in projectName){
      var c =projectName.charCodeAt(i);
      if(c <45 || 45 < c && c < 48 || 57 < c && c < 65|| 90 < c && c < 97 || 122 <c){
        alert("Project name can use only letters (A-Z, a-z), numbers (0-9),hyphen(-)");
        return;
      }
    }

    var avatar = $("#dashboard img").attr("src");
    var tags = ProjectController.getTagString();
    var promise = null;
    var isURLChanged = false;
    var shaTree = null;
    var thumbnail = $("#thumbnail");
    var thumbnailAspect = thumbnail.width()/thumbnail.height();
    var thumbnailSrc = thumbnail.attr("src");
    if (repository == CREATE_PROJECT_COMMAND) {
      if (ProjectController.existProjectName(projectName) == true) {
        CommonController.showError("Already this project name["+projectName+"] exists.");        
        return;
      }
      Logger.on();

      promise = ProjectController.newRepository(token, user, projectName);
      repository = projectName;
      branch = MASTER_BRANCH;
      isURLChanged = true;
    } else {
      if (branch == MASTER_BRANCH && projectName != repository) {
        if (ProjectController.existProjectName(projectName) == true) {
          CommonController.showError("Already this project name["+projectName+"] exists.");        
          return;
        }
        Logger.on();

        promise = ProjectController.renameRepository(token, user, projectName, repository);
        repository = projectName;
        isURLChanged = true;
      } else if (branch != MASTER_BRANCH && projectName != branch) {
        if (ProjectController.existProjectName(projectName) == true) {
          CommonController.showError("Already this project name["+projectName+"] exists.");        
          return;
        }
        Logger.on();

        promise = ProjectController.renameBranch(token, user, repository, projectName, branch);
        branch = projectName;
        isURLChanged = true;
      } else {
        promise = CommonController.emptyPromise();
        Logger.on();
      }
    }
    promise.then(function() {
      return CommonController.getSHATree(user, repository, branch);
    })
    .then(function(result) {
      shaTree = result.tree;
      if(ProjectController.readmeSHA != null){
        for(i in shaTree){
          if(shaTree[i].path == "README.md"){
            shaTree[i].sha = ProjectController.readmeSHA;
            break;
          }
        }
      }
      if(ProjectController.thumbnailSHA != null){
        for(i in shaTree){
          if(shaTree[i].path == "gitfab/thumbnail.jpg"){
            shaTree[i].sha = ProjectController.thumbnailSHA;
            break;
          }
        }
      }
      return ProjectController.commitElements(token, user, repository, branch, tags, shaTree);
    })
    .then(function(result) {
      var images = $(".content img");
      var uploadedImages = ProjectEditor.uploaded_images;
      for (var i = uploadedImages.length-1, m = images.length; i >= 0; i--) {
        for (var j = 0; j < m; j++) {
          var uploadedImage = uploadedImages[i];
          var image = images[j];
          var filename = image.getAttribute("filename");
          if (filename == uploadedImage.name) {
            thumbnailAspect = image.naturalWidth/image.naturalHeight;
            thumbnailSrc = CommonController.getThumbnailURL(user, repository, branch);
            var url = image.getAttribute("fileurl");
            return ProjectController.commitThumbnail(token, user, repository, branch, url, shaTree);
          }
        }
      }
      if (images.length == 0) {
        thumbnailAspect = 0;
        thumbnailSrc = "";
      } else {
        var image = images[0];
        thumbnailAspect = image.naturalWidth/image.naturalHeight;
        thumbnailSrc = CommonController.getThumbnailURL(user, repository, branch);
        return ProjectController.commitThumbnail(token, user, repository, branch, image.getAttribute("src"), shaTree);
      }
    })
    .then(function() {
      return ProjectController.updateRepositoryMeta(user, repository, branch, tags, avatar, thumbnailSrc, thumbnailAspect);
    })
    .fail(function(error) {
      CommonController.showError(error);
      Logger.error(error);
      console.log(error);
    })
    .done(function() {
      if (isURLChanged == true) {
        var url = CommonController.getProjectPageURL(user, repository, branch);
        ProjectController.href(url);
      } else {
        Logger.off();
        $("#thumbnail").attr("src", thumbnailSrc+"?"+(new Date()).getTime());
      }
    });
  },

  existProjectName: function(name) {
    for (var i = 0, n = ProjectController.myProjectList.length; i < n; i++) {
      var project = ProjectController.myProjectList[i];
      var projectName = project.branch == MASTER_BRANCH ? project.name : project.branch;
      if (name == projectName) {
        return true;
      }
    }
    return false;
  },

  updateRepositoryMeta: function(user, repository, branch, tags, avatar, thumbnail, aspect) {
    return CommonController.updateRepositoryMetadata(user, repository, branch, tags, avatar, thumbnail, aspect);
  },

  newRepository: function(token, user, repository) {
    var promise4github = CommonController.newRepository(token, repository);
    promise4github = promise4github.then(function() {
      return CommonController.watch(user, repository);
    });
    var promise4local = CommonController.newLocalRepository(user, repository, MASTER_BRANCH, "", "", "", 0);
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
    promiseList[0] = CommonController.commit(token, user, repository, branch, MAIN_DOCUMENT, base64.encodeStringAsUTF8(elements.document), "", shatree)
            .then(function(res){
                    ProjectController.readmeSHA = res.content.sha;
            });
    if (elements.customCSS) {
      promiseList.push( CommonController.commit(token, user, repository, branch, CUSTOM_CSS, base64.encodeStringAsUTF8(elements.customCSS), "", shatree) );
    }
    var attachments = elements.attachments;
    for (var attachmentName in attachments) {
      var attachment = attachments[attachmentName];
      var path = MATERIALS_DIR + "/" + attachment.escapedName;
      var promise = CommonController.commit(token, user, repository, branch, path, attachment.contents, "", shatree);
      promiseList.push(promise);
    }
    return CommonController.when.apply($, promiseList);
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
        file.escapedName = file.name.replace(/\s/g, "-");
        filemap[key] = file;
        var fileURL = CommonController.getFileURL(user, repository, branch, MATERIALS_DIR + "/" + file.escapedName);
        text = text.replace(key, fileURL);
        var img = $("img[src='" + key + "']");
        img.attr("fileurl", fileURL);
        img.attr("filename", file.name);
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

  commitThumbnail: function(token, user, repository, branch, url, shaTree) {
    var promise = CommonController.getImage(url);
    return promise.then(function(image) {
      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      var width = 400;
      var height = width * image.naturalHeight / image.naturalWidth;
      canvas.setAttribute("width", width);
      canvas.setAttribute("height", height);
      context.drawImage(image, 0, 0, width, height);
      var data = canvas.toDataURL("image/jpeg");
      var index = data.indexOf(",");
      data = data.substring(index + 1);
      return CommonController.commit(token, user, repository, branch, THUMBNAIL, data, "", shaTree)
        .then(function(res){
          ProjectController.thumbnailSHA  = res.content.sha;
        });
    });
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
    var image = $("#thumbnail");
    if (thumbnail) {
      meta.css("background-image", "url(" + image.attr("src") + ")");
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
