<?php session_start(); ?>
<!DOCTYPE html>
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this file,
   - You can obtain one at http://mozilla.org/MPL/2.0/.  -->
<html>
  <head>
    <meta charset="utf-8">
    <title data-l10n-id="title">gitFAB</title>  
    <!-- development -->
    <link rel="stylesheet" href="/css/common.css" type="text/css">
    <link rel="stylesheet" href="/css/projectEditor.css" type="text/css">
    <link rel="stylesheet" href="/css/project.css" type="text/css">
    <link rel="stylesheet" href="/css/gridLayout.css" type="text/css">
    <link rel="stylesheet" href="/css/slide.css" type="text/css">
    <link rel="stylesheet" href="/css/logger.css" type="text/css">
    <script type="text/javascript" src="/js/lib/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/js/lib/base64.js"></script>
    <script type="text/javascript" src="/js/lib/showdown-dev.js"></script>
    <script type="text/javascript" src="/js/common.js"></script>
    <script type="text/javascript" src="/js/projectEditor.js"></script>
    <script type="text/javascript" src="/js/project.js"></script>
    <script type="text/javascript" src="/js/gridLayout.js"></script>
    <script type="text/javascript" src="/js/slide.js"></script>
    <script type="text/javascript" src="/js/logger.js"></script>
    <!-- release -->
    <!--
    <link rel="stylesheet" href="/css/project.min.css" type="text/css">
    <script type="text/javascript" src="/js/require.min.js"></script>
    <script type="text/javascript" src="/js/main-project.min.js"></script>
    -->
    <script>
<?php include('scriptVariables.php.inc'); ?>
    </script>
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
    <link rel="stylesheet" href="/api/userCss.php?owner=<?php echo $_GET["owner"] ?>&repository=<?php echo $_GET["repository"] ?>" type="text/css">
<?php } ?>
    <meta name="viewport" content="width=device-width, user-scalable=no">
  </head>
  <body>
    <canvas id="canvas" style="display:none;"></canvas>
    <?php include('header.php.inc'); ?>
    <?php include('toolBar.php.inc'); ?>
    <div id="contents">
      <div id="main" role="main">
        <div id="project">
          <section id="meta">
            <img id="thumbnail"></img>
            <div class="container">
              <div id="repository"></div>
              <div id="tags"></div>
              <div id="owner"></div>
            </div>
          </section>
          <section id="tools">
            <a id="slide-button" class="button">slide show</a>
            <a id="customize-css" class="button">customize css</a>
            <a id="delete-button" class="button">delete</a>
            <a id="fork-button" class="button">fork</a>
            <a id="commit-button" class="button">commit</a>
          </section>
          <section id="index">
            <ul></ul>
          </section>
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
          <section id="gitfab-document"><?php include('./api/gitfabDocument.php'); ?></section>
<?php } ?>
          <section id="item-list">
            <ul id="item-list-ul"></ul>
          </section>
          <section id="form">
            <div id="form-tools">
              <div id="append-heading">heading</div>
              <div id="append-text">text</div>
              <div id="append-markdown">markdown</div>
              <div id="append-file">file</div>
            </div>
            <div id="textform-container">
              <div id="textform-label"></div>
              <textarea rows="5" id="textarea"></textarea>
              <input id="textfield"></input>
              <div id="append-button" class="button">append</div>
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
