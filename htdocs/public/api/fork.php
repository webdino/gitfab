<?php
  $parentOwner = $_GET["parentOwner"];
  $parentRepository = $_GET["parentRepository"];
  $parentBranch = $_GET["parentBranch"];
  $childOwner = $_GET["childOwner"];
  $childRepository = $_GET["childRepository"];
  $childBranch = $_GET["childBranch"];

  include_once('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();

    $query4id = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
    $statement4parent = $connection -> prepare($query4id);
    $statement4parent -> execute(array($parentOwner, $parentRepository, $parentBranch));
    $parentID = -1;
    if ($row = $statement4parent -> fetch(PDO :: FETCH_ASSOC)) {
      $parentID = $row["id"];
    } 
    $statement4parent -> closeCursor();

    $statement4child = $connection -> prepare($query4id);
    $statement4child -> execute(array($childOwner, $childRepository, $childBranch));
    $childID = -1;
    if ($row = $statement4child -> fetch(PDO :: FETCH_ASSOC)) {
      $childID = $row["id"];
    } 
    $statement4child -> closeCursor();

    $query4insert = "INSERT INTO forks (parent_id,child_id) VALUES(?,?)";
    $statement4insert = $connection -> prepare($query4insert);
    $statement4insert -> execute(array($parentID, $childID));

    closeConnection($connection);
    $result["ok"] = "ok";
  } catch (PDOException $e) {
    $result["error"] = $e->getMessage();
    closeConnection($connection);
  }

  echo json_encode($result);
?>
