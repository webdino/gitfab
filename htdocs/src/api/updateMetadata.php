<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $tagstring = $_GET["tags"];
  $avatar = $_GET["avatar"];
  $thumbnail = $_GET["thumbnail"];
  $thumbnailAspect = $_GET["thumbnailAspect"];
  $branch = $_GET["branch"];

  include_once('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $connection = openConnection();
//    $connection -> beginTransaction();
    $repository = $repository != null ? trim($repository) : "";
    $branch = $branch != null ? trim($branch) : "";

    $query = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
    $statement4select = $connection -> prepare($query);
    $statement4select -> execute(array($owner, $repository, $branch));
    $id = -1;
    if ($row = $statement4select -> fetch(PDO :: FETCH_ASSOC)) {
      $id = $row["id"];
    } 
    $statement4select -> closeCursor();

    $query = "UPDATE repositories SET avatar=?,thumbnail=?,aspect=?,updated=CAST(now() AS DATETIME) WHERE id=?";
    $statement4update = $connection -> prepare($query);
    $statement4update -> execute(array($avatar, $thumbnail, $thumbnailAspect, $id));

    $query = "DELETE FROM tags WHERE repository_id=?";
    $statement4delete = $connection -> prepare($query);
    $statement4delete -> execute(array($id));

    $tags = array();
    $tagarray = split(",", $tagstring);
    for ($i = 0, $n = count($tagarray); $i < $n; $i++) {
      $tag = trim($tagarray[$i]);
      if (strlen($tag) == 0) {
        continue;
      } 
      $tags[] = $tag;
    } 

    $tagLength = count($tags);
    if($tagLength != 0) {
      $query = "INSERT INTO tags(name,repository_id) VALUES ";
      $parameter = array();
      for ($i = 0; $i < $tagLength; $i++) {
        if ($i != 0) {
          $query .= ",";
        } 
        $tag = $tags[$i];
        $query .= "(?,?)";
        $parameter[] = $tag;
        $parameter[] = $id;
      } 
      $statement4insert = $connection -> prepare($query);
      $statement4insert -> execute($parameter);
    }

//    $connection -> commit();
    closeConnection($connection);
    $result["ok"] = "ok";
  } catch (PDOException $e) {
    $result["error"] = $e->getMessage();
    closeConnection($connection);
//    $connection -> rollBack();
  }

  echo json_encode($result);
?>
