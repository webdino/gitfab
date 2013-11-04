<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $oldrepository = $_GET["oldrepository"];
  $tags = $_GET["tags"];
  $avatar = $_GET["avatar"];
  $thumbnail = $_GET["thumbnail"];
  $branch = $_GET["branch"];


  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    updateRepository($owner, $repository, $oldrepository, $branch, $tags, $avatar, $thumbnail);
    $result["ok"] = "ok";
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }

  echo json_encode($result);
?>