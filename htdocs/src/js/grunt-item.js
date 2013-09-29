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
require(["jQuery","common","item","gridlayout","slide","logger","taglist","lib/showdown","lib/base64"], 
	function($,common,item,gridlayout,slide,logger,taglist,showdown,base64){
//	itemlist.ItemListController.init();

});
