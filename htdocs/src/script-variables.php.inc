<?php

  if (isset($_GET["owner"])) {
    echo "    var OWNER = \"".$_GET["owner"]."\";\n";
  } else {
    echo "    var OWNER = null;\n";
  }
  if (isset($_GET["repository"])) {
    echo "    var REPOSITORY = \"".$_GET["repository"]."\";\n";
  } else {
    echo "    var REPOSITORY = null;\n";
  }
  
//  session_start();
  if (isset($_SESSION["user"])) {
    echo "    var USER = \"".$_SESSION["user"]."\";\n";
  } else {
    echo "    var USER = null;\n";
  }
  if (isset($_SESSION["token"])) {
    echo "    var TOKEN = \"".$_SESSION["token"]."\";\n";
  } else {
    echo "    var TOKEN = null;\n";
  }
  if (isset($_SESSION["avatar_url"])) {
    echo "    var AVATAR_URL = \"".$_SESSION["avatar_url"]."\";\n";
  } else {
    echo "    var AVATAR_URL = null;\n";
  }

?>