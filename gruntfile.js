module.exports = function(grunt) {
  grunt.initConfig({
    ts: {
      default: {
        files: [{
          src: [
            "src/**/*.ts",
            "test/**/*.ts"
          ],
          dest: "build"
        }],
        options: {
          module: "commonjs",
          target: "es5",
          sourceMap: true,
          noImplicitAny: true,
          suppressImplicitAnyIndexErrors: true,
          removeComments: false,
          preserveConstEnums: true,
          declaration: true,
          fast: 'never'
        }
      }      
    },
    clean: {
      build: ['build'],
      package: ['package', '*.tgz'],
      xunit: ['xunit*.xml']
    },
    simplemocha: {
      options: {
      },
      tests: { src: ['build/test/*.js'] },
      xunit: { 
        options: {
          reporter: 'xunit',
          reporterOptions: { output: 'xunit-results.xml' }
        },
        src: ['build/test/*.js']
      },
    },
    mocha_istanbul: {
      tests: {
        src: ['build/test/**/*.js'],
        options: {
           includeAllSources: true,
           reportFormats: ['cobertura','lcov'],
           coverageFolder: 'coverage',
           root: 'build'
        }
      }
    },
    copy: {
      test: {
        nonull: true,
        src: ['test/settings.json', 'test/certs/test.pem'],
        dest:'build/'
      },
      build: {
        files: [
          {src: 'typings/**/*.d.ts', dest: 'build', flatten: false, expand: true}
         ]
      },
      package: {
        files: [
          {src: 'package.json',       dest: 'package/'},
          {src: '**/*.js',  dest: 'package/lib/', cwd: 'build/src/', expand: true},
          {src: '**/*.d.ts',dest: 'package/lib/', cwd: 'build/src/', expand: true},
          {src: 'typings/**/*.d.ts',  dest: 'package', flatten: false, expand: true},
          {src: 'README.md',          dest: 'package/'},
          {src: 'LICENSE',            dest: 'package/'}
         ]
      }
    },
    watch: {
      source: {
        files: ["src/**/*.ts"],
        tasks: ["ts"],
        options: {interval: 100}
      },
      test: {
        files: ["test/**/*.ts"],
        tasks: ["ts"],
        options: {
          reporter: 'xunit',
          reporterOptions: { output: 'xunit-results.xml' }
        },
        options: {interval: 100}
      }
    },
    'npm-command': {
      pack: {
        options: {
          cmd:  'pack',
          args: 'package'
        }
      }
    }
  });
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-npm-command");
  grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks("grunt-simple-mocha");
  grunt.loadNpmTasks('grunt-mocha-istanbul')

  grunt.registerTask("default", ["clean:build", "copy:build", "ts"]);
  grunt.registerTask("test", ['default', 'copy:test', 'mocha_istanbul:tests']);
  grunt.registerTask("test-xunit", ['clean:xunit', 'default', 'copy:test', 'simplemocha:xunit']);
  grunt.registerTask("package", 'comment', ['clean:package', 'default', 'copy:package', 'npm-command:pack']);
};