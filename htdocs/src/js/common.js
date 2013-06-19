/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

var MATERIALS = "gitfab";
var MAIN_DOCUMENT = "README.md";

var CommonController = {
  getParametersFromQuery: function() {
    var parameters = {};
    var url = window.location.href;
    var indexOfQ = url.indexOf("?");
    if (indexOfQ >= 0) {
      var queryString = url.substring(indexOfQ+1);
      var params = queryString.split("&");
      for (var i = 0, n = params.length; i < n; i++) {
        var param = params[i];
        var keyvalue = param.split("=");
        parameters[keyvalue[0]] = keyvalue[1];
      }
    }
    return parameters;
  },
  
  setParameters: function(object) {
    if (OWNER) {
      object.owner = OWNER;
    }
    if (REPOSITORY) {
      object.repository = REPOSITORY;
    }
    if (USER) {
      object.user = USER;
    }
    if (TOKEN) {
      object.token = TOKEN;
    }
  },

  updateUI: function(username) {
    $("#login").text("logged in as "+username);
    var createurl = CommonController.getItemPageURL(username, ":create");
    $("#create").attr("href", createurl);
    $("#create").show();
    $("#toolbar").show();
  },
  
  showError: function(error) {
    if (error) {
      alert(error);
      return true;
    }
    return false;
  },
  
  //github --------------------------
  authorize: function(code, callback) {
    var url = "/api/authorize.php?code="+code;
    Logger.request(url);
    $.getJSON(url, function(result) {
      Logger.response(url);
      if (result.error) {
        callback(null, result.error);
      } else {
        callback(result);
      }
    });
  },
  
  getItemList: function(callback) {
    var url = "https://api.github.com/users/gitfab/subscriptions?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getItemPageURL: function(owner, repository) {
    return "/"+owner+"/"+repository+"/";
  },
  
  getFileURL: function(user, repository, path) {
    return "https://raw.github.com/"+user+"/"+repository+"/master/"+path;
  },
  
  getGitfabDocument: function(owner, repository, callback) {
//    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/readme?callback=?";
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/contents/"+MAIN_DOCUMENT+"?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getSHATree: function(user, repository, callback) {
    var url = "https://api.github.com/repos/"+user+"/"+repository+"/git/trees/master?recursive=1&callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  commit: function(user, repository, token, path, content, message, tree, callback) {
    var parameters = {
      path: path,
      message: message,
      content: content
    };
    for (var i = 0, n = tree.length; i < n; i++) {
      var node = tree[i];
      if (path == node.path) {
        parameters.sha = node.sha;
        break;
      }
    }
    var url = "https://api.github.com/repos/"+user+"/"+repository+"/contents/"+path;
    CommonController.ajaxGithub(url, "PUT", token, parameters, callback);
  },

  watch: function(owner, repository, callback) {
    var url = "/api/watch.php?owner="+owner+"&repository="+repository;
    Logger.request(url);
    $.getJSON(url, function(result) {
      Logger.response(url);
      if (result.message) {
        callback(null, result.message);
      } else {
        callback(result);
      }
    });
  },
  
  fork: function(owner, repository, token, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/forks";
    CommonController.ajaxGithub(url, "POST", token, {}, callback);
  },
  
  newRepository: function(token, name, callback) {
    var parameters = {
      name: name,
      auto_init: true
    };
    CommonController.ajaxGithub("https://api.github.com/user/repos", "POST", token, parameters, callback);
  },

  renameRepository: function(token, user, name, old, callback) {
    var url = "https://api.github.com/repos/"+user+"/"+old;
    var parameters = {
      name: name,
    };
    CommonController.ajaxGithub(url, "PATCH", token, parameters, callback);
  },

  ajaxGithub: function(url, method, token, parameters, callback) {
    Logger.request(url);
    $.ajax({
      type: method,
      url: url,
      headers: {
        "Authorization":" bearer "+token
      },
      data: JSON.stringify(parameters),
      dataType:"json",
      success: function(data){
        Logger.response(url);
        callback(data);
      },
      error: function(request, textStatus, errorThrown){
        Logger.error(url);
        var response = JSON.parse(request.responseText);
        if (response.errors && response.errors[0] && response.errors[0].message) {
          callback(null, response.errors[0].message);
        } else {
          callback(null, textStatus);
        }
      }
    });
  },
  
  getGithubJSON: function(url, callback) {
    Logger.request(url);
    $.getJSON(url, function(result) {
      Logger.response(url);
      if (result.data.message) {
        callback(null, result.data.message);
      } else {
        callback(result.data);
      }
    });
  },
}