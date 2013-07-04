<?php
function openConnection() { 
  $url = parse_url(getenv("CLEARDB_DATABASE_URL"));
  $server = $url["host"];
  $username = $url["user"];
  $password = $url["pass"];
  $db = substr($url["path"],1);
  $connection = mysql_connect($server, $username, $password);
  throwError($connection);
  mysql_select_db($db, $connection);
  throwError($connection);
  return $connection;
}

function closeConnection($connection) { 
  mysql_close($connection);
}

function throwError($connection) {
  if (mysql_errno($connection)) {
    throw new Exception("ERROR:".mysql_errno($connection).":".mysql_error($connection));
  }
}

function findRepository($owner, $name, $connection) {
  $query = "SELECT id FROM repositories WHERE owner='".$owner."' AND name='".$name."'";
  $result = mysql_query($query, $connection);
  throwError($connection);
  $id = -1;
  if ($row = mysql_fetch_assoc($result)) {
    $id = $row["id"];
  }
  mysql_free_result($result);
  return $id;
}

function newRepository($owner, $name, $connection) {
  $query = "INSERT INTO repositories(owner,name) VALUES ('".$owner."','".$name."')";
  mysql_query($query, $connection);
  throwError($connection);
}

function renameRepository($id, $name, $connection) {
  $query = "UPDATE repositories SET name='".$name."' WHERE id=".$id;
  mysql_query($query, $connection);
  throwError($connection);
}

function removeTags($id, $connection) {
  $query = "DELETE FROM tags WHERE repository_id=".$id;
  mysql_query($query, $connection);
  throwError($connection);
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
  for ($i = 0; $i < $tagLength; $i++) {
    if ($i != 0) {
      $query .= ",";
    }
    $tag = $tags[$i];
    $query .= "('".$tag."',".$id.")";
  }
  mysql_query($query, $connection);
  throwError($connection);
}

function updateRepository($owner, $name, $oldname, $tags) {

  $connection = openConnection();

  $id = -1;
  $oldname = $oldname != NULL ? trim($oldname) : "";
  if (strlen($oldname) != 0) {
    //rename
    $id = findRepository($owner, $oldname, $connection);
    renameRepository($id, $name, $connection);
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

  appendTags($id, $tags, $connection);

  closeConnection($connection);
}

function getTags($owner) {

  $connection = openConnection();

  $query = "SELECT DISTINCT T.name AS tag FROM tags AS T, repositories AS R";
  if ($owner) {
    $query .= " WHERE T.repository_id=R.id AND R.owner='".$owner."'";
  }
  $result = mysql_query($query, $connection);
  throwError($connection);
  $tags = array();
  while ($row = mysql_fetch_assoc($result)) {
    $tags[] = $row["tag"];
  }
  mysql_free_result($result);

  closeConnection($connection);

  return $tags;
}
?>