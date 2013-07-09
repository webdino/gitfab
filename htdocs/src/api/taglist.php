<?php
  $owner = $_GET["owner"];

  include('local-database-functions.php.inc');
  $result = array();
  try {
    $taglist = getTagList($owner);
    $result["taglist"] = $taglist;
  } catch (Exception $e) {
    $result["error"] = $e;
  }

  echo json_encode($result);
?>