define("github/api", ["jQuery"], function($){

    var API = {
    };

    API.api_list = {    
	current_user: {
	    url: "https://api.github.com/user", 
	    type: "GET"
	},
	authorizations: {
	    url: "https://api.github.com/authorizations", 
	    type: "GET"
	},
	emails: {
	    url: "https://api.github.com/user/emails", 
	    type: "GET"
	},
	emojis: {
	    url: "https://api.github.com/emojis", 
	    type: "GET"
	},
	events: {
	    url: "https://api.github.com/events", 
	    type: "GET"
	},
	following: {
	    url: "https://api.github.com/user/following{/target}", 
	    type: "GET"
	},
	gists: {
	    url: "https://api.github.com/gists{/gist_id}", 
	    type: "GET"
	},
	hub: {
	    url: "https://api.github.com/hub", 
	    type: "GET"
	},
	issue_search: {
	    url: "https://api.github.com/legacy/issues/search/{owner}/{repo}/{state}/{keyword}", 
	    type: "GET"
	},
	issues: {
	    url: "https://api.github.com/issues", 
	    type: "GET"
	},
	keys: {
	    url: "https://api.github.com/user/keys", 
	    type: "GET"
	},
	notifications: {
	    url: "https://api.github.com/notifications", 
	    type: "GET"
	},
	organization_repositories: {
	    url: "https://api.github.com/orgs/{org}/repos/{?type,page,per_page,sort}", 
	    type: "GET"
	},
	organization: {
	    url: "https://api.github.com/orgs/{org}", 
	    type: "GET"
	},
	public_gists: {
	    url: "https://api.github.com/gists/public", 
	    type: "GET"
	},
	rate_limit: {
	    url: "https://api.github.com/rate_limit", 
	    type: "GET"
	},
	repository: {
	    url: "https://api.github.com/repos/{owner}/{repo}", 
	    type: "GET"
	},
	repository_search: {
	    url: "https://api.github.com/legacy/repos/search/{keyword}{?language,start_page}", 
	    type: "GET"
	},
	current_user_repositories: {
	    url: "https://api.github.com/user/repos{?type,page,per_page,sort}", 
	    type: "GET"
	},
	starred: {
	    url: "https://api.github.com/user/starred{/owner}{/repo}", 
	    type: "GET"
	},
	starred_gists: {
	    url: "https://api.github.com/gists/starred", 
	    type: "GET"
	},
	team: {
	    url: "https://api.github.com/teams", 
	    type: "GET"
	},
	user: {
	    url: "https://api.github.com/users/{user}", 
	    type: "GET"
	},
	user_organizations: {
	    url: "https://api.github.com/user/orgs", 
	    type: "GET"
	},
	user_repositories: {
	    url: "https://api.github.com/users/{user}/repos{?type,page,per_page,sort}", 
	    type: "GET"
	},
	user_search: {
	    url: "https://api.github.com/legacy/user/search/{keyword}", 
	    type: "GET"
	}
    };

    var buildAPIInfo = function(url){
	var match = url.match(/{\?([^}]+)}/);
	var params = {};
	if(match){
	    url = url.substr(0, match.index);
	    var param_names = match[1].split(/,/);
	    for(var i = 0; i < param_names; i++){
		match[param_names[i]] = null;
	    }
	}
	return {
	    url: url,
	    params: params
	};
    };

    var findAPI = function(type){
	var api = API.api_list[type];
	if(api && api.url){
	    var api_type = api.type;
	    api = buildAPIInfo(api.url);
	    api.type = api_type;
	}
	return api;
    };

    API.buildURL = function(type, params){
	var api = findAPI(type);
	if(api){
	    var url = api.url;
	    for(var attr in params){
		url = url.replace("{" + attr + "}", params[attr]);
	    }
	}
	return url;
    };

    API.call = function(type, params, callback){
	var url = this.buildURL(type, params);
	if(url){
	    $.ajax({
		url: url,
		type: this.api_list[type].type,
		data: params,
		success: function(data){
		    callback({status: "success"}, data);
		},
		error: function(xhr, status, error){
		    callback({status: status, error: error});
		}
	    });
	}
    };

    return API;
});