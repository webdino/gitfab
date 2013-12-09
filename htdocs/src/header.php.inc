<header>
<a href="/">
  <div id="logo">gitFAB</div>
</a>
<div id="menus">
  <a id="dashboard" alt="dashboard" title="dashboard"></a>
  <a id="login" alt="login" title="login" href="https://github.com/login/oauth/authorize?client_id=<?php echo getenv("CLIENT_ID"); ?>&scope=repo,delete_repo">login</a>
  <a id="create" alt="create a project" title="create a project">create a project</a>
  <a id="logout" alt="logout" title="logout" href="/api/logout.php">logout</a>
</div>
<div id="searchbox">
  <form action="/" method="GET">
    <input name="tag" type="text" placeholder="search by a tag">
  </form>
</div>

</header>