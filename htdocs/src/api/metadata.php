<?php
  $owner = $_GET["owner"];
  $name = $_GET["repository"];

  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
        $connection = openConnection();
        $query = "SELECT id,avatar,thumbnail,created,updated FROM repositories WHERE owner=? AND name=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($owner, $name));
        $result = array();
        if ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
            $result["avatar"] = $row["avatar"];
            $result["thumbnail"] = $row["thumbnail"];
            $result["created"] = $row["created"];
            $result["updated"] = $row["updated"];
 
            $query4tags = "SELECT name FROM tags WHERE repository_id=?";
            $param4tags = array($row["id"]);
            $statement4tags = $connection -> prepare($query4tags);
            $statement4tags -> execute($param4tags);
            $tags = array();
            while ($row4tags = $statement4tags -> fetch(PDO :: FETCH_ASSOC)) {
                $tags[] = $row4tags["name"];
            } 
            $statement4tags -> closeCursor();
            $result["tags"] = $tags;
        } 
        $statement -> closeCursor();
 
        closeConnection($connection);
        $result["metadata"] = $result;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        $result["error"] = $e->getMessage();
    }

  echo json_encode($result);
?>
