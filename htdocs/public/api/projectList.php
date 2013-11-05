<?php
  $owner = $_GET["owner"];
  $tag = $_GET["tag"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $result["projectList"] = getProjectList($owner, $tag);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
  //dbg($result);

?>