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
require(["jQuery","common","projectList","gridlayout","logger"],
	 function($,common,projectList,gridlayout,project,slide,taglist,showdown,base64,logger){
});