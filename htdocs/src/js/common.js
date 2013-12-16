/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var GITFAB_DIR = "gitfab";
var MATERIALS_DIR = GITFAB_DIR + "/resources";
var MAIN_DOCUMENT = "README.md";
var CUSTOME_CSS_ID = "custome-css";
var CUSTOM_CSS = GITFAB_DIR + "/custom.css";
var THUMBNAIL = GITFAB_DIR + "/thumbnail.jpg";
var GITHUB_RAW = "https://raw.github.com/";
var GITHUB_API = "https://api.github.com/";
var MASTER_BRANCH = "master";
var CREATE_PROJECT_COMMAND = ":create";

var CommonController = {

  when: $.when,

  getDeferred: function() {
    return new $.Deferred();
  },

  emptyPromise: function() {
    var deferred = CommonController.getDeferred();
    deferred.resolve();
    return deferred.promise();
  },

  timerPromise: function(time) {
    var deferred = CommonController.getDeferred();
    setTimeout(function() {
      deferred.resolve();
    }, time);
    return deferred.promise();
  },
  
  getParametersFromQuery: function () {
    var parameters = {};
    var url = window.location.href;
    var indexOfQ = url.indexOf("?");
    if (indexOfQ >= 0) {
      var queryString = url.substring(indexOfQ + 1);
      var params = queryString.split("&");
      for (var i = 0, n = params.length; i < n; i++) {
        var param = params[i];
        var keyvalue = param.split("=");
        parameters[keyvalue[0]] = keyvalue[1];
      }
      parameters["QueryString"] = queryString;
    }
    return parameters;
  },

  getOwner: function() {
    return OWNER;
  },

  getRepository: function() {
    return REPOSITORY;
  },

  getBranch: function() {
    return BRANCH == "undefined" ? "master" : BRANCH;
  },

  getUser: function() {
    return USER;
  },

  getToken: function() {
    return TOKEN;
  },

  getAvatarURL: function() {
    return AVATAR_URL;
  },

  //in projectList -----------------
  getProjectList: function (tag, owner) {
    var url = "/api/projectList.php";
    if (tag) {
      url += "?tag=" + tag;
    } else if (owner) {
      url += "?owner=" + owner;
    }
    return CommonController.getLocalJSON(url);
  },
    
  getProjectListWithQ: function (tag, owner,start,quantity) {
    var url = "/api/projectList.php?start=" + start + "&q=" + quantity;
    if (tag) {
      url += "&tag=" + tag;
    } else if (owner) {
      url += "&owner=" + owner;
    }
    return CommonController.getLocalJSON(url);
  },

  getOwnersProjectList: function(owner) {
    var url = "/api/ownersProjectList.php?owner="+owner;
    return CommonController.getLocalJSON(url);
  },

  getTagList: function (owner) {
    var url = "/api/tagList.php";
    if (owner) {
      url += "?owner=" + owner;
    }
    return CommonController.getLocalJSON(url);
  },

  authorize: function (code) {
    var url = "/api/authorize.php?code=" + code;
    return CommonController.getLocalJSON(url);
  },

  //----------------------------------
  createProjectUI: function (ownerS, repositoryS, avatarS, thumbnailS, aspectF, branchS, tagsA) {
    var project = $(document.createElement("div"));
    project.addClass("project");

    var projectLink = $(document.createElement("a"));
    projectLink.attr("href", CommonController.getProjectPageURL(ownerS, repositoryS, branchS));
    projectLink.addClass("projectLink");

    if (aspectF != 0) {
      var thumbnail = $(document.createElement("div"));
      thumbnail.attr("style", "background-image:url('"+thumbnailS+"'); background-size:cover; background-position: center center;");
      thumbnail.addClass("thumbnail");
      projectLink.append(thumbnail);
    }
    else {
     var thumbnail2 = $(document.createElement("div"));
      thumbnail2.text("no Image");
      thumbnail2.addClass("thumbnail");
      thumbnail2.addClass("no-image");
      projectLink.append(thumbnail2); 
    }

    var projectName = $(document.createElement("div"));
    projectName.addClass("projectName");
    if (branchS == "master") {

      if(repositoryS.length > 20){
        // repositoryS = repositoryS.substring(0,20)+"…";
        repositoryS = repositoryS.truncateTailInWidth(240,'ruler');
      }

      projectName.text(repositoryS);
    } else {
      // change title length
      if(branchS.length > 20){
        // branchS = branchS.substring(0,20)+"…";
        branchS = branchS.truncateTailInWidth(240,'ruler');
      }
      projectName.text(branchS);
    }
    projectLink.append(projectName);

    var ownerLink = $(document.createElement("a"));
    ownerLink.attr("href", CommonController.getDashboardURL(ownerS));
    ownerLink.addClass("ownerLink");

    var owner = $(document.createElement("div"));
    owner.addClass("owner");
    owner.css("background-image", "url(" + avatarS + ")");
    owner.text(ownerS);
    ownerLink.append(owner);

    project.append(projectLink);
    project.append(ownerLink);

    if (tagsA && tagsA.length != 0) {
      var tags = $(document.createElement("div"));
      tags.addClass("tags");
      for (var i = 0, n = tagsA.length; i < n; i++) {
        var tagS = tagsA[i];
        var a = $(document.createElement("a"));
        a.text(tagS);
        var url = CommonController.getTagURL(tagS);
        a.attr("href", url);
        tags.append(a);
      }
      project.append(tags);
    }

    return project;
  },

  showError: function (error) {
    if (error) {
      if (error.errors && error.errors.length != 0) {
        var e = error.errors[0];
        alert(error.message+"\ncode:"+e.code+"\nfield:"+e.field+"\nresource:"+e.resource+"\nmessage:"+e.message);
      } else if (error.message) {
        alert(error.message);
      } else {
        alert(error);
      }
      return true;
    }
    return false;
  },

  getThumbnailURL: function(owner, repository, branch) {
    return GITHUB_RAW + owner + "/" + repository + "/" + branch + "/" + THUMBNAIL;
  },

  getFileURL: function (owner, repository, branch, path) {
    return GITHUB_RAW + owner + "/" + repository + "/" + branch + "/" + path;
  },

  getHistoricalFileURL: function(owner, repository, sha, path) {
    return GITHUB_RAW + owner + "/" + repository + "/" + sha + "/" + path;
  },

  getProjectPageURL: function (owner, repository, branch) {
    return "/" + owner + "/" + repository + "/" + (branch ? branch : "-") + "/";
  },

  getDashboardURL: function (owner) {
    return "/" + owner + "/";
  },

  getTagURL: function (tag) {
    return "/?tag=" + tag;
  },
  
  updateUI: function (username, avatarURL) {
    var userImg = $(document.createElement("img"));
    userImg.attr("src", avatarURL);
    var userName = $(document.createElement("span"));
    userName.text(username);
    $("#login").hide();
    var createurl = CommonController.getProjectPageURL(username, CREATE_PROJECT_COMMAND);
    $("#create").attr("href", createurl);
    var dashboardurl = CommonController.getDashboardURL(username);
    $("#dashboard").attr("href", dashboardurl);
    $("#dashboard").html("");
    $("#dashboard").append(userImg);
    $("#dashboard").append(userName);

    $("#dashboard").show();
    $("#toolbar").show();
    $("#logout").show();
    $("#create").show();
  },

  newLocalRepository: function(owner, repository, branch, tags, avatar, thumbnail, thumbnailAspect) {
    var url = "/api/newProject.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch + "&tags=" + tags + "&avatar=" + avatar + "&thumbnail=" + thumbnail +"&thumbnailAspect="+thumbnailAspect;
    return CommonController.getLocalJSON(url);
  },

  renameLocalRepository: function(owner, newRepository, previousRepository) {
    var url = "/api/renameMasterProject.php?owner=" + owner + "&newRepository=" + newRepository + "&previousRepository=" + previousRepository;
    return CommonController.getLocalJSON(url);
  },

  deleteLocalRepository: function(owner, repository) {
    return CommonController.deleteLocalBranch(owner, repository, MASTER_BRANCH);
  },

  renameLocalBranch: function(owner, repository, newBranch, previousBranch) {
    var url = "/api/renameBranchProject.php?owner=" + owner + "&repository=" + repository + "&newBranch=" + newBranch + "&previousBranch=" + previousBranch;
    return CommonController.getLocalJSON(url);
  },

  deleteLocalBranch: function(owner, repository, branch) {
    var url = "/api/deleteProject.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch;
    return CommonController.getLocalJSON(url);
  },

  updateRepositoryMetadata: function (owner, repository, branch, tags, avatar, thumbnail, thumbnailAspect) {
    var url = "/api/updateMetadata.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch + "&tags=" + tags + "&avatar=" + avatar + "&thumbnail=" + thumbnail +"&thumbnailAspect="+thumbnailAspect;
    return CommonController.getLocalJSON(url);
  },
  getLocalBranches: function(owner, repository){
    var url = "/api/getBranchProjects.php?owner=" + owner + "&repository=" + repository;
    return CommonController.getLocalJSON(url);
  },

  newLocalFork: function (parentOwner, parentRepository, parentBranch, childOwner, childRepository, childBranch) {
    var url = "/api/fork.php?parentOwner="+parentOwner+"&parentRepository="+parentRepository+"&parentBranch="+parentBranch+"&childOwner="+childOwner+"&childRepository="+childRepository+"&childBranch="+childBranch;
    return CommonController.getLocalJSON(url);
  },

  getLocalJSON: function (url) {
    var deferred = CommonController.getDeferred();
    var promise = CommonController.ajaxPromise({url: url, type:"GET", dataType:"json"});
    promise.then(function(result) {
      if (null == result) {
        deferred.resolve({});
      } else if (result.error) {
        deferred.reject(result.error);
      } else {
        deferred.resolve(result);
      }
    });
    return deferred.promise();
  },

  //github ----------------------------------
  getGithubRepositoryPath: function(owner, repository) {
    return  GITHUB_API+"repos/" + owner + "/" + repository;
  },

  getGithubBranchPath: function(owner, repository, branch) {
    return  GITHUB_API+"repos/" + owner + "/" + repository + "/git/refs/heads/" + branch;
  },

  getAdditionalInformation: function (owner, repository, branch) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    return CommonController.getGithubJSON(url);
  },

  getCollaborators: function (owner, repository) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/collaborators";
    return CommonController.getGithubJSON(url);
  },

  getSHATree: function (owner, repository, branch) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/git/trees/"+branch+"?recursive=2";
    return CommonController.getGithubJSON(url);
  },

  getSHA: function (owner, repository, branch) {
    var url = CommonController.getGithubBranchPath(owner, repository, branch);
    return CommonController.getGithubJSON(url);
  },
  
  getAllReference: function (owner, repository) {
    var url = GITHUB_API + "repos/" + owner + "/" + repository + "/git/refs";
    return CommonController.getGithubJSON(url);
  },
 
  findUser: function(name) {
    var url = GITHUB_API + "users/"+name;
    return CommonController.getGithubJSON(url);
  },

  addCollaborator: function(token, owner, repository, name) {    
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/collaborators/"+name;
    return CommonController.getGithubJSON4Token(url, "PUT", token, {});
  },

  removeCollaborator: function(token, owner, repository, name) {    
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/collaborators/"+name;
    return CommonController.getGithubJSON4Token(url, "DELETE", token, {});
  },

  commit: function (token, owner, repository, branch, path, content, message, tree) {
    var parameters = { path: path, message: message, content: content, branch: branch, };
    for (var i = 0, n = tree.length; i < n; i++) {
      var node = tree[i];
      if (path == node.path) {
        parameters.sha = node.sha;
        break;
      }
    }
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/contents/" + path;
    return CommonController.getGithubJSON4Token(url, "PUT", token, parameters);
  },

  remove: function (token, owner, repository, branch, path, message, sha) {
    var parameters = { path: path, message: message, branch: branch, sha:sha};
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/contents/" + path;
    return CommonController.getGithubJSON4Token(url, "DELETE", token, parameters);
  },

  watch: function (owner, repository) {
    var url = "/api/watch.php?owner=" + owner + "&repository=" + repository;
    return CommonController.getLocalJSON(url);
  },

  fork: function (token, owner, repository) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/forks";
    return CommonController.getGithubJSON4Token(url, "POST", token, {});
  },

  newRepository: function (token, name) {
    var url = GITHUB_API+"user/repos";
    var parameters = { name: name, auto_init: true };
    return CommonController.getGithubJSON4Token(url, "POST", token, parameters);
  },

  deleteRepository: function(token, owner, repository) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    return CommonController.getGithubJSON4Token(url, "DELETE", token, {});
  },

  renameRepository: function (token, owner, newRepository, previousRepository) {
    var url = CommonController.getGithubRepositoryPath(owner, previousRepository);
    var parameters = { name: newRepository };
    return CommonController.getGithubJSON4Token(url, "PATCH", token, parameters);
  },

  newBranch: function (token, owner, repository, branch, newBranch) {
    var promise = CommonController.getSHA(owner, repository, branch);
    return promise.then(function(result) {
      var sha = result.object.sha;
      var parameters = { sha: sha, ref: "refs/heads/" + newBranch };
      var url = CommonController.getGithubRepositoryPath(owner, repository);
      url += "/git/refs";
      return CommonController.getGithubJSON4Token(url, "POST", token, parameters);
    });
  },

  deleteBranch: function(token, owner, repository, branch) {
    var url = CommonController.getGithubBranchPath(owner, repository, branch);
    return CommonController.getGithubJSON4Token(url, "DELETE", token, {});
  },

  renameBranch: function (token, owner, repository, newBranch, previousBranch) {
    return CommonController.newBranch(token, owner, repository, previousBranch, newBranch)
      .then(function(){
        return CommonController.deleteBranch(token,owner, repository, previousBranch);
      });
  },

  getCommitHistories: function (owner, repository, branch) {
    var promise = CommonController.getSHA(owner, repository, branch);
    return promise.then(function(result) {
      var sha = result.object.sha;
      var url = CommonController.getGithubRepositoryPath(owner, repository);
      url += "/commits?path=README.md&sha="+sha;
      return CommonController.getGithubJSON(url);
    });
  },

  getCustomCSS: function (owner, repository) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/contents/" + CUSTOM_CSS;
    return CommonController.getGithubJSON(url);
  },

  getCSSTemplate: function () {
    var url = "/css/customizeTemplate.css";
    return CommonController.ajaxPromise({url: url, type:"GET"});
  },

  getImage: function (url) {
    url = encodeURIComponent(url);
    var proxyURL = "/api/imageProxy.php?url="+url;
    Logger.log("read: "+proxyURL);

    var deferred = CommonController.getDeferred();

    var image = new Image();
    image.src = proxyURL;
    image.onload = function () {
      deferred.resolve(image);
    };
    image.onerror = function (e) {
      deferred.reject(e);
    };
    return deferred.promise();
  },

  getGithubJSON: function(url) {
    var headers = {};
    if (CommonController.getToken()) {
      headers = { "Authorization": " bearer " + CommonController.getToken()};
    }

    var deferred = CommonController.getDeferred();
    var promise = CommonController.ajaxPromise({url: url, type:"GET", dataType:"json", headers: headers});
    promise.then(function(result) {
      deferred.resolve(result);
    })
    .fail(function(result) {
      var json = JSON.parse(result.responseText);
      json.errorCode = result.status;
      deferred.reject(json);
    });
    return deferred.promise();
  },

  getGithubJSON4Token: function (url, method, token, parameters, callback) {
    var deferred = CommonController.getDeferred();
    var promise = CommonController.ajaxPromise({url: url, type:method, dataType:"json", data: JSON.stringify(parameters), headers: { "Authorization": " bearer " + token}});
    promise.then(function(result) {
      deferred.resolve(result);
    })
    .fail(function(result) {
      var json = JSON.parse(result.responseText);
      json.errorCode = result.status;
      deferred.reject(json);
    });
    return deferred.promise();
  },

  readFile: function(file) {
    Logger.log("read: "+file.name);

    var deferred = CommonController.getDeferred();

    var reader = new FileReader();
    reader.onload = function (e) {
      Logger.log("loaded: "+file.name);
      var content = reader.result;
      var index = content.indexOf(",");
      content = content.substring(index + 1);
      deferred.resolve(content);
    };
    reader.onerror = function (e) {
      deferred.reject(e);
    };
    reader.readAsDataURL(file);

    return deferred.promise();
  },

  ajaxPromise: function(parameter) {
    var name = parameter.url.substring(parameter.url.lastIndexOf("/"));

    Logger.request(parameter.url);

    var deferred = CommonController.getDeferred();

    parameter.cache = false;

    parameter.success = function(result) {
      Logger.response(parameter.url);
      deferred.resolve(result);
    };

    parameter.error = function(xhr, textStatus, errorThrown) {
      deferred.reject(xhr);
      console.log("ERROR:"+parameter.url);
      console.log(xhr);
    };

    parameter.xhr = function() {
      var XHR = $.ajaxSettings.xhr();
      var progressListener = function(e) {
        Logger.progress(name, name, e.loaded, e.total);
        deferred.notify(e.loaded/e.total);
      }
      XHR.addEventListener('progress', progressListener);
      if(XHR.upload) {
        XHR.upload.addEventListener('progress', progressListener);
      }
      return XHR;
    };

    $.ajax(parameter);
    return deferred.promise();
  }
}



// String.prototype.getExtent = function(ruler) {
//   var e = $(ruler);
//   if(e.attr('visibility') == 'hidden'){ e.attr('visibility','visible');}
//   // var c;
//   // while (e.children() ) e.empty();
//   // var text = e.append(document.createTextNode(this));
//   e.append(this);
//   var width = e.attr('offsetWidth');
//   e.empty();
//   e.attr('visibility','hidden');
//   return width;
// }


String.prototype.getExtent = function(ruler) {
  var e = document.getElementById(ruler);
  var c;
  while (c = e.lastChild) e.removeChild(c);
  var text = e.appendChild(document.createTextNode(this));
  var width = e.offsetWidth;
  e.removeChild(text);
  return width;
}

String.prototype.truncateTailInWidth = function(maxWidth, ruler) {
  if (this.length == 0) return '';
  if (this.getExtent(ruler) <= maxWidth) return this;
  for (var i=this.length-1; i>=1; --i) {
    var s = this.slice(0, i) + '...';
    if (s.getExtent(ruler) <= maxWidth) return s;
  }
  return '';
}

