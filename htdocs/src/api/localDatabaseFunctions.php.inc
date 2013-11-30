<?php
function openConnection()
{
    date_default_timezone_set("Asia/Tokyo");
    $url = parse_url(getenv("CLEARDB_DATABASE_URL"));
    $server = $url["host"];
    $username = $url["user"];
    $password = $url["pass"];
    $db = substr($url["path"], 1);
    $dsn = "mysql:dbname=" . $db . ";host=" . $server;
    $connection = new PDO($dsn, $username, $password);
    return $connection;
} 
 
function dbg($data)
{
    date_default_timezone_set("Asia/Tokyo");
    error_log(date("[Y/m/d H:i:s]") . rtrim(print_r($data, true)) . "\n", 3, '/var/tmp/app.log');
} 

function closeConnection($connection)
{
} 
 
function findRepository($owner, $name, $branch, $connection)
{
    $query = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($owner, $name, $branch));
    $id = -1;
    if ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
        $id = $row["id"];
    } 
    $statement -> closeCursor();
 
    return $id;
} 
 
function newRepository($owner, $name, $branch, $connection)
{
    $query = "INSERT INTO repositories(owner,name,branch,created,updated) VALUES (?,?,?,CAST(now() AS DATETIME),CAST(now() AS DATETIME))";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($owner, $name, $branch));
} 
 
function renameRepository($id, $name, $connection)
{
    $query = "UPDATE repositories SET name=?,updated=CAST(now() AS DATETIME) WHERE id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($name, $id));
} 
 
function deleteRepository($id, $connection)
{
    $query = "DELETE FROM tags WHERE repository_id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($id));
    $query = "DELETE FROM repositories WHERE id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($id));
} 

function renameBranch($owner, $repository, $newBranch, $oldBranch)
{
    try {
        $connection = openConnection();
        $connection -> beginTransaction();
        $id = findProject($owner, $repository, $oldBranch, $connection);
        $query = "UPDATE repositories SET branch=?,updated=CAST(now() AS DATETIME) WHERE id=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($newBranch, $id));
 
        $connection -> commit();
        closeConnection($connection);
        return $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function renameRepos($owner, $newRepository, $oldRepository, $branch)
{
    try {
        $connection = openConnection();
        $connection -> beginTransaction();
 
        $id = findProject($owner, $oldRepository, $branch, $connection);
        $query = "UPDATE repositories SET name=?,updated=CAST(now() AS DATETIME) WHERE id=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($newRepository, $id));
 
        $connection -> commit();
        closeConnection($connection);
        return $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function findProject($owner, $repository, $branch, $connection)
{
    $query = "SELECT id FROM repositories WHERE owner=? AND name=? AND branch=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($owner, $repository, $branch));
    $id = -1;
    if ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
        $id = $row["id"];
    } 
    $statement -> closeCursor();
    return $id;
} 
 
function updateMetaData($owner, $repository, $branch, $avatar, $thumbnail)
{
    try { // avatar ,thumbnail updated
        $connection = openConnection();
        $connection -> beginTransaction();
 
        $id = findProject($owner, $repository, $branch, $connection);
        $query = "UPDATE repositories SET avatar=?,thumbnail=?,updated=CAST(now() AS DATETIME) WHERE id=?";
        $statement = $connection -> prepare($query);
        $statement -> execute(array($avatar, $thumbnail, $id));
 
        $connection -> commit();
        closeConnection($connection);
        return $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 

function updateRepositoryMeta($id, $avatar, $thumbnail, $thumbnailAspect, $connection)
{
    $query = "UPDATE repositories SET avatar=?,thumbnail=?,aspect=?,updated=CAST(now() AS DATETIME) WHERE id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($avatar, $thumbnail, $thumbnailAspect, $id));
} 
 
function removeTags($id, $connection)
{
    $query = "DELETE FROM tags WHERE repository_id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($id));
} 
 
function appendTags($id, $tagstring, $connection)
{ 
    // tag
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
    $statement = $connection -> prepare($query);
    $statement -> execute($parameter);
} 
 
function updateRepository($owner, $name, $oldname, $branch, $tags, $avatar, $thumbnail, $thumbnailAspect)
{
    try {
        $connection = openConnection();
        $connection -> beginTransaction();
        $id = -1;
        $oldname = $oldname != null ? trim($oldname) : "";
        $name = $name != null ? trim($name) : "";
        $branch = $branch != null ? trim($branch) : "";
 
        if (strlen($oldname) != 0) {
            $id = findRepository($owner, $oldname, $branch, $connection);
            if (strlen($name) != 0) {
                renameRepository($id, $name, $connection);
            } else {
                deleteRepository($id, $connection); //name がなくて oldname があるとき
            } 
        } else {
            $id = findRepository($owner, $name, $branch, $connection);
        } 
        if ($id == -1) {
            newRepository($owner, $name, $branch, $connection); //oldname がなくて name が見当たらない
            $id = findRepository($owner, $name, $branch, $connection);
        } else {
            // remove tags
            removeTags($id, $connection);
        } 
 
        updateRepositoryMeta($id, $avatar, $thumbnail, $thumbnailAspect, $connection);
        appendTags($id, $tags, $connection);
 
        $connection -> commit();
        closeConnection($connection);
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function getMetaData($owner, $name)
{
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
 
        return $result;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function getBranches($owner, $name)
{
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
        return $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function getProjectList($owner, $tag)
{
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
        return $projectList;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
function getTagList($owner)
{
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
        $statement = $connection -> prepare($query);
        $statement -> execute($parameter);
        $tags = array();
        while ($row = $statement -> fetch(PDO :: FETCH_ASSOC)) {
            $tags[] = array("tag" => $row["tag"], "count" => intval($row["c"]));
        } 
        $statement -> closeCursor();
        closeConnection($connection);
        return $tags;
    } 
    catch (PDOException $e) {
        $connection -> rollBack();
        throw $e;
    } 
} 
 
?>
