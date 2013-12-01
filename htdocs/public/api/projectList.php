<?php
  $owner = $_GET["owner"];
  $tag = $_GET["tag"];
  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
    $query = "SELECT R.id,R.owner,R.name,R.avatar,R.thumbnail,R.aspect,R.created,R.updated,R.branch FROM repositories AS R";
    $query4tags = "SELECT name FROM tags WHERE repository_id=?";
    $parameter = array();
    if ($owner) {
      $query .= " WHERE R.owner=?";
      $parameter[] = $owner;
    } else if ($tag) {
      $query .= ",tags AS T WHERE T.repository_id=R.id AND T.name=?";
      $parameter[] = $tag;
    } 
    $query .= " ORDER BY updated DESC";
    $statement = $connection -> prepare($query);
    $statement -> execute($parameter);
    $projectList = array();
    while ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
      $param4tags = array($row["id"]);
      $statement4tags = $connection -> prepare($query4tags);
      $statement4tags -> execute($param4tags);
      $tags = array();
      while ($row4tags = $statement4tags -> fetch(PDO :: FETCH_ASSOC)) {
        $tags[] = $row4tags["name"];
      } 
      $statement4tags -> closeCursor();
      
      $projectList[] = array("owner" => $row["owner"], "name" => $row["name"], "avatar" => $row["avatar"], "thumbnail" => $row["thumbnail"], "aspect" => $row["aspect"], "created" => $row["created"], "updated" => $row["updated"], "tags" => $tags, "branch" => $row["branch"]);
    } 
    $statement -> closeCursor();
    closeConnection($connection);
    $result["projectList"] = $projectList;
  } 
  catch (PDOException $e) {
    $connection -> rollBack();
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
  ?>
