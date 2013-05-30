require.config({
    paths: {
	"jQuery": "jquery.min",
	"github": "."
    },
    shim:{
  	"jQuery": {
	    exports: "jQuery"
	}
    }
});
require(["jQuery", "github/user"], function($, User){
    $(function(){
	var chikoski = new User("chikoski");
	console.log(chikoski.name);
	chikoski.details(function(status, user){
	    console.log(status);
	    console.log(user);
	});
    });
});
