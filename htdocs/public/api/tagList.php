<?php
  if(isset($_GET["owner"])){
    $owner = $_GET["owner"];
  }
  $result = array();
  try {
        include('localDatabaseFunctions.php.inc');
        $connection = openConnection();
        $query = "SELECT T.name AS tag, COUNT(T.name) AS c FROM tags AS T";
        $parameter = array();
        if ($owner) {
            $query .= " , repositories AS R";
            $query .= " WHERE T.repository_id=R.id AND R.owner=?";
            $parameter[] = $owner;
        } 
        $query .= " GROUP BY T.name";
        $statement = $connection -> prepare($query);
        $statement -> execute($parameter);
        $tags = array();
        while ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
            $tags[] = array("tag" => $row["tag"], "count" => intval($row["c"]));
        } 
        $statement -> closeCursor();
        closeConnection($connection);
        $tags;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        $result["error"] = $e->getMessage();
    } 
    $result["tagList"] = $tags;
  echo json_encode($result);
?>
