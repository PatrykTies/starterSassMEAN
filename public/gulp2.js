/*******************************************************************************
1. DEPENDENCIES
******************************************************************************/
 
var gulp = require('gulp'),                             // gulp core
    nodemon = require('gulp-nodemon'),
    sass = require('gulp-sass'),                        // sass compiler
    uglify = require('gulp-uglify'),                    // uglifies the js
    jshint = require('gulp-jshint'),                    // check if js is ok
    rename = require("gulp-rename"),                    // rename files
    concat = require('gulp-concat'),                    // concatinate js
    notify = require('gulp-notify'),                    // send notifications to osx
    plumber = require('gulp-plumber'),                  // disable interuption
    stylish = require('jshint-stylish'),                // make errors look good in shell
    minifycss = require('gulp-minify-css'),             // minify the css files
    browserSync = require('browser-sync'),              // inject code to all devices
    autoprefixer = require('gulp-autoprefixer');        // sets missing browserprefixes
 

// A display error function, to format and make custom errors more uniform
// Could be combined with gulp-util or npm colors for nicer output
var displayError = function(error) {

    // Initial building up of the error
    var errorString = '[' + error.plugin + ']';
    errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

    // If the error contains the filename or line number add it to the string
    if(error.fileName)
        errorString += ' in ' + error.fileName;

    if(error.lineNumber)
        errorString += ' on line ' + error.lineNumber;

    // This will output an error like the following:
    // [gulp-sass] error message in file_name on line 1
    console.error(errorString);
};

gulp.task('default', function () {
  nodemon({ script: 'server.js',
          ext: 'html js',
          ignore: ['ignored.js'],
          tasks: ['jshint'] })
    .on('restart', function () {
      console.log('restarted!');
    });
});


 
/*******************************************************************************
2. FILE DESTINATIONS (RELATIVE TO ASSETS FOLDER)
*******************************************************************************/
 
var target = {
    sass_src : 'scss/**/*.scss',                        // all sass files
    css_dest : 'css',                                   // where to put minified css
    js_lint_src : [                                     // all js that should be linted
        'myapp.js',
        'server/api.js',
        'controllers/homeCtrl.js'
    ],
    js_uglify_src : [                                   // all js files that should not be concatinated
        'js/build/custom/scheme-loader.js',
        'js/build/vendor/modernizr.js'
    ],
    js_concat_src : [                                   // all js files that should be concatinated
        '',
        ''
    ],
    js_dest : 'js'                                      // where to put minified js
};
 
 
/*******************************************************************************
3. SASS TASK
*******************************************************************************/
 
gulp.task('sass', function() {
    gulp.src(target.sass_src)                           // get the files
        .pipe(plumber())                                // make sure gulp keeps running on errors
        .pipe(sass())                                   // compile all sass
        .pipe(autoprefixer(                             // complete css with correct vendor prefixes
            'last 2 version',
            '> 1%',
            'ie 8',
            'ie 9',
            'ios 6',
            'android 4'
        ))
        .pipe(minifycss())                              // minify css
        .pipe(gulp.dest(target.css_dest))               // where to put the file
        .pipe(notify({message: 'SCSS processed!'}));    // notify when done
});
 
 
/*******************************************************************************
4. JS TASKS
*******************************************************************************/
 
// lint my custom js
gulp.task('js-lint', function() {
    gulp.src(target.js_lint_src)                        // get the files
        .pipe(jshint())                                 // lint the files
        .pipe(jshint.reporter(stylish));                 // present the results in a beautiful way
});
 
// minify all js files that should not be concatinated
gulp.task('js-uglify', function() {
    gulp.src(target.js_uglify_src)                      // get the files
        .pipe(uglify())                                 // uglify the files
        .pipe(rename(function(dir,base,ext){            // give the files a min suffix
            var trunc = base.split('.')[0];
            return trunc + '.min' + ext;
        }))
        .pipe(gulp.dest(target.js_dest))                // where to put the files
        .pipe(notify({ message: 'JS processed!'}));     // notify when done
});
 
// minify & concatinate all other js
gulp.task('js-concat', function() {
    gulp.src(target.js_concat_src)                      // get the files
        .pipe(uglify())                                 // uglify the files
        .pipe(concat('scripts.min.js'))                 // concatinate to one file
        .pipe(gulp.dest(target.js_dest))                // where to put the files
        .pipe(notify({message: 'JS processed!'}));      // notify when done
});
 
 
/*******************************************************************************
5. BROWSER SYNC
*****************************************************************************
 
gulp.task('browser-sync', function() {
    browserSync.init(['css/*.css', 'js/*.js'], {        // files to inject
        proxy: {
            host: 'localhost',                          // development server
            port: '3000'                                // development server port
        }
    });
});
 
 
/*******************************************************************************
1. GULP TASKS
*******************************************************************************/
 
gulp.task('default', ['sass', 'js-lint', 'js-uglify', 'js-concat'], function() {
    gulp.watch('scss/**/*.scss', function() {
        gulp.run('sass');
    });
    gulp.watch(target.js_lint_src, function() {
        gulp.run('js-lint');
    });
    gulp.watch(target.js_minify_src, function() {
        gulp.run('js-uglify');
    });
    gulp.watch(target.js_concat_src, function() {
        gulp.run('js-concat');
    });
});