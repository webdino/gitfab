/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

 var GITFAB_DIR = "gitfab";
 var MATERIALS = GITFAB_DIR+"/resources";
 var MAIN_DOCUMENT = "README.md";
 var CUSTOM_CSS = GITFAB_DIR+"/custom.css";

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
      parameters["QueryString"] = queryString;
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
    if (BRANCH) {
      if(BRANCH == "undefined")object.branch = "master";   
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

  updateUI: function(username, avatarURL) {
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
    CommonController.getJSON(url, function(result, error) {
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
  
  getProjectList: function(callback) {
    var url = "https://api.github.com/users/gitfab/subscriptions?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  

  getProjectPageURL: function(owner, repository, branch) {
    return "/"+owner+"/"+repository+"/"+branch+"/";
  },

  getDashboardURL: function(owner) {
    return "/"+owner+"/";
  },

  getFileURL: function(user, repository, branch, path) {
    return "https://raw.github.com/"+user+"/"+repository+"/"+branch+"/"+path;
  },
  
  getGitfabDocument: function(owner, repository, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/contents/"+MAIN_DOCUMENT+"?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getCustomCSS: function(owner, repository, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/contents/"+CUSTOM_CSS+"?callback=?";
    CommonController.getGithubJSON(url, callback);
  },

  getOwnerInformation: function(owner, callback) {
    var url = "https://api.github.com/users/"+owner+"?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getRepositoryInformation: function(owner, repository, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getForksInformation: function(owner, repository, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/forks?callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  
  getSHATree: function(user, repository, branch, callback) {//branch not impl yet
    var url = "https://api.github.com/repos/"+user+"/"+repository+"/git/trees/master?recursive=2&callback=?";
    CommonController.getGithubJSON(url, callback);
  },
  getSHA: function(user, repository, branch,callback){
    var url= "https://api.github.com/repos/"+user+"/"+repository+"/git/refs/heads/"+branch;
    CommonController.getJSON(url,callback);
  },
  commit: function(token, user, repository, branch, path, content, message, tree, callback) {
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
    console.log("commit:");
    console.log(branch);
    var url = "https://api.github.com/repos/"+user+"/"+repository+"/contents/"+path;
    CommonController.ajaxGithub(url, "PUT", token, parameters, callback);
  },

  fork: function(token, owner, repository, callback) {
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/forks";

    CommonController.ajaxGithub(url, "POST", token, {}, callback);
  },
  newBranch: function(token,user,name,branch,sha,callback){
    var parameters = {
      ref: "refs/heads/"+branch,
      sha: sha
    };
    CommonController.ajaxGithub("https://api.github.com/repos/"+user+"/"+name+"/git/refs", "POST", token, parameters, callback);

  },
  getThumbnail: function(token,owner,repository,branch,callback){
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/contents/gitfab/thumbnail.jpg";
    var parameters = {
      ref:"heads/"+branch
    }
    CommonController.ajaxGithub(url,"GET",token,parameters,callback);
  },
  newRepository: function(token, name, callback) {
    var parameters = {
      name: name,
      auto_init: true
    };
    CommonController.ajaxGithub("https://api.github.com/user/repos", "POST", token, parameters, callback);
  },


  renameBranches: function(owner,name,oldname,branch){
    var url = "/api/check.php?owner="+owner+"&repository="+oldname;
    CommonController.getJSON(url,function(result){
      for(var i = 0; i < result.branches.length; i++){
        var proj = result.branches[i];
        console.log("--------------renameBranchesRepositoryName");
        console.log(proj);
       /* CommonController.updateMetadata(proj.owner, 
          name, 
          proj.name, 
          proj.branch, 
          "", "", "", 
          function(result){console.log(result)});
    */
    CommonController.renameDBRepository(proj.owner,name,proj.name,proj.branch);
      }

    });
  },

  //----------------------------------

  newDBProject: function(owner,repository,branch){
    var url = "/api/newProject.php?owner="+owner+"&repository="+repository+"&branch="+branch;
    CommonController.getJSON(url,function(res,err){
      console.log(res);
      if(err)throw(err);
    });
  },

  renameDBBranch: function(owner,repository,newBranch,oldBranch){
    var url = "/api/renameBranch.php?owner="+owner+"&repository="+repository+"&newBranch="+newBranch+"&oldBranch="+oldBranch;
    CommonController.getJSON(url,function(res,err){
      console.log(res);
      if(err)throw(err);
    });
  },
  renameDBRepository: function(owner,newRepository,oldRepository,branch){
    var url = "/api/renameRepository.php?owner="+owner+"&newRepository="+newRepository+"&oldRepository="+oldRepository+"&branch="+branch;
    CommonController.getJSON(url,function(res,err){
      console.log(res);
      if(err)throw(err);
    });
  },
  deleteDBProject: function(owner,repository,branch){
    var url = "/api/deleteProject.php?owner="+owner+"&repository="+repository+"&branch="+branch;
    CommonController.getJSON(url,function(res,err){
      console.log(res);
      if(err)throw(err);
    });
  },

  newGHBranch: function(token,user,repository,branch,sha){
    var parameters = {
      ref: "refs/heads/"+branch,
      sha: sha
    };
    CommonController.ajaxGithub("https://api.github.com/repos/"+user+"/"+repository+"/git/refs", 
      "POST", 
      token, 
      parameters, 
      function(res,err){
        console.log(res);
        if(err)throw(err);
      });

  },
  
  newGHRepository: function(token, repository) {
    var parameters = {
      name: repository,
      auto_init: true
    };
    CommonController.ajaxGithub("https://api.github.com/user/repos", 
      "POST", 
      token, 
      parameters, 
      function(res,err){
        console.log(res);
        if(err){
          throw(err);
        }
      });
  },
  //fork するときは unique な名前で、 rename の時は被ったらアラートを出す。
  generateRepositoryName: function(owner,repository){//generating unique name
    var name = repository;
    if(CommonController.isDupGHRepositories(owner,name)){
      var i=2;
      while(CommonController.isDupGHRepositories(owner,name+"-"+i)){
        i++;
      }
      return name+"-"+i;
    } else return name;  
  },
  generateBranchName: function(owner,repository,branch){//generating unique name
    if(CommonController.isDupGHBranches(owner,repository,branch)){
      var i=2;
      while(CommonController.isDupGHBranches(owner,repository,branch+"-"+i)){
        i++;
      }
      return branch+"-"+i;
    } else return branch;  
  },
  isDupGHRepositories: function(owner,repository){//TODO: DB の方のチェックもする
    $.ajaxSetup({ async: false });
    var t=false;
    CommonController.getGHRepositories(owner,function(res){
      for(var i=0; i<res.length;i++){
        if(res[i].name == repository){
          console.log("hit!!");
          t=true;
        }
      }
    });
    $.ajaxSetup({ async: true });
    return t;
  },

  getGHRepositories: function(owner,callback){
    CommonController.t = "";
    CommonController.getJSON("https://api.github.com/users/"+owner+"/repos", 
      function(res,err){
      //console.log(res);      
      if(err){
        throw(err);
      }
      callback(res);
    });
  },

//----------------------------------

renameBranch: function(token, user, name, oldBranch) {
  var url = "https://api.github.com/repos/"+user+"/"+name+"/git/refs/heads/"+branch;
  var sha = CommonController.getSHA(user,name,oldBranch,function(res){console.log(res)});
  var parameters = {
    sha:sha,
    force:"true"
  };
  CommonController.ajaxGithub(url, "PATCH", token, parameters, function(res){console.log(res)});
},

renameRepository: function(token, user, name, old, callback) {
  var url = "https://api.github.com/repos/"+user+"/"+old;
  var parameters = {
    name: name,
  };
  CommonController.ajaxGithub(url, "PATCH", token, parameters, function(res,err){
    if(err){throw(err)}
      callback(res);
  });
},

deleteRepository: function(token, user, name, branch, callback) {
  console.log("deleteProject");
  CommonController.deleteDBProject(user,name,branch);
  callback(null,null);
/*
    if(branch == "master"){//branch の存在確認しよう
      console.log("delete master");
      var url = "https://api.github.com/repos/"+user+"/"+name;
      
      CommonController.ajaxGithub(url, "DELETE", token, {}, function(result, error) {
        if (error) {
          callback(null, error);
          return;
        }
        CommonController.updateMetadata(user, "", name, "master","", "", "", callback);
      });
CommonController.updateMetadata(user, "", name, "master","", "", "", callback);

}else{
  console.log("-------------delete Branch");
  var url = "https://api.github.com/repos/"+user+"/"+name+"/git/refs/heads/"+branch;
  CommonController.ajaxGithub(url, "DELETE", token, {}, function(result, error) {
    if (error) {
      callback(null, error);
      return;
    }
    CommonController.updateMetadata(user, "", name, branch,"", "", "", callback);
  });
}*/
  },
/*---------------------


  renameProject: function(token, user, name, old, callback) {
    var url = "https://api.github.com/repos/"+user+"/"+old;
    var parameters = {
      name: name,
    };
    CommonController.ajaxGithub(url, "PATCH", token, parameters, callback);
  },

  deleteProject: function(token, user, name, branch, callback) {
    var url = "https://api.github.com/repos/"+user+"/"+name;
    var parameters = {
      branch: branch
    };//現状では DB 内のデータのみを消して行く。あとでbranchをチェックして 
      //branch があるときに master を消そうとしたら、 repository は残す
      //その他のときは Github と DB を両方消す 
  
    if(branch != "master"){
      CommonController.ajaxGithub(url, "DELETE", token, parameters, function(result, error) {
        if (error) {
          callback(null, error);
          return;
        }
        CommonController.updateMetadata(user, "", name, branch, "", "", callback);
      });
    }else{
      CommonController.updateMetadata(user, "", name, branch, "", "", callback);
    }
    
    CommonController.updateMetadata(user, "", name, branch, "", "", callback);

  },

  ----------------------------*/
  isDupGHBranches: function(owner,repository,branch){
    $.ajaxSetup({ async: false });
    var t=false;
    CommonController.getAllReferences(owner,repository,function(res){
      for(var i=0; i<res.length;i++){
        if(res[i].ref == "refs/heads/"+branch){
          t=true;
        }
      }
    });
    $.ajaxSetup({ async: true });
    return t;
  },

  getAllReferences: function(owner,repository,callback){
    var url = "https://api.github.com/repos/"+owner+"/"+repository+"/git/refs";
    console.log(url);
    CommonController.getJSON(url, function(result, error) {
      if (error) {
        callback(null, error);
        return;
      }else{
        console.log(result);
        callback(result);
      }
    });
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
  
  getGithubJSON: function(url, callback) {
    Logger.request(url);
    CommonController.getJSON(url, function(result, error) {
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

  
  
  //local -----
  getProjectListFromDatabase: function(tag, owner, callback) {
    var url = "/api/Projectlist.php";
    if (tag) {
      url += "?tag="+tag;
    } else if (owner) {
      url += "?owner="+owner;
    }
    CommonController.getLocalJSON(url, callback);
  },

  watch: function(owner, repository, callback) {
    var url = "/api/watch.php?owner="+owner+"&repository="+repository;
    CommonController.getLocalJSON(url, callback);
  },
  
  getMataData: function(owner, repository, callback) {
    var url = "/api/metadata.php?owner="+owner+"&repository="+repository;
    CommonController.getLocalJSON(url, callback);
  },

  updateMetadata: function(owner, repository, oldrepository, branch, tags, avatar, thumbnail, callback) {
    var url = "/api/update-metadata.php?owner="+owner+"&repository="+repository+"&oldrepository="+oldrepository+"&branch="+branch+"&tags="+tags+"&avatar="+avatar+"&thumbnail="+thumbnail;
    CommonController.getLocalJSON(url, callback);
  },

  getTagList: function(owner, callback) {
    var url = "/api/taglist.php";
    if (owner) {
      url += "?owner="+owner;
    }
    CommonController.getLocalJSON(url, callback);
  },

  getTagURL: function(tag) {
    return "/?tag="+tag;
  },

  getCSSTemplate: function(callback) {
    var url = "/css/customize-template.css";
    Logger.request(url);
    $.get(url, function(result) {
      Logger.response(url);
      callback(result);
    })
    .error(function(xhr, textStatus, errorThrown) {
      callback(null, textStatus+":"+xhr.responseText);
    })
  },  

  getGitfabDocumentViaProxy: function(owner, repository, callback) {
    var url = "/api/gitfab-document.php?owner="+owner+"&repository="+repository;
    Logger.request(url);
    $.get(url, function(result) {
      Logger.response(url);
      callback(result);
    })
    .error(function(xhr, textStatus, errorThrown) {
      callback(null, textStatus+":"+xhr.responseText);
    })
  },

  getLocalJSON: function(url, callback) {
    Logger.request(url);
    CommonController.getJSON(url, function(result, error) {
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

  createRepositoryUI: function(ownerS, repositoryS, avatarS, thumbnailS, branchS, tagsA) {
    var link = $(document.createElement("a"));
    var url = CommonController.getProjectPageURL(ownerS, repositoryS,branchS);
    link.attr("href", url);

    if (thumbnailS == "") {
    } else {
      link.css("background-image", "url("+thumbnailS+")")
    }

    var avatar = $(document.createElement("img"));
    avatar.attr("src", avatarS);
    avatar.addClass("avatar");

    var headline = $(document.createElement("div"));
    headline.addClass("headline");

    var owner = $(document.createElement("div"));
    owner.addClass("owner");
    var ownera = $(document.createElement("a"));
    ownera.text(ownerS);
    ownera.attr("href", CommonController.getDashboardURL(ownerS));
    owner.append(ownera);

    var repository = $(document.createElement("div"));
    repository.addClass("repository");
    if(branchS == "master")repository.text(repositoryS);
    else repository.text(branchS);
    //repository.text(repositoryS+"/"+branchS);    

    headline.append(repository);
    headline.append(owner);

    link.append(avatar);
    link.append(headline);

    if (tagsA) {
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
//      headline.append(tags);
link.append(tags);
}

return link;
},

getJSON: function(url, callback) {
  $.getJSON(url, function(result) {
    callback(result);
  })
  .error(function(xhr, textStatus, errorThrown) {
    callback(null, textStatus+":"+xhr.responseText);
  })
},
getJSONwithParam: function(url,data, callback) {
  $.getJSON(url,data, function(result) {
    console.log(result);
  })
  .error(function(xhr, textStatus, errorThrown) {
      //callback(null, textStatus+":"+xhr.responseText);
    })
}
}