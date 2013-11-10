<?php
	header("Content-Type: image/jpeg");

	$url ="https://raw.github.com/hrl7/mozbus-sticker/master/gitfab/resources/1-1.jpg";
	$content = file_get_contents($url);
	echo $content;
	?>