<?php
function openConnection() { 
  $url = parse_url(getenv("CLEARDB_DATABASE_URL"));
  $server = $url["host"];
  $username = $url["user"];
  $password = $url["pass"];
  $db = substr($url["path"],1);
  $dsn = "mysql:dbname=".$db.";host=".$server;
  $connection = new PDO($dsn, $username, $password);
  return $connection;
}

function closeConnection($connection) { 
}

function findRepository($owner, $name, $connection) {
  $query = "SELECT id FROM repositories WHERE owner=? AND name=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($owner, $name));
  $id = -1;
  if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
    $id = $row["id"];
  }
  $statement->closeCursor();
  return $id;
}

function newRepository($owner, $name, $connection) {
  $query = "INSERT INTO repositories(owner,name,created,updated) VALUES (?,?,CAST(now() AS DATETIME),CAST(now() AS DATETIME))";
  $statement = $connection->prepare($query);
  $statement->execute(array($owner, $name));
}

function renameRepository($id, $name, $connection) {
  $query = "UPDATE repositories SET name=?,updated=CAST(now() AS DATETIME) WHERE id=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($name, $id));
}

function deleteRepository($id, $connection) {
  $query = "DELETE FROM tags WHERE repository_id=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($id));
  $query = "DELETE FROM repositories WHERE id=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($id));
}

function updateRepositoryMeta($id, $avatar, $thumbnail, $connection) {
  $query = "UPDATE repositories SET avatar=?,thumbnail=?,updated=CAST(now() AS DATETIME) WHERE id=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($avatar, $thumbnail, $id));
}

function removeTags($id, $connection) {
  $query = "DELETE FROM tags WHERE repository_id=?";
  $statement = $connection->prepare($query);
  $statement->execute(array($id));
}

function appendTags($id, $tagstring, $connection) {
  //tag
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
  if ($tagLength == 0) {
    return;
  }

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
  $statement = $connection->prepare($query);
  $statement->execute($parameter);
}

function updateRepository($owner, $name, $oldname, $tags, $avatar, $thumbnail) {

  try {
    $connection = openConnection();
    $connection->beginTransaction();

    $id = -1;
    $oldname = $oldname != NULL ? trim($oldname) : "";
    $name = $name != NULL ? trim($name) : "";
    if (strlen($oldname) != 0) {
      $id = findRepository($owner, $oldname, $connection);
      if (strlen($name) != 0) {
        renameRepository($id, $name, $connection);
      } else {
        deleteRepository($id, $connection);
      }
    } else {
      $id = findRepository($owner, $name, $connection);
    }
    if ($id == -1) {
    //new
      newRepository($owner, $name, $connection);
      $id = findRepository($owner, $name, $connection);
    } else {
    //remove tags
      removeTags($id, $connection);
    }

    updateRepositoryMeta($id, $avatar, $thumbnail, $connection);
    appendTags($id, $tags, $connection);

    $connection->commit();
    closeConnection($connection);
  } catch (PDOException $e) {
    $connection->rollBack();
    throw $e;
  }
}

function getMetaData($owner, $name) {
  try {
    $connection = openConnection();

    $query = "SELECT id,avatar,thumbnail,created,updated FROM repositories WHERE owner=? AND name=?";
    $statement = $connection->prepare($query);
    $statement->execute(array($owner, $name));
    $result = array();
    if ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
      $result["avatar"] = $row["avatar"];
      $result["thumbnail"] = $row["thumbnail"];
      $result["created"] = $row["created"];
      $result["updated"] = $row["updated"];

      $query4tags = "SELECT name FROM tags WHERE repository_id=?";
      $param4tags = array($row["id"]);
      $statement4tags = $connection->prepare($query4tags);
      $statement4tags->execute($param4tags);
      $tags = array();
      while ($row4tags = $statement4tags->fetch(PDO::FETCH_ASSOC)) {
        $tags[] = $row4tags["name"];
      }
      $statement4tags->closeCursor();
      $result["tags"] = $tags;
    }
    $statement->closeCursor();

    closeConnection($connection);

    return $result;
  } catch (PDOException $e) {
    $connection->rollBack();
    throw $e;
  }
}

function getProjectList($owner, $tag) {
  try {
    $connection = openConnection();

    $query = "SELECT R.id,R.owner,R.name,R.avatar,R.thumbnail,R.aspect,R.created,R.updated FROM repositories AS R";
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
    $statement = $connection->prepare($query);
    $statement->execute($parameter);
    $projectList = array();
    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
      $param4tags = array($row["id"]);
      $statement4tags = $connection->prepare($query4tags);
      $statement4tags->execute($param4tags);
      $tags = array();
      while ($row4tags = $statement4tags->fetch(PDO::FETCH_ASSOC)) {
        $tags[] = $row4tags["name"];
      }
      $statement4tags->closeCursor();

      $projectList[] = array("owner"=>$row["owner"],"name"=>$row["name"],"avatar"=>$row["avatar"],"thumbnail"=>$row["thumbnail"],"aspect"=>$row["aspect"],"created"=>$row["created"],"updated"=>$row["updated"], "tags"=>$tags);
    }
    $statement->closeCursor();

    closeConnection($connection);

    return $projectList;
  } catch (PDOException $e) {
    $connection->rollBack();
    throw $e;
  }
}

function getTagList($owner) {
  try {
    $connection = openConnection();

    $query = "SELECT T.name AS tag, COUNT(T.name) AS c FROM tags AS T";
    $parameter = array();
    if ($owner) {
      $query .= " , repositories AS R";
      $query .= " WHERE T.repository_id=R.id AND R.owner=?";
      $parameter[] = $owner;
    }
    $query .= " GROUP BY T.name";

    $statement = $connection->prepare($query);
    $statement->execute($parameter);
    $tags = array();
    while ($row = $statement->fetch(PDO::FETCH_ASSOC)) {
      $tags[] = array("tag"=>$row["tag"], "count"=>intval($row["c"]));
    }
    $statement->closeCursor();

    closeConnection($connection);

    return $tags;
  } catch (PDOException $e) {
    $connection->rollBack();
    throw $e;
  }
}
?>