<?php
  $code = $_GET["code"];

  $ch = curl_init();

  //token ----------
  $parameter = array(
    "code" => $code,
    "client_id" => "8195addbac8300264b41",
    "client_secret" => "a6443ae5dc56a838c246fe7930dec5e753892771"
  );
  $parameter = http_build_query($parameter, "", "&");

  curl_setopt($ch, CURLOPT_URL, "https://github.com/login/oauth/access_token");
  curl_setopt($ch, CURLOPT_POSTFIELDS, $parameter);
  curl_setopt($ch, CURLOPT_POST, 1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
  $tokenContents = curl_exec($ch);
  preg_match('/access_token=([^&]+)/', $tokenContents, $matches);
  $token = $matches[1];

  //user name
  $result = array();
  if ($token) {
    curl_setopt($ch, CURLOPT_URL, "https://api.github.com/user?access_token=".$token);
    curl_setopt($ch, CURLOPT_HTTPGET, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
    $userContents = curl_exec($ch);
    $userJson = json_decode($userContents);

    if (isset($userJson->{"message"})) {
      $result["error"] = $userJson->{"message"};
    } else {
      $result["token"] = $token;
      $result["user"] = $userJson->{"login"};

      session_start();
      $_SESSION["user"] = $result["user"];
      $_SESSION["token"] = $result["token"];
    }
  } else {
    $result["error"] = $tokenContents;
  }
  curl_close($ch);

  echo json_encode($result);
?>