<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $oldrepository = $_GET["oldrepository"];
  $tags = $_GET["tags"];
  $avatar = $_GET["avatar"];
  $thumbnail = $_GET["thumbnail"];
  $branch = $_GET["branch"];


  include('local-database-functions.php.inc');
  $result = array();
  dbg("---------------updateMetaData----");
  dbg($owner); dbg($repository); dbg($oldrepository); dbg($branch);
    dbg("-------------------");

  try {
    updateRepository($owner, $repository, $oldrepository, $branch, $tags, $avatar, $thumbnail);
    $result["ok"] = "ok";
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }

  echo json_encode($result);
  dbg($result);
?>