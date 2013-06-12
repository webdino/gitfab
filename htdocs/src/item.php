<!DOCTYPE html>
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this file,
   - You can obtain one at http://mozilla.org/MPL/2.0/.  -->
<html>
  <head>
    <meta charset="utf-8">
    <title data-l10n-id="title">gitfab | item</title>
    <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="css/common.css" type="text/css">
    <link rel="stylesheet" href="css/item.css" type="text/css">
    <script type="text/javascript" src="js/lib/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="js/lib/markdown.js"></script>
    <script type="text/javascript" src="js/lib/base64.js"></script>
    <script type="text/javascript" src="js/common.js"></script>
    <script type="text/javascript" src="js/item.js"></script>
    <meta name="viewport" content="width=device-width, user-scalable=no">
  </head>
  <body>
    <?php include('header.php.inc'); ?>
    <?php include('toolbar.php.inc'); ?>
    <div id="main" role="main">
      <div id="item">
        <section id="tools">
          <a id="fork" href="#">fork</a>
        </section>
        <section id="meta">
          <div id="owner"></div> / <div id="title"></div>
          <div id="tags"></div>
          <div id="commit-button-container">
            <button id="commit-button">commit</button>
          </div>
        </section>
        <section id="process-list">
          <ul id="process-list-ul"></ul>
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
    <?php include('footer.php.inc'); ?>
  </body>
</html>
