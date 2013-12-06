<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $branch = $_GET["branch"];

  include_once('localDatabaseFunctions.php.inc');
  try {
    $connection = openConnection();
    $query = "INSERT INTO repositories(owner,name,branch,created,updated) VALUES (?,?,?,CAST(now() AS DATETIME),CAST(now() AS DATETIME))";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($owner, $repository, $branch));
    closeConnection($connection);
    include('updateMetadata.php');
  } catch (PDOException $e) {
    $result = array();
    $result["error"] = $e->getMessage();
    echo json_encode($result);
  }
?>
