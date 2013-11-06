<?php
  $owner = $_GET["owner"];
  $name = $_GET["repository"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $result["metadata"] = getMetaData($owner, $name);
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }

  echo json_encode($result);
?>