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
require(["jQuery","common","itemlist","gridlayout","item","slide","taglist","lib/showdown","lib/base64","logger"],
	 function($,common,itemlist,gridlayout,item,slide,taglist,showdown,base64,logger){
});
