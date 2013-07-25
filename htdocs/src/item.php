<!DOCTYPE html>
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this file,
   - You can obtain one at http://mozilla.org/MPL/2.0/.  -->
<html>
  <head>
    <meta charset="utf-8">
    <title data-l10n-id="title">gitfab</title>
    <link href='http://fonts.googleapis.com/css?family=Open+Sans:400,300' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="/css/common.css" type="text/css">
    <link rel="stylesheet" href="/css/item.css" type="text/css">
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
    <link rel="stylesheet" href="/api/user-css.php?owner=<?php echo $_GET["owner"] ?>&repository=<?php echo $_GET["repository"] ?>" type="text/css">
<?php } ?>
    <script type="text/javascript" src="/js/lib/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="/js/lib/showdown.js"></script>
    <script type="text/javascript" src="/js/lib/base64.js"></script>
    <script type="text/javascript" src="/js/common.js"></script>
    <script type="text/javascript" src="/js/item.js"></script>
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
          <button id="fork-button">fork</button>
          <button id="delete-button">delete</button>
          <button id="commit-button">commit</button>
        </section>
        <div id="item">
          <div id="customize-css"><span>customize css</span></div>
          <section id="meta">
            <img id="avatar">
            <div id="headline">
              <div id="owner"></div>
               / 
              <div id="repository"></div>
            </div>
            <div id="tags"></div>
          </section>
          <section id="index">
            <h1>index</h1>
            <ul></ul>
          </section>
<?php if (isset($_GET["owner"]) && isset($_GET["repository"])) {?>
          <section id="gitfab-document"><?php include('./api/gitfab-document.php'); ?></section>
<?php } ?>
          <section id="section-list">
            <ul id="section-list-ul"></ul>
          </section>
          <section id="form">
            <div id="textarea-container">
              <textarea id="textarea"></textarea><div class="right"><button id="append-button">append</button></div>
            </div>
            <div id="upload-container">
              <div id="upload-button" class="button upload"></div>
            </div>
            <input id="upload" name="file" type="file" />
          </section>
        </div>
      </div>
      <div id="sub">
        <div id="parent-item-label"></div>
        <div id="parent-item" class="item">
        </div>
        <hr/>
        <div id="child-item-list-label"></div>
        <div id="child-item-list">
        </div>
      </div>
    </div>
    <?php include('footer.php.inc'); ?>
    <?php include('logger.php.inc'); ?>
  </body>
</html>
