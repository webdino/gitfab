<?php
  $url = $_GET['url'];
  $url = rawurldecode($url);
  preg_match("/([^\/]+)$/", $url, $matches);
  $originalFileName = $matches[0];
  $filename = urlencode($originalFileName);
  $url = str_replace($originalFileName, $filename, $url);
  echo file_get_contents($url);
?>