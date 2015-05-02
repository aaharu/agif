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
                    'public/js/agif.min.js': ['src/ts/agif.js']
                    'public/js/task.min.js': ['src/ts/task.js']
                    'public/js/split.min.js': ['src/ts/split.js']
                    'public/js/reverse.min.js': ['src/ts/reverse.js']
        ts:
            build:
                src: ['src/ts/*.ts']
                options:
                    failOnTypeErrors: false
                    removeComments: false
                    sourceMap: false
                    module: 'commonjs'

    grunt.loadNpmTasks 'grunt-contrib-stylus'
    grunt.loadNpmTasks 'grunt-contrib-uglify'
    grunt.loadNpmTasks 'grunt-ts'

    grunt.registerTask 'default', ['stylus', 'ts', 'uglify']
