<div id="fb-root"></div>
<script>(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id)) return;
	js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/all.js#xfbml=1";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));</script>
<?php $currentURL = "http://gitfab.org/".$_SERVER["REQUEST_URI"]; ?>
<div class="fb-like" data-href="<?php print($currentURL); ?>" data-width="400" data-show-faces="true" data-send="true"></div>
<div class="fb-comments" data-href="<?php print($currentURL); ?>" data-width="400"></div>