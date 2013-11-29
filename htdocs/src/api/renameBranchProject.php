<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $newBranch = $_GET["newBranch"];
  $previousBranch = $_GET["previousBranch"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
    $connection -> beginTransaction();

    $query = "UPDATE repositories SET branch=? WHERE owner=? AND name=? AND branch=?";

    $statement = $connection -> prepare($query);
    $statement -> execute(array($newBranch, $owner, $repository, $previousBranch));
    $connection -> commit();
    closeConnection($connection);
  } 
  catch (PDOException $e) {
    $connection -> rollBack();
    $result["error"] = $e->getMessage();
    closeConnection($connection);
  } 
  echo json_encode($result);
?>