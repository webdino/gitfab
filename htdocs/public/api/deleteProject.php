<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $branch = $_GET["branch"];

  $owner = trim($owner);
  $repository = trim($repository);
  $branch = trim($branch);
  include('local-database-functions.php.inc');
  $result = array();
  try {
    $result = deleteProject($owner,$repository,$branch);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>