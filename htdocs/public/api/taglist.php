<?php

  if(isset($_GET["owner"])){
    $owner = $_GET["owner"];
  }
  include('localDatabaseFunctions.php.inc');
  $result = array();
  try {
    $taglist = getTagList($owner);
    $result["taglist"] = $taglist;
  } catch (Exception $e) {
    $result["error"] = $e->getMessage();
  }

  echo json_encode($result);
?>