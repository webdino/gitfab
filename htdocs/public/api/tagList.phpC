<?php
  if(isset($_GET["owner"])){
    $owner = $_GET["owner"];
  }
  $result = array();
  try {
    include('localDatabaseFunctions.php.inc');
    $taglist = getTagList($owner);
    $result["taglist"] = $taglist;
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }
  echo json_encode($result);
?>