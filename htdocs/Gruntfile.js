module.exports = function(grunt) {
    var DIR_DEST       = "public";
    var DIR_COMPONENTS  = "components";
    var DIR_SRC        = "src";
    var NODE_MODULES   = "node_modules";

    var dirs = 	{};

    dirs.src = {
	base: DIR_SRC,
	html: DIR_SRC + "/html",
	js: DIR_SRC + "/js",
	css: DIR_SRC + "/css",
	php: DIR_SRC
    };

    dirs.dest = {
	base: DIR_DEST,
	html: DIR_DEST,
	js: DIR_DEST + "/" + "js",
	css: DIR_DEST + "/" + "css"
    };

    dirs.components = {
	base: DIR_COMPONENTS,
	jquery: DIR_COMPONENTS + "/jquery",
	requirejs: DIR_COMPONENTS + "/requirejs"
    };

    var files = {};
    files.php = ['<%= dirs.src.php %>/*.php','<%= dirs.src.php %>/*.inc'];
    files.html = ['<%= dirs.src.html %>/**/*.html'];
    
    files.js = {
	expanded: ['<%= dirs.dest.js %>/*.js'],
	minified: ['<%= dirs.dest.js %>/*.min.js'],
	components:['<%= dirs.components.base %>/*/*.min.js']
    };

    var requirejs = {};
    requirejs.options = {
	baseUrl: "<%= dirs.src.js %>",
	paths: {
	    "jQuery": "../../<%= dirs.components.jquery %>/jquery.min"
	},
	shim: {
	    "jQuery": {
		exports: "jQuery"
	    }
	}
    };
    requirejs.extend = function(obj){
	var newone = {};
	for(var i in this.options){
	    newone[i] = this.options[i];
	}
	for(i in obj){
	    newone[i] = obj[i];
	}
	return newone;
    };

    grunt.initConfig({
	dirs: dirs,
	clean: {
	    dest: ["<%= dirs.dest.base %>"],
	    ext: ["<%= dirs.components.base %>"],
	    node_modules: ["<%= dirs.node_modules %>"]
	},
	requirejs:{
	    github:{
		options:requirejs.extend({
		    name: "github/main",
		    skipModuleInsertion: false,
		    optimize: "none",
		    out: "<%= dirs.dest.js %>/github.js"
		})
	    }
	},
	uglify: {
	    requirejs: {
		files: {
		    '<%= dirs.components.requirejs %>/require.min.js':'<%= dirs.components.requirejs %>/require.js'
		}
	    }
	},
	watch: {
	    html: {
	    	files: files.html,
	    	tasks: ['copy:html']
	    }
	},
	copy: {
	    deps: {
		src: files.js.components,
		dest: '<%= dirs.dest.js %>',
		expand: true,
		flatten: true
	    },
	    html: {
		src: files.php.concat(files.html),
    		dest: '<%= dirs.dest.html %>',
    		flatten: true,
    		expand: true
	    }
	}

    });

    grunt.registerTask('build:deps', ['uglify:requirejs', 'copy:deps']);
    grunt.registerTask('build', ['build:deps', 'requirejs', 'uglify']);
    grunt.registerTask('default', ['build']);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
