module.exports = (grunt) ->
    pkg = grunt.file.readJSON "package.json"

    grunt.initConfig
        pkg: pkg
        copy:
            gifken:
                src: "submodule/gifken/build/gifken.min.js"
                dest: "public/js/gifken.min.js"
        stylus:
            compile:
                files:
                    "public/css/agif.css": "src/styl/agif.styl"
        uglify:
            options:
                preserveComments: "some"
            compile:
                files:
                    "public/js/agif.min.js": ["src/ts/agif.js"]
        ts:
            build:
                src: ["src/ts/agif.ts"]
                outDir: "src/ts/"
                options:
                    removeComments: false
                    sourceMap: false

    grunt.loadNpmTasks "grunt-contrib-copy"
    grunt.loadNpmTasks "grunt-contrib-stylus"
    grunt.loadNpmTasks "grunt-contrib-uglify"
    grunt.loadNpmTasks "grunt-ts"

    grunt.registerTask "default", ["copy", "stylus", "ts", "uglify"]
