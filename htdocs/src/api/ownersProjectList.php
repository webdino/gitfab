<?php
  $owner = $_GET["owner"];
  $tag = $_GET["tag"];
  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
    $query = "SELECT R.name,R.branch FROM repositories AS R";
    $parameter = array();
    $query .= " WHERE R.owner=?";
    $parameter[] = $owner;

    $statement = $connection -> prepare($query);
    $statement -> execute($parameter);
    $projectList = array();
    while ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
      $projectList[] = array("name" => $row["name"], "branch" => $row["branch"]);
    } 
    $statement -> closeCursor();
    closeConnection($connection);
    $result["projectList"] = $projectList;
  } 
  catch (PDOException $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
  ?>
