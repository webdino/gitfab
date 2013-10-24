<?php
  $owner = $_GET["owner"];
  $newRepository = $_GET["newRepository"];
  $oldRepository = $_GET["oldRepository"];
  $branch = $_GET["branch"];

  include('local-database-functions.php.inc');
  $result = array();
  try {
    $result = renameRepos($owner,$newRepository,$oldRepository,$branch);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>