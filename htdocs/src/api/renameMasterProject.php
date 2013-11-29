<?php
  $owner = $_GET["owner"];
  $newRepository = $_GET["newRepository"];
  $previousRepository = $_GET["previousRepository"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
    $connection -> beginTransaction();

    $query = "UPDATE repositories SET name=? WHERE owner=? AND name=?";

    $statement = $connection -> prepare($query);
    $statement -> execute(array($newRepository, $owner, $previousRepository));
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