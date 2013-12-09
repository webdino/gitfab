<?php
  $owner = $_GET["owner"];
  $name = $_GET["repository"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
        $connection = openConnection();
        $query = "SELECT R.id,R.owner,R.name,R.branch FROM repositories AS R";
        $parameter = array();
        if ($owner) {
            $query .= " WHERE R.owner=? AND R.name=?";
            $parameter[] = $owner;
            $parameter[] .= $name;
        } 
        $query .= " ORDER BY updated DESC";
        $statement = $connection -> prepare($query);
        $statement -> execute($parameter);
        $projectList = array();
 
        while ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
            $projectList[] = array("id" => $row["id"],
                "owner" => $row["owner"],
                "name" => $row["name"],
                "branch" => $row["branch"]);
        } 
        $statement -> closeCursor();
        closeConnection($connection);
        $result["branches"] = $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        $result["error"] = $e->getMessage();
    }

  echo json_encode($result);
?>
