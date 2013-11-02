/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var projectListController = {
  init: function() {
    Logger.on();
    projectListController.showingProjects = 0;
    window.onscroll = function(){
      //console.log(window.scrollY);
      var rows = projectListController.showingProjects/3;
      if(projectListController.allProjects != projectListController.showingProjects&&
            scrollY>60+218*(rows-3)){//スクロール量の判定
        if(3*(rows+1)<projectListController.allProjects){
          projectListController.loadAndAppendProject(
            projectListController.showingProjects,
            3*(rows+1));  //追加表示するプロジェクト数

        }else{
          projectListController.loadAndAppendProject(
            projectListController.showingProjects,
            projectListController.allProjects);
        }
      }
    };
    var parameters = CommonController.getParametersFromQuery();
    document.title = "gitFAB"+(OWNER?"/"+OWNER+"/":"") + 
    (parameters.QueryString ? "/?"+parameters.QueryString : "");
    projectListController.parameters = parameters;
    if (parameters.tag != null && parameters.tag.length == 0) {
      CommonController.getTagList(null, projectListController.loadedTagList);
    } else {
      CommonController.getProjectListFromDatabase(parameters.tag, 
                                                  OWNER, 
                                                  projectListController.loadedProjectList);
    }
  },
  
  loadedProjectList: function(result, error) {
    if (CommonController.showError(error) != true) {
      if (result.projectList.length == 0) {
        if (projectListController.parameters.tag) {
          CommonController.getTagList(null, projectListController.loadedTagList);
          return;
        }
      } else {
        projectListController.parseProjectList(result);
      }
    }
    projectListController.postLoadProjectList();      
  },

  parseProjectList: function(result) {
    projectListController.ul = $("#project-list");
    projectListController.ul.hide();
    projectListController.projectList = result.projectList;
    projectListController.allProjects = result.projectList.length;
    if(projectListController.projectList.length>12){
      projectListController.showingProjects = 12;
      projectListController.loadAndAppendProject(0,12);
    }else{
      projectListController.showingProjects = projectListController.projectList.length;
      projectListController.loadAndAppendProject(
       0,
       projectListController.showingProjects);
    }
  },
  
  loadAndAppendProject: function(start,end){
    if(start<end&&end<=projectListController.allProjects){
     // ul.hide();
      //projectListController.projectList = result.projectList;
      var elements = [];
      for (var i = start; i < end; i++) {
        var project = projectListController.projectList[i];
        var li = $(document.createElement("li"));
        var ui = CommonController.createProjectUI(project.owner,
                                                   project.name,
                                                   project.avatar, 
                                                   project.thumbnail, 
                                                   project.branch,
                                                   project.tags);
        li.append(ui);
        elements.push(li);
      }
      projectListController.ul.show();
      GridLayout.doLayout($("#main").width(), projectListController.ul, elements, projectListController.projectList);
      projectListController.showingProjects = end;
    }//else console.log("bounding error :" +start+" : "+end );
  },
  loadedTagList: function(result, error) {
    if (CommonController.showError(error) != true) {
      var taglist = result.taglist;
      var container = $("#project-list");
      var title = $(document.createElement("div"));
      title.text("project not found. please select from following tags.");
      title.attr("id", "tag-title");
      container.append(title);
      var defaultFontSize = 30;
      for (var i = 0, n = taglist.length; i < n; i++) {
        var tagResult = taglist[i];
        var element = $(document.createElement("a"));
        element.text(tagResult.tag);
        element.css("font-size", defaultFontSize+"px");
        element.addClass("tag");
        var url = CommonController.getTagURL(tagResult.tag);
        element.attr("href", url);
        container.append(element);
      }
    }
    projectListController.postLoadProjectList();      
  },

  postLoadProjectList: function() {
    var parameters = projectListController.parameters;
    if (parameters.code) {
      CommonController.authorize(parameters.code, projectListController.authorized);
    } else {
      CommonController.setParameters(projectListController);
      if (projectListController.user) {
        CommonController.updateUI(projectListController.user, projectListController.avatar_url);
      }
      Logger.off();
    }
  },

  authorized: function(result, error) {
    Logger.off();
    if (CommonController.showError(error) == true) return;
    CommonController.updateUI(result.user, result.avatar_url);
  },
};

$(document).ready(function() {
  projectListController.init();
});