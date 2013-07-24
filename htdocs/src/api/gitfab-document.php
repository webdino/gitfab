<?php
  $owner = $_GET["owner"];
  $repository = $_GET["repository"];

  $url = "https://raw.github.com/".$owner."/".$repository."/master/README.md?".time();
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPGET, 1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
  $contents = curl_exec($ch);
  curl_close($ch);

  echo $contents;
?>