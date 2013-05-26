<!DOCTYPE html>
<!-- This Source Code Form is subject to the terms of the Mozilla Public
   - License, v. 2.0. If a copy of the MPL was not distributed with this file,
   - You can obtain one at http://mozilla.org/MPL/2.0/.  -->
<html>
  <head>
    <meta charset="utf-8">
    <title data-l10n-id="title"></title>
    <link href='http://fonts.googleapis.com/css?family=Open+Sans' rel='stylesheet' type='text/css'>
    <link rel="stylesheet" href="css/common.css" type="text/css">
    <link rel="stylesheet" href="css/edits.css" type="text/css">
    <script type="text/javascript" src="js/jquery-1.9.1.min.js"></script>
    <script type="text/javascript" src="js/edits.js"></script>
    <meta name="viewport" content="width=device-width, user-scalable=no">
  </head>
  <body>
    <?php include('header.php.inc'); ?>
    <div id="main" role="main">
      <section id="meta">
        <div id="title">untitled</div>
        <div id="tags"></div>
        <div id="commit-button-container">
          <button id="commit-button">commit</button>
        </div>
      </section>

      <section id="process-list">
        <ul></ul>
      </section>

      <section id="form">
        <div id="textarea-container">
          <textarea id="textarea"></textarea><div class="right"><button id="append-button">append</button></div>
        </div>
        <!--
        <div id="upload-container"><label id="upload-label">upload files</label><input id="upload" name="file" type="file" /></div>
        -->
        <input id="upload" name="file" type="file" />
      </section>
    </div>
    <?php include('footer.php.inc'); ?>
  </body>
</html>
