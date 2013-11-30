<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $branch = $_GET["branch"];

  $owner = trim($owner);
  $repository = trim($repository);
  $branch = trim($branch);
  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
      $connection = openConnection();
      $connection -> beginTransaction();
 
      $query = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
      $statement = $connection -> prepare($query);
      $statement -> execute(array($owner, $repository, $branch));
      $id = -1;
      if ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
          $id = $row["id"];
      } 
      $statement -> closeCursor();
      $query = "DELETE FROM tags WHERE repository_id=?";
      $statement = $connection -> prepare($query);
      $statement -> execute(array($id));
      $query = "DELETE FROM repositories WHERE id=?";
      $statement = $connection -> prepare($query);
      $statement -> execute(array($id));
 
      $connection -> commit();
      closeConnection($connection);
      $result = $statement;
    } 
    catch (PDOException $e) {
      $connection -> rollBack();
      $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>
