<?php
  $owner = htmlspecialchars($_GET["owner"],ENT_QUOTES);
  $repository = htmlspecialchars($_GET["repository"],ENT_QUOTES);
  $branch = htmlspecialchars($_GET["branch"],ENT_QUOTES);
  require_once('lib/htmlpurifier/library/HTMLPurifier.auto.php');

  $url = "https://raw.github.com/".$owner."/".$repository."/".$branch."/README.md?".time();
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_HTTPGET, 1);
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_FAILONERROR, true);
  curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"]);
  $contents = curl_exec($ch);
 
  $config = HTMLPurifier_Config::createDefault();
  $config->set('HTML.SafeIframe', true);
  $config->set('URI.SafeIframeRegexp', '%^(https?:)?//(www\.youtube(?:-nocookie)?\.com/embed/|player\.vimeo\.com/video/)%');
  $config->set('HTML.SafeEmbed', true);
  $config->set('HTML.SafeObject', true);

  
  $def = $config->getHTMLDefinition(true);
  $video = $def->addElement(
    'video',
    'Block', 
    'Inline', 
    'Core', 
    array( 
      'src*' => 'URI',
      'poster' => 'URI',
      'controls' => 'Bool'
    )
  );
  $video->excludes = array('video' => true);

  $hp = new HTMLPurifier($config);
  $contents = $hp->purify($contents);

  if(curl_errno($ch)) {
    echo "";
  } else {
    echo $contents;
  }
  curl_close($ch);
?>
