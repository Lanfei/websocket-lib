module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jsdoc: {
			dist: {
				src: ['index.js', 'lib/*.js', 'README.md'],
				dest: 'docs'
			}
		},
		clean: ['docs']
	});

	grunt.loadNpmTasks('grunt-jsdoc');
	grunt.loadNpmTasks('grunt-contrib-clean');

	grunt.registerTask('default', ['clean', 'jsdoc']);
};
