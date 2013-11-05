<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $newBranch = $_GET["newBranch"];
  $oldBranch = $_GET["oldBranch"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $result = renameBranch($owner,$repository,$newBranch,$oldBranch);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>