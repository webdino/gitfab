<?php
try{
	$url = 'https://raw.github.com/'.$_GET['owner'].'/'.$_GET['repository'].'/'.$_GET['branch'].'/gitfab/resources/'.$_GET['thumbnail'];
	switch (exif_imagetype($url)){
		case IMAGETYPE_GIF:
			$mime = 'data:image/gif;base64,';
			break;
		case IMAGETYPE_JPEG:
			$mime = 'data:image/jpeg;base64,';
			break;
		case IMAGETYPE_PNG:
			$mime = 'data:image/png;base64,';
			break;
		default :
			throw new Exception('this filetype is not supported');
	}
	$content = file_get_contents($url);
	$result = $mime.base64_encode($content);

}catch(Exception $e){
	$result = $e->getMessage();
}

echo $result;
?>