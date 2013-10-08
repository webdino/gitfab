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
require(["jQuery","common","project","gridlayout","slide","logger","taglist","lib/showdown","lib/base64"], 
	function($,common,project,gridlayout,slide,logger,taglist,showdown,base64){
});
