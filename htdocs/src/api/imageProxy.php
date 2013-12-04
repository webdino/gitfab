<?php
  $url = $_GET['url'];
  $url = rawurldecode($url);
  echo file_get_contents($url);
?>