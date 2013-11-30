<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];
  $tagstring = $_GET["tags"];
  $avatar = $_GET["avatar"];
  $thumbnail = $_GET["thumbnail"];
  $thumbnailAspect = $_GET["thumbnailAspect"];
  $branch = $_GET["branch"];


  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
        $connection = openConnection();
        $connection -> beginTransaction();
        $repository = $repository != null ? trim($repository) : "";
        $branch = $branch != null ? trim($branch) : "";
        
        $query = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($owner, $repository, $branch));
        $id = -1;
        if ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
                $id = $row["id"];
        } 
        $statement -> closeCursor();
       
        $query = "UPDATE repositories SET avatar=?,thumbnail=?,aspect=?,updated=CAST(now() AS DATETIME) WHERE id=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($avatar, $thumbnail, $thumbnailAspect, $id));
       
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
                $statement = $connection -> prepare($query);
                $statement -> execute($parameter);

        }
 
        $connection -> commit();
        closeConnection($connection);
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        $result["error"] = $e->getMessage();
    }
    $result["ok"] = "ok";

  echo json_encode($result);
?>
