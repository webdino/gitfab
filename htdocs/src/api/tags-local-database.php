<?php
  $owner = $_GET["owner"];

  include('local-database-functions.php.inc');
  $result = array();
  try {
    $tags = getTags($owner);
    $result["tags"] = $tags;
  } catch (Exception $e) {
    $result["error"] = $e;
  }

  echo json_encode($result);
?>