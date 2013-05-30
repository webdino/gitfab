define("github/user", ["jQuery", "github/api", "github/observable"], function($, api, Observable){
    var User = function(name){
	this.name = name;
    };

    User.events = {
	DETAILS: "user"
    };

    User.prototype = new Observable();
    User.prototype.authenticate =  function(){
    };

    User.prototype.details = function(callback, context){
	var self = this;
	this.addObserver(User.events.DETAILS, callback, context);
	api.call(User.events.DETAILS,{
	    user: this.name
	},function(status, data){
	    self.details = data;
	    self.notifyAll(User.events.DETAILS, [status, self]);
	    self.removeObserver(User.events.DETAILS, callback);
	});
    };

    return User;

});