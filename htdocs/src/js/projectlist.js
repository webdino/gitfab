/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var projectListController = {
  init: function() {
    Logger.on();
    var parameters = CommonController.getParametersFromQuery();
    document.title = "gitFAB"+(OWNER?"/"+OWNER+"/":"")+ (parameters.QueryString ? "/?"+parameters.QueryString : "");
    projectListController.parameters = parameters;
    if (parameters.tag != null && parameters.tag.length == 0) {
      CommonController.getTagList(null, projectListController.loadedTagList);
    } else {
      CommonController.getProjectListFromDatabase(parameters.tag, OWNER, projectListController.loadedProjectList);
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
    var ul = $("#project-list");
    ul.hide();
    var projectList = result.projectList;
    var length = projectList.length;
    var elements = [];
    for (var i = 0; i < length; i++) {
      var project = projectList[i];
      var li = $(document.createElement("li"));
      li.addClass("project");
      var ui = CommonController.createRepositoryUI(project.owner, project.name, project.avatar, project.thumbnail, project.tags);
      li.append(ui);
      elements.push(li);
    }
    GridLayout.doLayout($("#main").width(), ul, elements, projectList);
    ul.show();
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