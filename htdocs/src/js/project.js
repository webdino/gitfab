/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

 var projectController = {   init: function() {
  projectController.markdownParser = new Showdown.converter();
  projectController.base64 = new Base64();     
  projectController.current_id = 0;
  CommonController.setParameters(projectController);     
  document.title =
  "gitFAB/"+projectController.owner+"/"+projectController.repository;

  if (projectController.user) {
    CommonController.updateUI(projectController.user, projectController.avatar_url);
  }

  if (projectController.user == projectController.owner) {
    if (projectController.repository == ":create") {
        //new repository
        projectController.repository = null;
        $("#avatar").attr("src", projectController.avatar_url);
        $("#owner").text(projectController.user);
        $("#repository").text("input-your-repository-name");
        projectController.setEditable();
      } else {
        //update repository
        projectController.loadGitfabDocument(true);
        $("#fork-button").click(function () {
          projectController.fork();
        });
      }
    } else if (projectController.repository) {
      projectController.loadGitfabDocument(false);
      if (!projectController.user) {
        $("#fork-button").click(function() {
          alert("please login");
        });
      } else {
        $("#fork-button").click(function () {
          projectController.fork();
        });
      }
    } else {
      //not found
      $("#project").text("project not found");
    }

    $("#slide-button").click(projectController.slideshow);

  },
  
  loadGitfabDocument: function(isEditable) {
    var gitfabDocument = document.getElementById("gitfab-document").innerHTML;
    if (gitfabDocument.length == 0) {
      //not found
      $("#tools").hide();
      $("#project").text(projectController.owner+"/"+projectController.repository+" is not found");
    } else {
      projectController.parseGitFabDocument(gitfabDocument, isEditable);
      if (isEditable == true) {
        projectController.setEditable();
      }
      projectController.loadRepositoryInformation();
    }
  },
  
  loadRepositoryInformation: function() {
    CommonController.getRepositoryInformation(projectController.owner, projectController.repository, function(result, error) {
      //user's icon
      $("#avatar").attr("src", result.owner.avatar_url);

      //parent
      if (result.parent) {
        var owner = result.parent.owner.login;
        var repository = result.parent.name;
        projectController.appendRepositoryUITo($("#parent-project"), owner, repository);
        $("#parent-project-label").text("parent project");
      } else {
        $("#parent-project").hide();
        $("#parent-project-label").text("this is a root project");
      }
      if (result.forks_count == 0) {
        return;
      }
      $("#child-project-list-label").text("child project list");
      CommonController.getForksInformation(projectController.owner, projectController.repository, function(forks, error) {
        for (var i = 0, n = forks.length; i < n; i++) {
          var fork = forks[i];
          var owner = fork.owner.login;
          var repository = fork.name;
          var container = $(document.createElement("div"));
          container.addClass("child-project");
          container.addClass("project");
          $("#child-project-list").append(container);
          projectController.appendRepositoryUITo(container, owner, repository);
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
    var tags = metadata.tags;
    var ui = CommonController.createProjectUI(owner, name, avatar, thumbnail, tags);
    container.append(ui);
  });
},

setEditable: function() {
    //reusable elements
    projectController.reusable_input = $(document.createElement("input"));
    projectController.reusable_input.attr("id", "reusable_input");
    projectController.reusable_textarea = $(document.createElement("textarea"));
    projectController.reusable_textarea.attr("id", "reusable_textarea");
    //
    var buttoncontainer = $(document.createElement("div"));
    var button = $(document.createElement("button"));
    button.text("apply");
    buttoncontainer.attr("id", "reusable_applybutton");
    buttoncontainer.append(button);
    projectController.reusable_applybutton = buttoncontainer;

    $("#append-button").click(projectController.append);
    $("#upload-button").click(projectController.appendViaUpload);
    $("#commit-button").click(projectController.commit);
    $("#delete-button").click(projectController.deleteRepository);

    $("#upload").change(projectController.upload);
    $("#repository").click(projectController.editTitle);
    $("#tags").click(projectController.editTags);
    $("#customize-css .text-button").click(projectController.customizeCSS);
    $("#main").addClass("editable");
  },
  
  parseGitFabDocument: function(result, isEditable) {
    var content = result;
    //from github api
//    var content = projectController.base64.decodeStringAsUTF8(result.content.replace(/\n/g, ""));
    //parse
    var lines = content.split("\n");
    if(projectController.branch == "master"){
      var title = projectController.repository;
    } else {
      var title = projectController.branch;
    }
    var tags = lines[1].substring("## ".length);
    var owner = projectController.owner ? projectController.owner : projectController.user;
    $("#owner").text(owner);
    $("#repository").text(title);
    $("#tags").text(tags);
    var text;
    for (var i = 4, n = lines.length; i < n; i++) {
      var line = lines[i];
      if (line == "---") {
        projectController.append2dom(text, isEditable);
        text = null;
        continue;
      }
      if (text) {
        text += "\n" + line;
      } else {
        text = line;
      }
    }
    projectController.updateIndex();
  },
  
  editTextContent: function(e) {
    e.preventDefault();

    var target = $(e.currentTarget.parentNode.parentNode).find(".content");
    var text = target.get(0).markdown;
    projectController.reusable_textarea.val(text);
    target.empty();
    target.append(projectController.reusable_textarea);    
    projectController.reusable_textarea.focus();
    projectController.reusable_textarea.blur(projectController.commitTextContent);
    //この属性があると、textarea をクリックした場合でも blur イベントが発生してしまう。
    target.removeAttr("draggable");

    target.append(projectController.reusable_applybutton);
  },
  
  commitTextContent: function(e) {
    var text = projectController.reusable_textarea.val();
    var target = projectController.reusable_textarea.parent();
    projectController.updateitem(text, target);
    projectController.reusable_textarea.unbind("blur", projectController.commitTextContent);
    target.attr("draggable", "true");
  },
  
  editTitle: function(e) {
    var title = $("#repository");
    title.unbind("click", projectController.editTitle);
    var text = title.text();
    title.empty();
    title.addClass("editing");
    projectController.reusable_input.val(text);
    projectController.reusable_input.change(projectController.commitTitle);
    projectController.reusable_input.blur(projectController.commitTitle);
    title.append(projectController.reusable_input);
    projectController.reusable_input.focus();
  },
  
  commitTitle: function(e) {
    var text = projectController.reusable_input.val();
    var title = $("#repository");
    title.text(text);
    title.removeClass("editing");
    title.click(projectController.editTitle);
    projectController.reusable_input.unbind("change", projectController.commitTitle);
    projectController.reusable_input.unbind("blur", projectController.commitTitle);
  },
  
  editTags: function(e) {
    var tags = $("#tags");
    tags.unbind("click", projectController.editTags);
    var text = tags.text();
    tags.empty();
    tags.addClass("editing");
    projectController.reusable_input.val(text);
    projectController.reusable_input.change(projectController.commitTags);
    projectController.reusable_input.blur(projectController.commitTags);
    tags.append(projectController.reusable_input);
    projectController.reusable_input.focus();
  },

  commitTags: function(e) {
    var text = projectController.reusable_input.val();
    var tags = $("#tags");
    tags.text(text);
    tags.removeClass("editing");
    tags.click(projectController.editTags);
    projectController.reusable_input.unbind("change", projectController.commitTags);
    projectController.reusable_input.unbind("blur", projectController.commitTags);
  },
  
  upload: function(e) {
    var target = null;
    var text = "";
    if (projectController.upload_target) {
      target = projectController.upload_target.get(0);
      text += target.markdown+"\n\n";
    } else {
      //append a item via upload
      var item = projectController.append2dom("");
      target = item.find(".content").get(0);
      projectController.upload_target = $(target);
    }
    var file = this.files[0];

    var urlObject = window.URL ? window.URL : window.webkitURL;
    var url = urlObject.createObjectURL(file);
    if (file.type.match(/image.*/)) {
      text += "!["+file.name+"]("+url+")";
    } else {
      text += "["+file.name+"]("+url+")";
    }
    projectController.updateitem(text, projectController.upload_target);
    if (!target.files) {
      target.files = {};
    }
    target.files[url] = file;
  },
  
  updateitem: function(text, target) {
    target.get(0).markdown = text;
    var html = projectController.encode4html(text);
    target.html(html);
    target.find("a").attr("target", "_blank");
    projectController.updateIndex();
  },
  
  kickUpload: function(e) {
    var target = e.target;
    var parent = $(target.parentNode.parentNode);
    var content = $(parent.find(".content"));
    projectController.upload_target = content;
    $("#upload").click();
  },
  
  kickUploadFromImage: function(e) {
    var target = e.currentTarget;
    projectController.upload_target = $(target.parentNode.parentNode);
    $("#upload").click();
  },
  
  remove: function(e) {
    if (!window.confirm("are you sure to remove this item?")) {
      return;
    }
    var target = $(e.currentTarget.parentNode.parentNode);
    target.remove();
  },
  up: function(e) {
    var target = $(e.currentTarget).parent().parent();
    console.log(target.prev().attr("id"));
    projectController.exchangeItems(target.attr("id"),target.prev().attr("id"));
  },
  down: function(e) {
    var target = $(e.currentTarget).parent().parent();
    console.log(target.next().attr("id"));
    projectController.exchangeItems(target.attr("id"),target.next().attr("id"));
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
    var target = $(e.currentTarget).parent(".item");
    var targetid = target.attr("id");
    var dataTransfer = e.originalEvent.dataTransfer;
    var sourceid = dataTransfer.getData('text/plain');
    if (targetid == sourceid) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    
    var source = $("#"+sourceid);
    var items = $(".item");
    var sourceIndex = items.index(source);
    var targetIndex = items.index(target);
    var isBefore = sourceIndex > targetIndex;
    
    //exchange
    if (isBefore == true) {
      target.before(source);
    } else {
      target.after(source);
    }

    projectController.updateIndex();

    return false;
  },
  exchangeItems: function(sourceId,targetId){
    if(sourceId>=0&&targetId>=0){
      var source = $("#"+sourceId);
      var target = $("#"+targetId);
      var items = $(".item");
      var sourceIndex = items.index(source);
      var targetIndex = items.index(target);
      var isBefore = sourceIndex > targetIndex;
      
      //exchange
      if (isBefore == true) {
        target.before(source);
      } else {
      target.after(source);
      }
      projectController.updateIndex();
    }else console.log("can't exchangeitems :"+sourceid+" : "+targetId);
  },
  
  append: function(e) {
    var textarea = $("#textarea");
    var text = textarea.val();
    projectController.append2dom(text, true);
    textarea.val("");
    projectController.updateIndex();
  },

  appendViaUpload: function(e) {
    projectController.upload_target = null;
    $("#upload").click();
  },
  
  append2dom: function(text, isEditable) {
    //elements
    var item = $(document.createElement("li"));
    item.addClass("item");
    item.attr("id", projectController.current_id++);

    var content = $(document.createElement("a"));
    content.addClass("content");
    projectController.updateitem(text, content);

    if (isEditable == true) {
      content.attr("draggable", "true");
      content.bind('dragstart', projectController.dragStart);
      content.bind('dragover', projectController.dragOver);
      content.bind('drop', projectController.dropEnd);

      var func = $(document.createElement("div"));
      func.addClass("function");
      var edit = $(document.createElement("div"));
      edit.text("edit");
      edit.addClass("text-button");
      var upButton = $(document.createElement("div"));
      upButton.text("up");
      upButton.addClass("text-button");
      var downButton = $(document.createElement("div"));
      downButton.text("down");
      downButton.addClass("text-button");
      var upload = $(document.createElement("div"));
      upload.text("upload");
      upload.addClass("text-button");
      var remove = $(document.createElement("div"));
      remove.text("remove");
      remove.addClass("text-button");
      edit.click(projectController.editTextContent);
      upload.click(projectController.kickUpload);
      remove.click(projectController.remove);
      upButton.click(projectController.up);
      downButton.click(projectController.down);
      func.append(edit);
      func.append(upload);
      func.append(remove);
      func.append(upButton);
      func.append(downButton);
      item.append(func);
    }
    item.append(content);

    
    $("#item-list-ul").append(item);
    return item;
  },
  
  commit: function(e) {
    //このタイトルのリポジトリを作成あるいはアップデート
    Logger.on();
    var repository = $("#repository").text();
    projectController.oldrepository = "";
    if (!projectController.repository) {
      //new
      console.log("new Project");
      projectController.newRepository(repository);
    } else if ((projectController.branch == "master" && //TODO: 汚いので後でなおしたい
      projectController.repository != repository) ||
    (projectController.branch != "master" &&
      projectController.branch != repository)) {
      //rename
      projectController.renameProject(repository);
    } else {
      //update
      projectController.updateRepository();
    }
  },

  watch: function(owner, repository, callback) {
    CommonController.watch(owner, repository, callback);
  },
  
  updateRepository: function() {
    CommonController.getSHATree(projectController.user, 
      projectController.repository,
      projectController.branch, 
      projectController.commitDocument);
  },
  
  findThumbnail: function() {
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
    return thumbnail; 
  },

  updateMetadata: function(callback) {
    var tags = $("#tags").text();
    var avatar = $("#login img").attr("src");
    var thumbnail = projectController.findThumbnail();
    console.log(projectController.branch);
    CommonController.updateMetadata(projectController.user, 
      projectController.repository, 
      projectController.oldrepository, 
      projectController.branch, 
      tags, 
      avatar, 
      thumbnail, 
      callback);
  },

  commitDocument: function(result, error) {
    if (CommonController.showError(error) == true) return;

    var tree = result.tree;

    var userDocument = "";
    userDocument += "# "+projectController.repository;
    userDocument += "\n";
    userDocument += "## "+$("#tags").text();
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
        //replace url
        var fileURL = CommonController.getFileURL(projectController.user, 
          projectController.repository,
          projectController.branch,
          MATERIALS+"/"+file.name);
        text = text.replace(key, fileURL);
        $("img[src='"+key+"']").attr("fileurl", fileURL);
      }
      content.markdown = text;
      content.files = {};
      userDocument += text+"\n";
      userDocument += "---\n";
    }
    //ここで userDocument を README.md の内容としてコミット
    projectController.commitChain(MAIN_DOCUMENT, projectController.base64.encodeStringAsUTF8(userDocument), "", tree, filemap);
  },

  commitChain: function(path, content, message, tree, filemap) {
    CommonController.commit(projectController.token, 
      projectController.user, 
      projectController.repository, 
      projectController.branch, 
      path, 
      content, 
      message, 
      tree, 
      function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        var file = null;
        for (var key in filemap) {
          file = filemap[key];
          delete filemap[key];
          break;
        }
        if (!file) {
          projectController.updateMetadata(function() {
            if (projectController.css) {
              CommonController.commit(projectController.token, 
                projectController.user, 
                projectController.repository, 
                projectController.branch ,
                CUSTOM_CSS, 
                projectController.base64.encodeStringAsUTF8(projectController.css), 
                "", 
                tree, 
                function(result, error) {
                  CommonController.showError(error);
                  Logger.off();
                });
            } else {
              Logger.off();
            }
          });
          return;
        }
        var reader = new FileReader();
        reader.onload = function(e) {
          var content = reader.result;
          var index = content.indexOf(",");
          content = content.substring(index+1);
          var path = MATERIALS+"/"+file.name;
          projectController.commitChain(path, content, "", tree, filemap);
        };
        reader.readAsDataURL(file);
      });
},

newRepository: function(name) {
  console.log(projectController.owner);
    //name = CommonController.generateRepositoryName(projectController.owner,name);
    if(CommonController.isDupGHRepositories(projectController.owner,name)){
      alert("already exist name. type other name.");
      Logger.off();
    }else{
      CommonController.newRepository(projectController.token, 
       name, 
       function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        projectController.repository = name;
        projectController.watch(projectController.user, projectController.repository, function(result, error) {
          if (CommonController.showError(error) == true) {
            Logger.off();
            return;
          }
          projectController.updateRepository();
          CommonController.newDBProject(
            projectController.user,
            name,
            "master");
          var url = CommonController.getProjectPageURL(projectController.user, 
             projectController.repository,
             "master");
          Logger.log("reload: "+url);
          console.log("jump to "+url);
          setTimeout(function() {
            window.location.href = url;
            Logger.off();
          }, 500);
        });
      });
    }
  },
  
  newUniqueNameRepository: function(name) { // if given name is already exist, generate unique name.
    console.log(projectController.owner);
    name = CommonController.generateRepositoryName(projectController.owner,name);
    CommonController.newRepository(projectController.token, 
     name, 
     function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }
      projectController.repository = name;
      projectController.watch(projectController.user, projectController.repository, function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        projectController.updateRepository();
      });
    });
  },
  renameProject: function(name){//project の branch が master かどうか
    if(projectController.branch == "master"){
      if(name != projectController.repository){
        if(CommonController.isDupGHRepositories(projectController.owner,name)){
          alert("already exist name. type other name.");
        }else{
          console.log("rename Repositoy!!!");
          CommonController.renameRepository(projectController.token,
            projectController.owner,
            name,
            projectController.repository,
            CommonController.renameBranches(projectController.owner,
              name,
              projectController.repository,
              projectController.branch));
        }
      }
    } else {
      console.log("rename Branch!!!");
      if(!CommonController.isDupGHBranches(projectController.owner,
        projectController.repository,
        name))
        projectController.createAndRenameBranch(name,projectController.branch);
      else alert("this name is already used.type other name"); 
    }

  },

  renameRepository: function(name) {
    CommonController.renameRepository(projectController.token, 
      projectController.user, 
      name, 
      projectController.repository, 
      function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        projectController.oldrepository = projectController.repository;
        projectController.repository = name;
        projectController.updateRepository();
      });
  },

  
  deleteRepository: function() {
    if (!window.confirm("are you sure to remove this project?")) {
      return;
    }
    Logger.on();
    CommonController.deleteRepository(
      projectController.token, 
      projectController.owner, 
      projectController.repository, 
      projectController.branch,
      function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        Logger.log("reload:/");
        setTimeout(function() {
          window.location.href = "/";
          Logger.off();
        },2000);
      });
  },

  getAllReferences: function(){
    CommonController.getAllReferences(projectController.user, projectController.repository, function(result, error) {
      if (CommonController.showError(error) == true) {
        Logger.off();
        return;
      }
    });
  },
  newBranch: function(branch){
    CommonController.getSHA(projectController.user,
      projectController.repository,
                            "master",//old branch name
                            function(result,error){
                              CommonController.newBranch(projectController.token,
                               projectController.owner, 
                               projectController.repository,
                               branch, 
                               result.object.sha,
                               function(result, error) {
                                if (CommonController.showError(error) == true) {
                                  Logger.off();
                                  return;
                                }
                                projectController.updateMetadata(function() {
                                  var url = CommonController.getProjectPageURL(projectController.user, 
                                   projectController.repository,
                                   projectController.branch);
                                  Logger.log("reload: "+url);
                                  setTimeout(function() {
                                    window.location.href = url;
                                    Logger.off();
                                  }, 500);
                                });
                              });
    });
  },

createAndRenameBranch: function(newBranch,oldBranch){
  CommonController.getSHA(projectController.user,
    projectController.repository,
    oldBranch,
    function(result,error){
      CommonController.newBranch(projectController.token, //on Github
       projectController.owner, 
       projectController.repository,
       newBranch, 
       result.object.sha,
       function(result, error) {
        if (CommonController.showError(error) == true) {
          Logger.off();
          return;
        }
        CommonController.renameDBBranch(projectController.owner,
          projectController.repository,
          newBranch,
          oldBranch);
        Logger.log("reload: "+url);
        setTimeout(function() {
          window.location.href = url;
          Logger.off();
        }, 500);
      });
    });
},
fork: function() {
  Logger.on();
  if(projectController.user == projectController.owner){ 
    console.log("fork itself!!!");
    projectController.branch = 
      CommonController.generateBranchName(projectController.owner,
        projectController.repository,
        projectController.repository);
    
    projectController.newBranch(projectController.branch);
   /* projectController.updateMetadata(function() {
      var url = CommonController.getProjectPageURL(projectController.user, 
        projectController.repository,
        projectController.branch);
      
      Logger.log("reload: "+url);
      setTimeout(function() {
        window.location.href = url;
        Logger.off();
        }, 500);
      });*/
  }else{//fork from others
    CommonController.fork(projectController.token, 
      projectController.owner, 
      projectController.repository,
      function(result, error) {
        if (CommonController.showError(error) == true) {
                  Logger.off();
                  return;
                }
                projectController.repository = result.name;
                projectController.watch(projectController.user, 
                  projectController.repository,
                  function(result, error) {
                    if (CommonController.showError(error) == true) {
                      Logger.off();
                      return;
                    };
                    projectController.oldrepository = "";
                    projectController.updateMetadata(function() {
                      var url = CommonController.getProjectPageURL(projectController.user, 
                       projectController.repository,
                       projectController.branch);
                      Logger.log("reload: "+url);
                      setTimeout(function() {
                        window.location.href = url;
                        Logger.off();
                      }, 500);
                    });
                  });
              });
}
},

encode4html: function(text) {
  return projectController.markdownParser.makeHtml(text);
},

customizeCSS: function(e) {
  var target = $("#customize-css .text-button");
  var parent = target.parent();
  parent.append(projectController.reusable_textarea);
  projectController.reusable_textarea.focus();
  projectController.reusable_textarea.blur(projectController.applyCSS);
  parent.append(projectController.reusable_applybutton);

  if (projectController.css) {
    projectController.reusable_textarea.val(projectController.css);
  } else {
    Logger.on();
    CommonController.getCustomCSS(projectController.owner, projectController.repository, function(result, error) {
      if (error) {
        Logger.log(error);
        CommonController.getCSSTemplate(function(result, error) {
          if (CommonController.showError(error) == true) return;
          projectController.reusable_textarea.val(result);
          Logger.off();
        });
      } else {
        var content = projectController.base64.decodeStringAsUTF8(result.content.replace(/\n/g, ""));
        projectController.reusable_textarea.val(content);
        Logger.off();
      }
    });
  }
},

applyCSS: function(e) {
  projectController.reusable_textarea.unbind("blur", projectController.applyCSS);
  projectController.reusable_textarea.remove();
  projectController.reusable_applybutton.remove();

  var cssContent = projectController.reusable_textarea.val();
  var ID = "customecss";
  var stylesheet = $("#"+ID);
  if (stylesheet.length == 0) {
    stylesheet = $(document.createElement("style"));
    stylesheet.attr("type", "text/css");
    stylesheet.attr("id", ID);
    document.body.appendChild(stylesheet.get(0));
  }
  stylesheet.text(cssContent);
  projectController.css = cssContent;
},

updateIndex: function() {
  var container = $("#index ul");
  container.empty();
    //find heading
    var headings = $(".content h1");
    for (var i = 0, n = headings.length; i < n; i++) {
      var h1 = headings.get(i);
      var li = $(document.createElement("li"));
      var a = $(document.createElement("a"));
      a.attr("href", "#"+i);
      a.text(h1.textContent);
      li.append(a);
      container.append(li);
    }
  },

  slideshow: function() {
    var contentlist = [];

    var meta = $(document.getElementById("meta").cloneNode(true));
    var thumbnail = projectController.findThumbnail();
    meta.css("background-image", "url("+thumbnail+")");
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

$(document).ready(function() {
  projectController.init();
});