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
                    'public/js/task.min.js': ['src/ts/task.js']
                    'public/js/split.min.js': ['src/ts/split.js']
                    'public/js/reverse.min.js': ['src/ts/reverse.js']
                    'public/jsx/index.min.js': ['src/jsx/index.js']
        ts:
            build:
                src: ['src/ts/*.ts']
                options:
                    failOnTypeErrors: false
                    removeComments: false
                    sourceMap: false
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

    grunt.loadNpmTasks 'grunt-contrib-stylus'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-ts'
    grunt.loadNpmTasks 'grunt-bower-task'
    grunt.loadNpmTasks 'grunt-react'

    grunt.registerTask 'init', ['bower:install', 'default']
    grunt.registerTask 'default', ['react:files', 'stylus:compile', 'ts:build', 'uglify']
