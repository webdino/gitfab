/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var GITFAB_DIR = "gitfab";
var MATERIALS_DIR = GITFAB_DIR + "/resources";
var MAIN_DOCUMENT = "README.md";
var CUSTOM_CSS = GITFAB_DIR + "/custom.css";
var GITHUB_RAW = "https://raw.github.com/";
var GITHUB_API = "https://api.github.com/";
var MASTER_BRANCH = "master";
var CREATE_PROJECT_COMMAND = ":create";

var CommonController = {

  when: $.when,

  emptyPromise: function() {
    var deffered = new $.Deferred();
    deffered.resolve();
    return deffered.promise();
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
  createProjectUI: function (ownerS, repositoryS, avatarS, thumbnailS, branchS, tagsA) {
    var project = $(document.createElement("div"));
    project.addClass("project");

    var projectLink = $(document.createElement("a"));
    projectLink.attr("href", CommonController.getProjectPageURL(ownerS, repositoryS, branchS));
    projectLink.addClass("projectLink");

    if (thumbnailS && thumbnailS != "undefined") {
      var thumbnail = $(document.createElement("img"));
      thumbnail.attr("src", thumbnailS);
      thumbnail.addClass("thumbnail");
      projectLink.append(thumbnail);
    }

    var projectName = $(document.createElement("div"));
    projectName.addClass("projectName");
    if (branchS == "master") {
      projectName.text(repositoryS);
    } else {
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
      alert(error);
      return true;
    }
    return false;
  },

  getThumbnailURL: function(owner, repository, branch) {
    return GITHUB_RAW + owner + "/" + repository + "/" + branch + "/gitfab/thumbnail.png";
  },

  getFileURL: function (owner, repository, branch, path) {
    return GITHUB_RAW + owner + "/" + repository + "/" + branch + "/" + path;
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
    $("#login").html("");
    $("#login").append(userImg);
    $("#login").append(userName);
    var createurl = CommonController.getProjectPageURL(username, CREATE_PROJECT_COMMAND);
    $("#create").attr("href", createurl);
    $("#create").show();
    var dashboardurl = CommonController.getDashboardURL(username);
    $("#dashboard").attr("href", dashboardurl);
    $("#dashboard").show();
    $("#toolbar").show();
  },

  newLocalRepository: function (owner, repository, branch) {
    var url = "/api/newProject.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch;
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

  getLocalJSON: function (url) {
    var deferred = new $.Deferred();
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

  getSHATree: function (owner, repository, branch) {
    var url = CommonController.getGithubRepositoryPath(owner, repository);
    url += "/git/trees/master?recursive=2&callback=?";
    return CommonController.getGithubJSON(url);
  },

  getSHA: function (owner, repository, branch) {
    var url = CommonController.getGithubBranchPath(owner, repository, branch);
    return CommonController.getGithubJSON(url);
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
    promise.then(function(result) {
      var sha = result.object.sha;
      var parameters = { sha: sha, ref: "refs/heads/" + newBranch };
      var url = CommonController.getGithubRepositoryPath(owner, repository);
      url += "/git/refs";
      return CommonController.getGithubJSON4Token(url, "POST", token, parameters);
    });
    return promise;
  },

  deleteBranch: function(token, owner, repository, branch) {
    var url = CommonController.getGithubBranchPath(owner, repository, branch);
    return CommonController.getGithubJSON4Token(url, "DELETE", token, {});
  },

  renameBranch: function (token, owner, repository, newBranch, previousBranch) {
    var promise = CommonController.getSHA(owner, repository, previousBranch);
    promise.then(function(result) {
      var sha = result.object.sha;
      var parameters = { sha: sha, force: "true" };
      var url = CommonController.getGithubBranchPath(owner, repository, newBranch);
      return CommonController.getGithubJSON4Token(url, "PATCH", token, parameters);
    });
    return promise;
  },

  getGithubJSON: function(url) {
    return CommonController.ajaxPromise({url: url, type:"GET", dataType:"json"});
  },

  getGithubJSON4Token: function (url, method, token, parameters, callback) {
    return CommonController.ajaxPromise({url: url, type:method, dataType:"json", data: JSON.stringify(parameters), headers: { "Authorization": " bearer " + token}});
  },

  readFile: function(file) {
    Logger.log("read: "+file.name);

    var deferred = new $.Deferred();

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
    Logger.request(parameter.url);

    var deferred = new $.Deferred();

    parameter.success = function(result) {
      Logger.response(parameter.url);
      deferred.resolve(result);
    };

    parameter.error = function(xhr, textStatus, errorThrown) {
      Logger.error(textStatus);
      deferred.reject(textStatus);
    };

    parameter.xhr = function() {
      var XHR = $.ajaxSettings.xhr();
      var progressListener = function(e) {
        Logger.progress(e.loaded, e.total);
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