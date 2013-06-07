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
  
  $opions = array(
    "http" => array(
       "method"  => "POST",
       "header"  => implode("\r\n", $header),
       "content" => $data
    )
  );
  $context = stream_context_create($opions);
  $result = file_get_contents($url, false, $context);
  echo $result;
?>