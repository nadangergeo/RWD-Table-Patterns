module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
      pkg: grunt.file.readJSON('package.json'),
      filename: 'rwd-table',
      banner: '/*!\n' +
            ' * Responsive Tables v<%= pkg.version %> (<%= pkg.homepage %>)\n' +
            ' * <%= pkg.description %>\n' +
            ' * Copyright 2011-<%= grunt.template.today("yyyy") %> <%= pkg.author %>\n' +
            ' * Authors: Nadan Gergeo <nadan.gergeo@gmail.com> (www.gergeo.se) & Maggie Wachs (www.filamentgroup.com)\n' +
            ' * Licensed under <%= pkg.license.type %> (<%= pkg.license.url %>)\n' +
            ' */',
      jshint: {
        all: ['src/js/*.js']
      },
      uglify: {
        build: {
          src: 'src/js/<%= filename %>.js',
          dest: 'dist/js/<%= filename %>.min.js'
        }
      },
      less: {
          development: {
            options: {
              compress: false
            },
            files: {
              // target.css file: source.less file
              "dist/css/<%= filename %>.css": "src/less/<%= filename %>.less"
            }
          },
          production: {
            options: {
              compress: true
            },
            files: {
              // target.css file: source.less file
              "dist/css/<%= filename %>.min.css": "src/less/<%= filename %>.less",
            }
          },
          docs: {
            options: {
              compress: true
            },
            files: {
              // target.css file: source.less file
              "docs/css/docs.min.css": "docs/css/docs.less"
            }
          }
      },
      copy: {
        dist: {
            src: 'src/js/<%= filename %>.js',
            dest: 'dist/js/<%= filename %>.js',
        },
        docs: {
            files: [
                {expand: true, flatten: true, src: ['dist/js/*'], dest: 'docs/js/', filter: 'isFile'},
                {expand: true, flatten: true, src: ['dist/css/*'], dest: 'docs/css/', filter: 'isFile'}
            ]
        }
      },
      usebanner: {
        dist: {
          options: {
            position: 'top',
            banner: '<%= banner %>',
            linebreak: true
          },
          files: {
            src: [ 'dist/css/*.css', 'dist/js/*.js']
          }
        },
        docs: {
          options: {
            position: 'top',
            banner: '<%= banner %>',
            linebreak: true
          },
          files: {
            src: [ 'docs/css/docs.css']
          }
        }
      },
      watch: {
          src: {
            // rebuild if files in src changes
            files: ['src/**'],
            tasks: ['build'],
            options: {
              livereload: {
                animate: true
              }
            }
          },
          docs: {
            // if docs.less changes compile and add banner
            files: ['docs/css/*.less'],
            tasks: ['less:docs', 'usebanner:docs'],
            options: {
              livereload: {
                animate: true
              }
            }
          }
      },
      bump: {
          options: {
            files: ['package.json', 'bower.json'],
            updateConfigs: [],
            commit: true,
            commitMessage: 'Release v%VERSION%',
            commitFiles: ['-a'], // '-a' for all files
            createTag: true,
            tagName: 'v%VERSION%',
            tagMessage: 'Version %VERSION%',
            push: false,
            pushTo: 'upstream',
            gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
          }
      }
    });
    
    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-banner');
    grunt.loadNpmTasks('grunt-bump');

    grunt.registerTask('build', [
        'jshint',
        'uglify',
        'less',
        'copy:dist',
        'usebanner',
        'copy:docs'
    ]);
    
    // Default task(s).
    grunt.registerTask('default', ['build']);
};

