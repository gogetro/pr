require('dotenv').config();

module.exports = function (grunt) {
  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    browserify: {
      dist: {
        options: {
          plugin: [['tsify', { project: './tsconfig.json' }]],
        },
        files: {
          'dist/bundle.js': ['src/App.tsx'],
        },
      },
    },

    copy: {
      main: {
        files: [
          {
            expand: true,
            src: ['index.html'],
            dest: 'dist/',
          },
        ],
      },
    },

    watch: {
      scripts: {
        files: ['src/**/*.ts', 'src/**/*.tsx', 'src/index.css', 'index.html', 'tailwind.config.js'],
        tasks: ['browserify', 'postcss', 'copy'],
        options: {
          spawn: false,
          livereload: true,
        },
      },
    },
  });

  // Load the Grunt plugins.
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['browserify', 'copy']);
  grunt.registerTask('build', ['browserify', 'copy']);

};
