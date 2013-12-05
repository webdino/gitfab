/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var ProjectListController = {
  init: function () {
    var parameters = CommonController.getParametersFromQuery();
    document.title = "gitFAB" + (OWNER ? "/" + OWNER + "/" : "") +
      (parameters.QueryString ? "/?" + parameters.QueryString : "");
    ProjectListController.parameters = parameters;

    Logger.on();
    var promise4list = ProjectListController.loadProjectList();
    var promise4authorize = ProjectListController.authorize();
    promise4list.then(function() {
      if ($(".project").length == 0) {
        return ProjectListController.loadTagList();
      }
    });

    var promise = CommonController.when(promise4list, promise4authorize);
    promise.fail(function(error) {
      CommonController.showError(error);
      Logger.error(error);
    })
    .done(function() {
      Logger.off();
    });
    //window.onscroll = ProjectListController.autoPager();
  },
  
  loadProjectList: function() {
    var promise = CommonController.getProjectList(ProjectListController.parameters.tag, OWNER);
    promise.then(function(data) {
      var projectList = data.projectList;
      ProjectListController.createProjectListUI(projectList);
    });
    return promise;
  },

  createProjectListUI: function (projectList) {
    var container = $("#project-list");
    container.hide();
    var elements = [];
    for (var i = 0, n = projectList.length; i < n; i++) {
      var project = projectList[i];
      var li = $(document.createElement("li"));
      var ui = CommonController.createProjectUI(project.owner, project.name, project.avatar, project.thumbnail, project.branch, project.tags);
      li.append(ui);
      elements.push(li);
    }
    container.show();
    GridLayout.doLayout($("#main").width(), container, elements, projectList);
  },

  loadTagList: function() {
    var promise = CommonController.getTagList(null);
    promise.then(function(data) {
      var tagList = data.tagList;
      ProjectListController.createTagListUI(tagList);
    });
    return promise;
  },

  createTagListUI: function (tagList) {
    var container = $("#project-list");
    var title = $(document.createElement("div"));
    title.text("project not found. please select from following tags.");
    title.attr("id", "tag-title");
    container.append(title);
    var defaultFontSize = 30;
    for (var i = 0, n = tagList.length; i < n; i++) {
      var tagResult = tagList[i];
      var element = $(document.createElement("a"));
      element.text(tagResult.tag);
      element.css("font-size", defaultFontSize + "px");
      element.addClass("tag");
      var url = CommonController.getTagURL(tagResult.tag);
      element.attr("href", url);
      container.append(element);
    }
  },

  authorize: function() {
    var parameters = ProjectListController.parameters;
    if (parameters.code) {
      var promise = CommonController.authorize(parameters.code);
      promise.then(function(data) {
        ProjectListController.updateUserUI(data.user, data.avatar_url);
        window.location.href = "/";
      });
      return promise;
    } else {
      var user = CommonController.getUser();
      if (user) {
        ProjectListController.updateUserUI(user, CommonController.getAvatarURL());
      }
    }
  },

  updateUserUI: function(user, avatar_url) {
    CommonController.updateUI(user, avatar_url);
    $("#main").addClass("hasToolbar");
  },

  //----------------------------------------------------------
  /*
  autoPager: function () {
    var rows = ProjectListController.showingProjects / 3;
    if (ProjectListController.allProjects != ProjectListController.showingProjects &&
      scrollY > 60 + 218 * (rows - 3)) { //スクロール量の判定
      if (3 * (rows + 1) < ProjectListController.allProjects) {
        ProjectListController.loadAndAppendProject(
          ProjectListController.showingProjects,
          3 * (rows + 1)); //追加表示するプロジェクト数
      } else {
        ProjectListController.loadAndAppendProject(
          ProjectListController.showingProjects,
          ProjectListController.allProjects);
      }
    }
  }
  */ 
};

$(document).ready(function () {
  ProjectListController.init();
});
