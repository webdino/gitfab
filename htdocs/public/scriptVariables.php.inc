<?php

  if (isset($_GET["owner"])) {
    echo "    var OWNER = \"".htmlspecialchars($_GET["owner"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var OWNER = null;\n";
  }
  if (isset($_GET["repository"])) {
    echo "    var REPOSITORY = \"".htmlspecialchars($_GET["repository"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var REPOSITORY = null;\n";
  }
  if (isset($_GET["branch"])) {
    echo "    var BRANCH = \"".htmlspecialchars($_GET["branch"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var BRANCH = \"master\";\n";
  }
//  session_start();
  if (isset($_SESSION["user"])) {
    echo "    var USER = \"".htmlspecialchars($_SESSION["user"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var USER = null;\n";
  }
  if (isset($_SESSION["token"])) {
    echo "    var TOKEN = \"".htmlspecialchars($_SESSION["token"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var TOKEN = null;\n";
  }
  if (isset($_SESSION["avatar_url"])) {
    echo "    var AVATAR_URL = \"".htmlspecialchars($_SESSION["avatar_url"],ENT_QUOTES)."\";\n";
  } else {
    echo "    var AVATAR_URL = null;\n";
  }

?>