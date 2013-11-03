<?php
  $code = $_GET["code"];
  $url = "https://github.com/login/oauth/access_token";

  $data = array(
    "code" => $code,
    "client_id" => "8195addbac8300264b41",
    "client_secret" => "a6443ae5dc56a838c246fe7930dec5e753892771"
  );
  $data = http_build_query($data, "", "&");

  $header = array(
    "Content-Type: application/x-www-form-urlencoded",
    "Content-Length: ".strlen($data)
  );
  
  $options = array(
    "http" => array(
       "method"  => "POST",
       "header"  => implode("\r\n", $header),
       "content" => $data
    )
  );
  $context = stream_context_create($options);
  $result = file_get_contents($url, false, $context);

  //retrieves the token
  preg_match('/access_token=([^&]+)/', $result, $matches);
  $token = $matches[1];

  $valuemap = array();
  if ($token) {
    $valuemap["token"] = $token;
  } else {
    $valuemap["error"] = $result;
  }

  echo json_encode($valuemap);
?>