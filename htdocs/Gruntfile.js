module.exports = function(grunt) {
    var DIR_DEST       = "public";
    var DIR_TEST       = "public/test";
    var DIR_COMPONENTS  = "components";
    var DIR_SRC        = "src";
    var NODE_MODULES   = "node_modules";

    var dirs = 	{};

    dirs.src = {
	base: DIR_SRC,
	test: DIR_SRC + "/test",
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

    dirs.test = {
	base: DIR_TEST,
	html: DIR_TEST,
	js: DIR_TEST + "/" + "js",
	css: DIR_TEST + "/" + "css"
    };

    dirs.components = {
	base: DIR_COMPONENTS,
	jquery: DIR_COMPONENTS + "/jquery",
	requirejs: DIR_COMPONENTS + "/requirejs"
    };

    var files = {
	php: ['<%= dirs.src.php %>/*.php','<%= dirs.src.php %>/*.inc'],
        js: {
	    expanded: ['<%= dirs.dest.js %>/*.js'],
	    minified: ['<%= dirs.dest.js %>/*.min.js'],
	    components:['<%= dirs.components.base %>/*/*.min.js']
	},
	test: ['<%= dirs.src.test %>/**/*.html', '<%= dirs.src.js %>/**/*.js', '<%= dirs.components.base %>/*/*.min.js']
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
	    test: ["<%= dirs.test.base %>"],
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
	    test: {
		files: files.test,
		tasks: ['copy:test']
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
		src: files.php,
    		dest: '<%= dirs.dest.html %>',
    		flatten: true,
    		expand: true
	    },
	    test:{
		src: files.test,
		dest: '<%= dirs.test.base %>',
		expand: true,
		flatten: true
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
