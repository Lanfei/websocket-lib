module.exports = function (grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		jsdoc: {
			dist: {
				src: ['lib/*.js', 'README.md'],
				dest: 'docs'
			}
		}
	});

	grunt.loadNpmTasks('grunt-jsdoc');

	grunt.registerTask('default', ['jsdoc']);
};
