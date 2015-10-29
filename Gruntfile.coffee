module.exports = (grunt) ->
    pkg = grunt.file.readJSON 'package.json'

    grunt.initConfig
        pkg: pkg
        stylus:
            compile:
                files:
                    'public/css/agif.css': 'src/styl/agif.styl'
        uglify:
            options:
                preserveComments: 'some'
            compile:
                files:
                    'public/js/task.min.js': ['tmp/task.js']
                    'public/js/split.min.js': ['tmp/split.js']
                    'public/js/reverse.min.js': ['tmp/reverse.js']
                    'public/jsx/index.min.js': ['tmp/src/jsx/index.js']
                    'public/js/gifken-client.min.js': ['gifken/build/gifken-client.js']
        typescript:
            build:
                src: ['src/ts/*.ts']
                dest: 'tmp'
                options:
                    target: 'es5'
                    failOnTypeErrors: false
                    removeComments: false
                    module: 'commonjs'
        bower:
          install:
            options:
              targetDir: 'public/js'
        react:
          files:
            expand: true
            src: ['src/jsx/*.jsx']
            ext: '.js'
            dest: 'tmp'
        clean: ['tmp/']

    grunt.loadNpmTasks 'grunt-contrib-stylus'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-typescript'
    grunt.loadNpmTasks 'grunt-bower-task'
    grunt.loadNpmTasks 'grunt-react'
    grunt.loadNpmTasks 'grunt-contrib-clean'

    grunt.registerTask 'init', ['bower:install', 'default']
    grunt.registerTask 'default', ['clean', 'react:files', 'stylus:compile', 'typescript:build', 'uglify']
