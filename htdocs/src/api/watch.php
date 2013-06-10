<?php
$owner = $_GET["owner"];
$repository = $_GET["repository"];

$username = "gitfab";
$password = "XXXXXXXX";
$url = "https://api.github.com/repos/$owner/$repository/subscription";
$parameters = json_encode(array("subscribed"=>true, "ignored"=>false));

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "PUT");
curl_setopt($ch, CURLOPT_POSTFIELDS, $parameters);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
  "Content-Length: ".strlen($parameters)
));
curl_setopt($ch, CURLOPT_USERPWD, $username . ":" . $password);
$response = curl_exec($ch);
curl_close($ch);
header("Content-type: application/json");
echo $response;
?>