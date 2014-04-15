module.exports = (grunt) ->

  grunt.initConfig
    'auto-release':
      options:
        checkTravisBuild: false

    'npm-contributors':
      options:
        commitMessage: 'chore: update contributors'

  grunt.loadTasks 'tasks'
  grunt.loadNpmTasks 'grunt-npm'
  grunt.loadNpmTasks 'grunt-auto-release'

  grunt.registerTask 'release', 'Build, bump and publish to NPM.', (type) ->
    grunt.task.run [
      'npm-contributors',
      "bump:#{type||'patch'}",
      'npm-publish'
    ]
