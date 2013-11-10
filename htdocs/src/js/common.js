/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var GITFAB_DIR = "gitfab";
var MATERIALS = GITFAB_DIR + "/resources";
var MAIN_DOCUMENT = "README.md";
var CUSTOM_CSS = GITFAB_DIR + "/custom.css";

var CommonController = {

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

  setParameters: function (object) {
    if (OWNER) {
      object.owner = OWNER;
    }
    if (REPOSITORY) {
      object.repository = REPOSITORY;
    }
    if (BRANCH) {
      if (BRANCH == "undefined") object.branch = "master";
      else object.branch = BRANCH;
    }
    if (USER) {
      object.user = USER;
    }
    if (TOKEN) {
      object.token = TOKEN;
    }
    if (AVATAR_URL) {
      object.avatar_url = AVATAR_URL;
    }
  },

  updateUI: function (username, avatarURL) {
    var userImg = $(document.createElement("img"));
    userImg.attr("src", avatarURL);
    var userName = $(document.createElement("span"));
    userName.text(username);
    $("#login").html("");
    $("#login").append(userImg);
    $("#login").append(userName);
    var createurl = CommonController.getProjectPageURL(username, ":create");
    $("#create").attr("href", createurl);
    $("#create").show();
    var dashboardurl = CommonController.getDashboardURL(username);
    $("#dashboard").attr("href", dashboardurl);
    $("#dashboard").show();

    $("#toolbar").show();

  },

  showError: function (error) {
    if (error) {
        alert(error);
      return true;
    }
    return false;
  },

  authorize: function (code, callback) {
    var url = "/api/authorize.php?code=" + code;
    Logger.request(url);
    CommonController.getJSON(url, function (result, error) {
      Logger.response(url);
      if (error) {
        callback(null, error);
        return;
      }
      if (result.error) {
        callback(null, result.error);
      } else {
        callback(result);
      }
    });
  },

  getProjectList: function (callback) {
    var url = "https://api.github.com/users/gitfab/subscriptions?callback=?";
    CommonController.getGithubJSON(url, callback);
  },


  getProjectPageURL: function (owner, repository, branch) {
    return "/" + owner + "/" + repository + "/" + branch + "/";
  },

  getDashboardURL: function (owner) {
    return "/" + owner + "/";
  },

  getFileURL: function (user, repository, branch, path) {
    return "https://raw.github.com/" + user + "/" + repository + "/" + branch + "/" + path;
  },

  getGitfabDocument: function (owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/contents/" + MAIN_DOCUMENT + "?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getCustomCSS: function (owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/contents/" + CUSTOM_CSS + "?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getOwnerInformation: function (owner, callback) {
    var url = "https://api.github.com/users/" + owner + "?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getRepositoryInformation: function (owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getForksInformation: function (owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/forks?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getSHATree: function (user, repository, branch, callback) { //branch not impl yet
    var url = "https://api.github.com/repos/" + user + "/" + repository + "/git/trees/master?recursive=2&callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  getSHA: function (user, repository, branch, callback) {
    var url = "https://api.github.com/repos/" + user + "/" + repository + "/git/refs/heads/" + branch;
    CommonController.getJSON(url, callback);
  },
  commit: function (token, user, repository, branch, path, content, message, tree, callback) {
    var parameters = {
      path: path,
      message: message,
      content: content,
      branch: branch,
    };
    for (var i = 0, n = tree.length; i < n; i++) {
      var node = tree[i];
      if (path == node.path) {
        parameters.sha = node.sha;
        break;
      }
    }
    var url = "https://api.github.com/repos/" + user + "/" + repository + "/contents/" + path;
    CommonController.ajaxGithub(url, "PUT", token, parameters, callback);
  },

  fork: function (token, owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/forks";

    CommonController.ajaxGithub(url, "POST", token, {}, callback);
  },
  newBranch: function (token, user, name, branch, sha, callback) {
    var parameters = {
      ref: "refs/heads/" + branch,
      sha: sha
    };
    CommonController.ajaxGithub("https://api.github.com/repos/" + user + "/" + name + "/git/refs", "POST", token, parameters, callback);

  },
  getThumbnail: function (token, owner, repository, branch, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/contents/gitfab";
    var parameters = {
      ref: "heads/" + branch
    }
    CommonController.ajaxGithub(url, "GET", token, parameters, callback);
  },
  newRepository: function (token, name, callback) {
    var parameters = {
      name: name,
      auto_init: true
    };
    CommonController.ajaxGithub("https://api.github.com/user/repos", "POST", token, parameters, callback);
  },


  renameBranches: function (owner, name, oldname, branch) {
    var url = "/api/check.php?owner=" + owner + "&repository=" + oldname;
    CommonController.getJSON(url, function (result) {
      for (var i = 0; i < result.branches.length; i++) {
        var proj = result.branches[i];
        CommonController.renameDataBaseRepository(proj.owner, name, proj.name, proj.branch);
      }
        var url = CommonController.getProjectPageURL(owner,
          name,
          "master");
        Logger.log("reload: " + url);
        setTimeout(function () {
          window.location.href = url;
          Logger.off();
        }, 500);
    });
  },

  newDataBaseProject: function (owner, repository, branch) {
    var url = "/api/newProject.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch;
    CommonController.getJSON(url, function (res, err) {
      if (err) throw (err);
    });
  },

  renameDataBaseBranch: function (owner, repository, newBranch, oldBranch) {
    var url = "/api/renameBranch.php?owner=" + owner + "&repository=" + repository + "&newBranch=" + newBranch + "&oldBranch=" + oldBranch;
    CommonController.getJSON(url, function (res, err) {
      if (err) throw (err);
    });
  },
  renameDataBaseRepository: function (owner, newRepository, oldRepository, branch) {
    var url = "/api/renameRepository.php?owner=" + owner + "&newRepository=" + newRepository + "&oldRepository=" + oldRepository + "&branch=" + branch;
    CommonController.getJSON(url, function (res, err) {
      if (err) throw (err);
    });
  },
  deleteDataBaseProject: function (owner, repository, branch) {
    var url = "/api/deleteProject.php?owner=" + owner + "&repository=" + repository + "&branch=" + branch;
    CommonController.getJSON(url, function (res, err) {
      if (err) throw (err);
    });
  },

  newGithubBranch: function (token, user, repository, branch, sha) {
    var parameters = {
      ref: "refs/heads/" + branch,
      sha: sha
    };
    CommonController.ajaxGithub("https://api.github.com/repos/" + user + "/" + repository + "/git/refs",
      "POST",
      token,
      parameters,
      function (res, err) {
        if (err) throw (err);
      });

  },

  newGithubRepository: function (token, repository) {
    var parameters = {
      name: repository,
      auto_init: true
    };
    CommonController.ajaxGithub("https://api.github.com/user/repos",
      "POST",
      token,
      parameters,
      function (res, err) {
        if (err) {
          throw (err);
        }
      });
  },
  generateRepositoryName: function (owner, repository, callback) { //generating unique name
    var name = repository;
    var j = 2;
    CommonController.getGithubRepositories(owner, function (res) {
      for (var i = 0; i < res.length; i++) {
        if (res[i].name == repository) {
          name = repository + "-" + j;
          j++;
        }
      }
      callback(name);
    });
  },

  generateBranchName: function (owner, repository, branch, callback) { //generating unique name
    var name = branch;
    var j = 2;
    CommonController.getAllReferences(owner, repository, function (res) {
      for (var i = 0; i < res.length; i++) {
        if (res[i].ref == "refs/heads/" + name) {
          name = branch + "-" + j;
          j++;
        }
      }
      callback(name);
    });
  },

  getGithubRepositories: function (owner, callback) {
    CommonController.t = "";
    CommonController.getJSON("https://api.github.com/users/" + owner + "/repos",
      function (res, err) {
        if (err) {
          throw (err);
        }
        callback(res);
      });
  },

  renameBranch: function (token, user, name, oldBranch) {
    var url = "https://api.github.com/repos/" + user + "/" + name + "/git/refs/heads/" + branch;
    var sha = CommonController.getSHA(user, name, oldBranch, function (res,err) {
      if(err)throw(err);
    });
    var parameters = {
      sha: sha,
      force: "true"
    };
    CommonController.ajaxGithub(url, "PATCH", token, parameters, function (res,err) {
      if(err)throw(err);
    });
  },

  renameRepository: function (token, user, name, old, callback) {
    var url = "https://api.github.com/repos/" + user + "/" + old;
    var parameters = {
      name: name,
    };
    CommonController.ajaxGithub(url, "PATCH", token, parameters, function (res, err) {
      if (err) {
        throw (err)
      }
      callback(res);
    });
  },

  deleteRepository: function (token, user, repository, branch, callback) {
    CommonController.deleteDataBaseProject(user, repository, branch);
    CommonController.getForksInformation(user, repository, function (res) {
      if (res.length == 0){
        var url = "/api/check.php?owner=" + user + "&repository=" + repository;
        CommonController.getJSON(url, function (result) {
          if(result.branches.length < 2) {
            var url = "https://api.github.com/repos/" + user + "/" + repository;
            CommonController.ajaxGithub(url, "DELETE", token, {}, function (result, error) {
              if (error) {
                callback(null, error);
                return;
              } 
              callback(null, null);
            });
          } else {
            callback(null, null);
          }
        });
      } else {
        callback(null,null);
      }
    });
  },

  getAllReferences: function (owner, repository, callback) {
    var url = "https://api.github.com/repos/" + owner + "/" + repository + "/git/refs";
    CommonController.getJSON(url, function (result, error) {
      if (error) {
        callback(null, error);
        return;
      } else {
        callback(result);
      }
    });
  },

  ajaxGithub: function (url, method, token, parameters, callback) {
    Logger.request(url);
    $.ajax({
      type: method,
      url: url,
      headers: {
        "Authorization": " bearer " + token
      },
      data: JSON.stringify(parameters),
      dataType: "json",
      success: function (data) {
        Logger.response(url);
        callback(data);
      },
      error: function (request, textStatus, errorThrown) {
        Logger.error(url);
        if (textStatus) {
          Logger.error(textStatus);
        }
        if (errorThrown) {
          Logger.error(errorThrown);
        }
        var response = JSON.parse(request.responseText);
        if (response.errors && response.errors[0] && response.errors[0].message) {
          callback(null, response.errors[0].message);
        } else {
          callback(null, textStatus);
        }
      }
    });
  },

  getGithubJSON: function (url, callback) {
    Logger.request(url);
    CommonController.getJSON(url, function (result, error) {
      if (error) {
        callback(null, error);
        return;
      }
      if (result.data.message) {
        callback(null, result.data.message);
      } else {
        callback(result.data);
      }
    });
  },

  getProjectListFromDatabase: function (tag, owner, callback) {
    var url = "/api/projectList.php";
    if (tag) {
      url += "?tag=" + tag;
    } else if (owner) {
      url += "?owner=" + owner;
    }
    CommonController.getLocalJSON(url, callback);
  },

  watch: function (owner, repository, callback) {
    var url = "/api/watch.php?owner=" + owner + "&repository=" + repository;
    CommonController.getLocalJSON(url, callback);
  },

  getMataData: function (owner, repository, callback) {
    var url = "/api/metadata.php?owner=" + owner + "&repository=" + repository;
    CommonController.getLocalJSON(url, callback);
  },


  updateMetadata: function (owner, repository, oldrepository, branch, tags, avatar, thumbnail, thumbnailAspect, callback) {
    var url = "/api/updateMetadata.php?owner=" + owner + "&repository=" + repository + "&oldrepository=" + oldrepository + "&branch=" + branch + "&tags=" + tags + "&avatar=" + avatar + "&thumbnail=" + thumbnail +"&thumbnailAspect="+thumbnailAspect;
    CommonController.getLocalJSON(url, callback);
  },

  getTagList: function (owner, callback) {
    var url = "/api/tagList.php";
    if (owner) {
      url += "?owner=" + owner;
    } else console.log("owner not defined");
    CommonController.getLocalJSON(url, callback);
  },

  getTagURL: function (tag) {
    return "/?tag=" + tag;
  },

  getCSSTemplate: function (callback) {
    var url = "/css/customizeTemplate.css";
    Logger.request(url);
    $.get(url, function (result) {
      Logger.response(url);
      callback(result);
    })
      .error(function (xhr, textStatus, errorThrown) {
        callback(null, textStatus + ":" + xhr.responseText);
      })
  },

  getGitfabDocumentViaProxy: function (owner, repository, callback) {
    var url = "/api/gitfabDocument.php?owner=" + owner + "&repository=" + repository;
    Logger.request(url);
    $.get(url, function (result) {
      Logger.response(url);
      callback(result);
    })
      .error(function (xhr, textStatus, errorThrown) {
        callback(null, textStatus + ":" + xhr.responseText);
      })
  },

  getLocalJSON: function (url, callback) {
    Logger.request(url);
    CommonController.getJSON(url, function (result, error) {
      Logger.response(url);
      if (error) {
        callback(null, error);
        return;
      }
      if (result.message) {
        callback(null, result.message);
      } else {
        callback(result);
      }
    });
  },

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

  getJSON: function (url, callback) {
    $.getJSON(url, function (result) {
      callback(result);
    })
      .error(function (xhr, textStatus, errorThrown) {
        callback(null, textStatus + ":" + xhr.responseText);
      })
  },
}