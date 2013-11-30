<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $branch = $_GET["branch"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
    $connection -> beginTransaction();
 
    $query = "INSERT INTO repositories(owner,name,branch,created,updated) VALUES (?,?,?,CAST(now() AS DATETIME),CAST(now() AS DATETIME))";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($owner, $repository, $branch));
    $connection -> commit();
    closeConnection($connection);
    $result["projectList"] = $projectList;
  } catch (PDOException $e) {
    $result["error"] = $e->getMessage();
    $connection -> rollBack();      
  }
  echo json_encode($result);
?>
