module.exports = function(grunt) {
    grunt.initConfig({
	dirs: {
	    dest: 'public',
	    ext: 'components',
	    src: 'src',
	    node_modules: 'node_modules'
	},
	clean: {
	    dest: ["<%= dirs.dest %>"],
	    ext: ["<%= dirs.ext %>"],
	    node_modules: ["<%= dirs.node_modules %>"]
	},
	requirejs:{
	},
	shell: {
	},
	uglify: {
	    requirejs: {
		files: {
		    '<%= dirs.ext %>/requirejs/require.min.js':'<%= dirs.ext %>/requirejs/require.js'
		}
	    }
	},
	watch: {
	    html: {
	    	files: ['<%= dirs.src %>/html/*.html'],
	    	tasks: ['copy:html']
	    }
	},
	copy: {
	    deps: {
		src: '<%= dirs.ext %>/*/*.min.js',
		dest: '<%= dirs.dest %>/js/',
		expand: true,
		flatten: true
	    },
	    html: {
		src: '<%= dirs.src %>/html/*.html',
    		dest: '<%= dirs.dest %>/',
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
    grunt.loadNpmTasks('grunt-shell');
};
