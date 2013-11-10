<?php
	$url = 'https://raw.github.com/'.$_GET['owner'].'/'.$_GET['repository'].'/'.$_GET['branch'].'/gitfab/resources/'.$_GET['thumbnail'];
	$content = file_get_contents($url);
	echo 'data:image/jpeg;base64,'.base64_encode($content);
?>