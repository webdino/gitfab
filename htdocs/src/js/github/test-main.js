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
require(["jQuery","common","itemlist","gridlayout"], function($,common,itemlist,gridlayout){
//	itemlist.ItemListController.init();

});
