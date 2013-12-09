<?php
  session_start();
  $_SESSION["user"] = null;
  $_SESSION["token"] = null;
  $_SESSION["avatar_url"] = null;
  header('Location: /');
?>