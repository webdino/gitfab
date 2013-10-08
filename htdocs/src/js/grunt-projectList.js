require.config({
    paths: {
	  "jQuery": "jquery.min",
	  "github": ".",
	  "lib":"./lib"
    },
    shim:{
  	  "jQuery": {
	    exports: "jQuery"
	  },

    }
});
require(["jQuery","common","projectList","gridlayout","project","slide","taglist","lib/showdown","lib/base64","logger"],
	 function($,common,projectList,gridlayout,project,slide,taglist,showdown,base64,logger){
});

