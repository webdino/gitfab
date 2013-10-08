<?php session_start();
?>
<!DOCTYPE html>
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this file,
   - You can obtain one at http://mozilla.org/MPL/2.0/.  -->
<html>
  <head>
    <meta charset="utf-8">
    <title data-l10n-id="title">gitFAB</title>

    <link rel="stylesheet" href="/css/project.min.css" type="text/css">
    <!-- <link rel="stylesheet" href="/css/common.css" type="text/css"> -->
    <!-- <link rel="stylesheet" href="/css/project.css" type="text/css"> -->
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
    <link rel="stylesheet" href="/api/user-css.php?owner=<?php echo $_GET["owner"] ?>&repository=<?php echo $_GET["repository"] ?>" type="text/css">
<?php } ?>
    <script type="text/javascript" src="/js/require.min.js"></script>
    <script type="text/javascript" src="/js/main-project.min.js"></script>

    <script>
<?php include('script-variables.php.inc'); ?>
    </script>
    <meta name="viewport" content="width=device-width, user-scalable=no">
  </head>
  <body>
    <?php include('header.php.inc'); ?>
    <?php include('toolbar.php.inc'); ?>
    <div id="contents">
      <div id="main" role="main">
        <section id="tools">
          <button id="slide-button">slide show</button>
          <button id="fork-button">fork</button>
          <button id="delete-button">delete</button>
          <button id="commit-button">commit</button>
        </section>
        <div id="project">
          <div id="customize-css"><div class="text-button">customize css</div></div>
          <section id="meta">
            <img id="avatar" class="avatar">
            <div id="headline" class="headline">
              <div id="repository" class="repository"></div>
              <div id="owner" class="owner"></div>
              <div id="tags" class="tags"></div>
            </div>
          </section>
          <section id="index">
            <h1>index</h1>
            <ul></ul>
          </section>
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
          <section id="gitfab-document"><?php include('./api/gitfab-document.php'); ?></section>
<?php } ?>
          <section id="item-list">
            <ul id="item-list-ul"></ul>
          </section>
          <section id="form">
            <div id="textarea-container">
              <textarea id="textarea"></textarea><div class="right"><button id="append-button">append</button></div>
            </div>
            <div id="upload-container">
              <button id="upload-button">file upload</button>
            </div>
            <input id="upload" name="file" type="file" />
          </section>
        </div>

        <div id="facebook">
          <?php include('facebook.php.inc'); ?>
        </div>
        <div id="sub">
          <div id="parent-project-label"></div>
          <div id="parent-project" class="project">
          </div>
          <hr/>
          <div id="child-project-list-label"></div>
          <div id="child-project-list">
          </div>
        </div>
      </div>
    </div>
    <?php include('footer.php.inc'); ?>
    <?php include('logger.php.inc'); ?>
    <?php include('slide.php.inc'); ?>
  </body>
</html>
