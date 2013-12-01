<?php
function openConnection() {
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
 
function dbg($data) {
  date_default_timezone_set("Asia/Tokyo");
  error_log(date("[Y/m/d H:i:s]") . rtrim(print_r($data, true)) . "\n", 3, '/var/tmp/app.log');
} 

function closeConnection($connection) {
} 
?>
