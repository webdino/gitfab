/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */
var ProjectEditor = {

  enable: function () {
    //reusable elements
    ProjectEditor.textfield = $(document.createElement("input"));
    ProjectEditor.textfield.attr("id", "reusable-textfield");
    ProjectEditor.textarea = $(document.createElement("textarea"));
    ProjectEditor.textarea.attr("id", "reusable-textarea");
    ProjectEditor.textarea.attr("rows", "5");
    //-----------------
    var buttoncontainer = $(document.createElement("div"));
    var button = $(document.createElement("div"));
    button.text("apply");
    button.addClass("button");
    buttoncontainer.attr("id", "reusable-apply-button");
    buttoncontainer.append(button);
    ProjectEditor.applyButton = buttoncontainer;

    //item tool
    var itemTools = $(document.createElement("div"));
    itemTools.attr("id", "reusable-item-tools");
    var editButton = $(document.createElement("div"));
    editButton.text("edit");
    editButton.addClass("button");
    var upButton = $(document.createElement("div"));
    upButton.text("up");
    upButton.addClass("button");
    var downButton = $(document.createElement("div"));
    downButton.text("down");
    downButton.addClass("button");
    var uploadButton = $(document.createElement("div"));
    uploadButton.text("upload");
    uploadButton.addClass("button");
    var removeButton = $(document.createElement("div"));
    removeButton.text("remove");
    removeButton.addClass("button");
    editButton.click(ProjectEditor.editItem);
    uploadButton.click(ProjectEditor.upload2Item);
    removeButton.click(ProjectEditor.removeItem);
    upButton.click(ProjectEditor.upItem);
    downButton.click(ProjectEditor.downItem);
    itemTools.append(editButton);
    itemTools.append(uploadButton);
    itemTools.append(removeButton);
    itemTools.append(upButton);
    itemTools.append(downButton);
    ProjectEditor.itemTools = itemTools;
    $(".item").mouseover(ProjectEditor.showItemTools);
    $(".item").mouseout(ProjectEditor.hideItemTools);

    $("#append-button").click(ProjectEditor.appendItem);
    $("#append-file").click(ProjectEditor.appendViaUpload);

    $("#append-heading").click(ProjectEditor.prepareHeading);
    $("#append-text").click(ProjectEditor.prepareText);
    $("#append-markdown").click(ProjectEditor.prepareMarkdown);

    $("#upload").change(ProjectEditor.upload);
    $("#repository").click(ProjectEditor.editTitle);
    $("#tags").click(ProjectEditor.editTags);

    $("#main").addClass("editable");
  },

  appendItem: function (e) {
    switch (ProjectEditor.append_type) {
      case 1 : {
        var text = "#"+$("#textfield").val();
        ProjectController.append2dom(text, true);
        ProjectController.updateIndex();
        $("#textfield").val("");
        break;
      }
      case 2 : {
        var text = $("#textarea").val();
        var content = $(".content:last");
        if (content.length == 0) {
          var item = ProjectController.append2dom("#noname heading", true);
          ProjectController.updateIndex();
          content = $(item.find(".content"));
        }
        var lines = text.split("\n");
        var text = "";
        var regex = /^#/;
        for (var i = 0, n = lines.length; i < n; i++) {
          var line = lines[i];
          if (line.match(regex)) {
            text += "\\"+line;
          } else {
            text += line;
          }
          text += "\n";
        }
        text = content.get(0).markdown + "\n\n" + text;
        ProjectController.updateItem(text, content);
        $("#textarea").val("");
        break;
      }
      case 3 : {
        var regex = /^#/;
        var text = $("#textarea").val();
        var content = null;
        if (!text.match(regex)) {
          content = $(".content:last");
          if (content.length == 0) {
            var item = ProjectController.append2dom("#noname heading", true);
            ProjectController.updateIndex();
            content = $(item.find(".content"));
          }
        }
        var lines = text.split("\n");
        var text = "";
        for (var i = 0, n = lines.length; i < n; i++) {
          var line = lines[i];
          if (line.match(regex)) {
            if (text.length > 0) {
              ProjectController.updateItem(content.get(0).markdown + "\n\n" + text, content);
              text = "";
            }
            var item = ProjectController.append2dom(line, true);
            ProjectController.updateIndex();
            content = $(item.find(".content"));
          } else {
            text += line;
          }
          text += "\n";
        }
        if (text.length > 0) {
          ProjectController.updateItem(content.get(0).markdown + "\n\n" + text, content);
        }
        $("#textarea").val("");
        break;
      }
    }
  },

  appendViaUpload: function (e) {
    ProjectEditor.upload_target = null;
    $("#upload").click();
  },

  prepareHeading: function(e) {
    $("#textform-label").text("heading");
    $("#textarea").hide();
    $("#textfield").show();
    $("#textform-container").show();
    ProjectEditor.append_type = 1;
  },

  prepareText: function(e) {
    $("#textform-label").text("text");
    $("#textarea").show();
    $("#textfield").hide();
    $("#textform-container").show();
    ProjectEditor.append_type = 2;
  },

  prepareMarkdown: function(e) {
    $("#textform-label").text("markdown");
    $("#textarea").show();
    $("#textfield").hide();
    $("#textform-container").show();
    ProjectEditor.append_type = 3;
  },

  showItemTools: function (e) {
    var target = e.currentTarget;
    target.insertBefore(ProjectEditor.itemTools[0], target.firstChild);
    ProjectEditor.itemTools.show();
  },

  hideItemTools: function (e) {
    ProjectEditor.itemTools.hide();
  },

  editItem: function (e) {
    e.preventDefault();

    var target = $(e.currentTarget.parentNode.parentNode).find(".content");
    var text = target.get(0).markdown;
    ProjectEditor.textarea.val(text);
    target.empty();
    target.append(ProjectEditor.textarea);
    ProjectEditor.textarea.focus();
    ProjectEditor.textarea.blur(ProjectEditor.commitItem);
    target.append(ProjectEditor.applyButton);
  },

  commitItem: function (e) {
    var text = ProjectEditor.textarea.val();
    var target = ProjectEditor.textarea.parent();
    ProjectController.updateItem(text, target);
    ProjectEditor.textarea.unbind("blur", ProjectEditor.commitItem);
  },

  editTitle: function (e) {
    var title = $("#repository");
    title.unbind("click", ProjectEditor.editTitle);
    var text = title.text();
    title.empty();
    title.addClass("editing");
    ProjectEditor.textfield.val(text);
    ProjectEditor.textfield.change(ProjectEditor.commitTitle);
    ProjectEditor.textfield.blur(ProjectEditor.commitTitle);
    title.append(ProjectEditor.textfield);
    ProjectEditor.textfield.focus();
  },

  commitTitle: function (e) {
    var text = ProjectEditor.textfield.val();
    var title = $("#repository");
    title.text(text);
    title.removeClass("editing");
    title.click(ProjectEditor.editTitle);
    ProjectEditor.textfield.unbind("change", ProjectEditor.commitTitle);
    ProjectEditor.textfield.unbind("blur", ProjectEditor.commitTitle);
  },

  editTags: function (e) {
    var tags = $("#tags");
    tags.unbind("click", ProjectEditor.editTags);
    var text = tags.text();
    tags.empty();
    tags.addClass("editing");
    ProjectEditor.textfield.val(text);
    ProjectEditor.textfield.change(ProjectEditor.commitTags);
    ProjectEditor.textfield.blur(ProjectEditor.commitTags);
    tags.append(ProjectEditor.textfield);
    ProjectEditor.textfield.focus();
  },

  commitTags: function (e) {
    var text = ProjectEditor.textfield.val();
    var tags = $("#tags");
    tags.text(text);
    tags.removeClass("editing");
    tags.click(ProjectEditor.editTags);
    ProjectEditor.textfield.unbind("change", ProjectEditor.commitTags);
    ProjectEditor.textfield.unbind("blur", ProjectEditor.commitTags);
  },

  upload2Item: function (e) {
    var target = e.target;
    var parent = $(target.parentNode.parentNode);
    var content = $(parent.find(".content"));
    ProjectEditor.upload_target = content;
    $("#upload").click();
  },

  upItem: function (e) {
    var target = $(e.currentTarget).parent().parent();
    ProjectEditor.exchangeItems(target.attr("id"), target.prev().attr("id"));
  },

  downItem: function (e) {
    var target = $(e.currentTarget).parent().parent();
    ProjectEditor.exchangeItems(target.attr("id"), target.next().attr("id"));
  },

  removeItem: function (e) {
    if (!window.confirm("are you sure to remove this item?")) {
      return;
    }
    var target = $(e.currentTarget.parentNode.parentNode);
    target.remove();
    ProjectController.updateIndex();
  },

  exchangeItems: function (sourceId, targetId) {
    if (sourceId >= 0 && targetId >= 0) {
      var source = $("#" + sourceId);
      var target = $("#" + targetId);
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
      ProjectController.updateIndex();
    }
  },

  upload: function (e) {
    var target = null;
    var text = "";
    if (ProjectEditor.upload_target) {
      target = ProjectEditor.upload_target.get(0);
      text += target.markdown + "\n\n";
    } else {
      //append a item via upload
      var content = $(".content:last");
      if (content.length == 0) {
        var item = ProjectController.append2dom("#noname image", true);
        ProjectController.updateIndex();
        content = $(item.find(".content"));
      }
      target = content.get(0);
      text += target.markdown + "\n\n";
      ProjectEditor.upload_target = $(target);
    }
    var file = this.files[0];

    var urlObject = window.URL ? window.URL : window.webkitURL;
    var url = urlObject.createObjectURL(file);
    if (file.type.match(/image.*/)) {
      text += "![" + file.name + "](" + url + ")";
    } else {
      text += "[" + file.name + "](" + url + ")";
    }
    ProjectController.updateItem(text, ProjectEditor.upload_target);
    if (!target.files) {
      target.files = {};
    }
    target.files[url] = file;
  }
};