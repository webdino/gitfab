<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $oldrepository = $_GET["oldrepository"];
  $tags = $_GET["tags"];
  $avatar = $_GET["avatar"];
  $thumbnail = $_GET["thumbnail"];

  include('local-database-functions.php.inc');
  $result = array();
  try {
    updateRepository($owner, $repository, $oldrepository, $tags, $avatar, $thumbnail);
    $result["ok"] = "ok";
  } catch (Exception $e) {
    $result["error"] = $e;
  }

  echo json_encode($result);
?>