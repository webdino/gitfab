define("github/observable", [], function(){

    var Observable = function(){
	this.observers = {};
    };
    Observable.prototype = {
	addObserver: function(event, func, self){
	    if(this.observers[event] == null){
		this.observers[event] = {};
	    }
	    if(typeof func == "function"){
		this.observers[event][func] = {
		    callback: func,
		    context: self
		};
	    }
	    return this;
	},
	notifyAll: function(event, arguments){
	    if(this.observers[event]){
		for(var i in this.observers[event]){
		    var observer = this.observers[event][i];
		    if(observer){
			observer.callback.apply(observer.context, arguments);
		    }
		}
	    }
	    return this;
	},
	removeObserver: function(event, func){
	    if(this.observers[event] && this.observers[event][func]){
		delete(this.observers[event][func]);
	    }
	    return this;
	}
    };

    return Observable;
});