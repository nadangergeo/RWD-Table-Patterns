/*
 * grunt-contrib-internal
 * http://gruntjs.com/
 *
 * Copyright (c) 2014 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Add custom template delimiters.
  grunt.template.addDelimiters('build-contrib', '{%', '%}');

  grunt.registerTask('build-contrib', 'Generate contrib plugin files.', function() {
    var path = require('path');
    var readJson = require('read-package-json');

    var done = this.async();
    var asset = path.join.bind(null, __dirname, 'assets');
    var self = this;

    readJson('package.json', console.error, false, function (err, data) {
      if (err) {
        console.error("There was an error reading the file");
        done(false);
      }

      var meta = data;
      meta.changelog = grunt.file.readYAML('CHANGELOG');
      meta.travis = grunt.file.exists('.travis.yml');

      if (meta.travis) {
        // create a valid Travis URL, based on [user/repository_name]
        meta.travis = 'https://travis-ci.org' + meta.repository.url
          .replace('github.com', '')
          .replace('git://', '')
          .replace('https://', '')
          .replace('http://', '')
          .replace('.git', '');
      }

      meta.appveyor = grunt.file.exists('appveyor.yml') ? grunt.file.readYAML('appveyor.yml') : null;

      if (meta.appveyor && meta.appveyor.project_id) {
        var pid = meta.appveyor.project_id;
        meta.appveyor = 'https://ci.appveyor.com/api/projects/status/' + pid + '/branch/master';
      }

      var authors = grunt.file.read('AUTHORS');
      meta.authors = authors.split('\n').map(function(author) {
        var matches = author.match(/(.*?)\s*\((.*)\)/) || [];
        return {name: matches[1], url: matches[2]};
      });

      // Used to display the "in development" warning message @ the top.
      meta.in_development = (meta.keywords || []).indexOf('gruntplugin') === -1 || '';

      // Read plugin/task docs.
      meta.docs = {plugin: {}, task: {}};
      grunt.file.expand('docs/*.md').forEach(function(filepath) {
        // Parse out the task name and section name.
        var basename = path.basename(filepath, '.md');
        var parts = basename.split('-');
        var section = parts.pop();
        var taskname = parts.join('-');

        var namespace = taskname ? meta.docs.task : meta.docs.plugin;
        if (taskname) {
          if (!namespace[taskname]) { namespace[taskname] = {}; }
          namespace = namespace[taskname];
        }

        // Read doc file.
        var doc = grunt.file.read(filepath);
        // Adjust header level to be semantically correct for the readme.
        doc = doc.replace(/^#/gm, '###');
        // Process as template.
        doc = grunt.template.process(doc, {data: meta, delimiters: 'build-contrib'});
        namespace[section] = doc;
      });

      // Generate readme.
      var tmpl = grunt.file.read(asset('README.tmpl.md'));
      var newReadme = grunt.template.process(tmpl, {data: meta, delimiters: 'build-contrib'});

      // Only write readme if it actually changed.
      var oldReadme = grunt.file.exists('README.md') ? grunt.file.read('README.md') : '';
      var re = /(\*This file was generated on.*)/;
      if (oldReadme.replace(re, '') !== newReadme.replace(re, '')) {
        grunt.file.write('README.md', newReadme);
        grunt.log.ok('Created README.md');
      } else {
        grunt.log.ok('Keeping README.md.');
      }

      // Copy contributing guide
      grunt.file.copy(path.resolve(__dirname, '..', 'CONTRIBUTING.md'), 'CONTRIBUTING.md');
      grunt.log.ok('Created CONTRIBUTING.md');

      // Fail task if any errors were logged.
      if (self.errorCount > 0) { done(false); }
      done();
    });

  });

};
