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

function removeTags($id, $connection)
{
    $query = "DELETE FROM tags WHERE repository_id=?";
    $statement = $connection -> prepare($query);
    $statement -> execute(array($id));
} 
 
?>
