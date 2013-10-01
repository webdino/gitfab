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
	php: DIR_SRC,
	less: DIR_SRC+"/less",
	images: DIR_SRC + "/" + "images",
	fonts: DIR_SRC + "/" + "fonts",
	api: DIR_SRC + "/" + "api"
    };

    dirs.dest = {
	base: DIR_DEST,
	html: DIR_DEST,
	js: DIR_DEST + "/" + "js",
	css: DIR_DEST + "/" + "css",
	images: DIR_DEST + "/" + "images",
	fonts: DIR_DEST + "/" + "fonts",
	api: DIR_DEST + "/" + "api"
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
	requirejs: DIR_COMPONENTS + "/requirejs",
    };

    dirs.temp = {
		gitfab: DIR_SRC + "/gitfab"
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
	    "jQuery": "../../<%= dirs.components.jquery %>/jquery.min",
	    "require": "../../<%= dirs.components.requirejs %>/require.min"

	},
	shim: {
	    "jQuery": {
		exports: "jQuery"
	    },  
	    "require": {
		exports: "require"
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
	    itemlist:{
		options:requirejs.extend({
		    name: "grunt-itemlist",
		    skipModuleInsertion: false,
		    optimize: "none",
		    out: "<%= dirs.temp.gitfab%>/main-itemlist.js"
		})
	    },
	   	item:{
			options:requirejs.extend({
			    name: "grunt-item",
			    skipModuleInsertion: false,
			    optimize: "none",
			    out: "<%= dirs.temp.gitfab%>/main-item.js"
			})
	    }
	},
	uglify: {
	    requirejs: {
		files: {
		    '<%= dirs.dest.js%>/require.min.js':'<%= dirs.components.requirejs %>/require.js'
		}
	    },
		itemlist: {
			files: {
		    	'<%= dirs.dest.js%>/main-itemlist.min.js':'<%= dirs.temp.gitfab%>/main-itemlist.js'
			}
	    },
	    item: {
			files: {
		    	'<%= dirs.dest.js%>/main-item.min.js':'<%= dirs.temp.gitfab%>/main-item.js'
			}
	    }

	},
	concat: {
		itemlist:{
			src:['<%= dirs.src.css%>/common.css',
				 '<%= dirs.src.css%>/gridlayout.css',
				 '<%= dirs.src.css%>/itemlist.css',
				 '<%= dirs.src.css%>/logger.css'],
			dest:'<%= dirs.dest.css%>/itemlist.min.css'
		},		
		item:{
			src:['<%= dirs.src.css%>/common.css',
				 '<%= dirs.src.css%>/logger.css',
				 '<%= dirs.src.css%>/slide.css',
				 '<%= dirs.src.css%>/item.css'],
			dest:'<%= dirs.dest.css%>/item.min.css'
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
	    images:{
	    	src:'<%= dirs.src.images %>/*.png',
	    	dest:'<%= dirs.dest.images %>',
	    	flatten: true,
    		expand: true
	    },
	    fonts:{
	    	src:['<%= dirs.src.fonts %>/*.ttf','<%= dirs.src.fonts %>/*.woff'],
	    	dest:'<%= dirs.dest.fonts %>',
	    	flatten: true,
    		expand: true
	    },
	    api:{
	    	src:['<%= dirs.src.api %>/*.php*'],
	    	dest:'<%= dirs.dest.api %>',
	    	flatten: true,
    		expand: true
	    },
	    htaccess:{
	    	src:'<%= dirs.src %>/.htaccess',
	    	dest:'<%= dirs.dest %>/.htaccess',
	    	flatten: true,
    		expand: true
	    },

	    test:{
			src: files.test,
			dest: '<%= dirs.test.base %>',
			expand: true,
			flatten: true
	    }
	},
	less: {
		dist:{
			options: {
	       		paths: ['<%= dirs.src.less %>']
	      	},
	        files: {
	          "<%= dirs.dest.css %>/test-gitfab.css":"<%= dirs.src.less %>/*.less"
    	    }
    	}
  	}	

    });

    //grunt.registerTask('build:deps', ['uglify:requirejs', 'copy:deps']);
    //grunt.registerTask('build', ['build:deps', 'requirejs', 'uglify']);
    grunt.registerTask('default', ['requirejs', 'uglify','concat','less:dist','copy']);

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};
