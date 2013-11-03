<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $branch = $_GET["branch"];

  include('local-database-functions.php.inc');
  $result = array();
  try {
    $result = newProject($owner,$repository,$branch);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>