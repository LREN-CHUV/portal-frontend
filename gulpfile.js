"use strict";

// Module dependencies
var gulp = require("gulp"),
  rimraf = require("rimraf"),
  runSequence = require("run-sequence"),
  gulpLoadPlugins = require("gulp-load-plugins"),
  plugins = gulpLoadPlugins(),
  pngquant = require("imagemin-pngquant"),
  processhtml = require("gulp-processhtml"),
  browserSync = require("browser-sync").create(),
  historyApiFallback = require("connect-history-api-fallback"),
  jshint = require("gulp-jshint"),
  filter = require("gulp-filter"),
  rev = require("gulp-rev"),
  revReplace = require("gulp-rev-replace"),
  del = require("del"),
  rename = require("gulp-rename"),
  protractor = require("gulp-protractor").protractor,
  webdriver_standalone = require("gulp-protractor").webdriver_standalone,
  webdriver_update = require("gulp-protractor").webdriver_update_specific;

// Application's main directories constants
var appConfig = require("./app-config.json");
// Application's application scripts directories
var appScripts = require("./scripts-app");
// Application's vendor scripts directories
var vendorScripts = require("./scripts-vendor");
// Application's vendor styles directories
var vendorCss = require("./styles-vendor");

// Application's srtucture paths
var appPath = {
  src: {
    html404: appConfig.app + "/404.html",
    scripts: {
      html: [appConfig.app + "/scripts/!(external)/**/*.html"],
      external: [appConfig.app + "/scripts/external/**/*"]
    },
    less: appConfig.app + "/styles/less/styles.less",
    vendorCss: vendorCss,
    js: {
      appScripts: appScripts,
      vendorScripts: vendorScripts
    },
    images: appConfig.app + "/images/**/*",
    tmp: appConfig.app + "/tmp",
    tmpFonts: appConfig.app + "/fonts",
    other: {
      font: appConfig.app + "/font/**/*",
      fonts: [
        "./node_modules/bootstrap/dist/fonts/**/*",
        "./app/styles/plugins/themify-icons/fonts/**/*",
        "./node_modules/font-awesome/fonts/**/*"
      ],
      i18n: appConfig.app + "/i18n/**/*",
      mocks: appConfig.app + "/mocks/**/*",
      libs: appConfig.app + "/libs/**/*",
      rootItems: [
        appConfig.app + "/.htaccess",
        appConfig.app + "/*.png",
        appConfig.app + "/*.ico",
        appConfig.app + "/*.txt"
      ]
    },
    tests: {
      screenshots: "./screenshots",
      reports: "./reports"
    }
    // tests: "./screenshots",
  },
  dist: {
    scripts: {
      html: appConfig.dist + "/scripts",
      external: appConfig.dist + "/scripts/external"
    },
    cssProd: appConfig.dist + "/styles",
    appConfig: appConfig.app + "/scripts/app",
    js: {
      vendorsPath: appConfig.dist + "/scripts"
    },
    images: appConfig.dist + "/images",
    other: {
      font: appConfig.dist + "/font",
      fonts: appConfig.dist + "/fonts",
      i18n: appConfig.dist + "/i18n",
      mocks: appConfig.dist + "/mocks",
      libs: appConfig.dist + "/libs",
      rootItems: appConfig.dist
    },
    revision: [
      appConfig.dist + "/scripts/*.js",
      appConfig.dist + "/styles/*.css"
    ],
    replaceClean: [
      appConfig.dist + "/scripts/scripts.js",
      appConfig.dist + "/scripts/vendor.js",
      appConfig.dist + "/styles/main.css",
      appConfig.dist + "/styles/vendor.css",
      appConfig.dist + "/rev-manifest.json"
    ]
  }
};

gulp.task("clean:dev", function(cb) {
  return rimraf(appPath.src.tmp, cb);
});

gulp.task("clean-fonts:dev", function(cb) {
  return rimraf(appPath.src.tmpFonts, cb);
});

gulp.task("clean:prod", function(cb) {
  return rimraf(appConfig.dist, cb);
});

gulp.task("clean:test-screenshots", function(cb) {
  return rimraf(appPath.src.tests.screenshots, cb);
});

gulp.task("clean:test-reports", function(cb) {
  return rimraf(appPath.src.tests.reports, cb);
});

// Creating "app.config.js" in app folder
gulp.task("config:dev", function() {
  var envAppConfig = require("./config.json"), envConfig = envAppConfig.dev;
  return plugins
    .ngConstant({
      name: "app.config",
      deps: [],
      constants: envConfig.constants,
      wrap: false,
      stream: true
    })
    .pipe(rename("./app.config.js"))
    .pipe(gulp.dest(appPath.dist.appConfig));
});

gulp.task("config:prod", function() {
  var envAppConfig = require("./config.json"), envConfig = envAppConfig.prod;
  return plugins
    .ngConstant({
      name: "app.config",
      deps: [],
      constants: envConfig.constants,
      wrap: false,
      stream: true
    })
    .pipe(rename("./app.config.js"))
    .pipe(gulp.dest(appPath.dist.appConfig));
});

// Copy files in dist folder
gulp.task("copy-all", function() {
  return runSequence([
    "copy-font",
    "copy-fonts",
    "copy-i18n",
    "copy-mocks",
    "copy-libs",
    "copy-rootItems",
    "copy-scripts-html",
    "copy-scripts-external",
    "copy-404-html"
  ]);
});

gulp.task("copy-font", function() {
  return gulp
    .src(appPath.src.other.font)
    .pipe(gulp.dest(appPath.dist.other.font));
});

gulp.task("copy-fonts:dev", function() {
  return gulp
    .src(appPath.src.other.fonts)
    .pipe(gulp.dest(appConfig.app + "/fonts"));
});

gulp.task("copy-fonts", function() {
  return gulp
    .src(appPath.src.other.fonts)
    .pipe(gulp.dest(appPath.dist.other.fonts));
});

gulp.task("copy-i18n", function() {
  return gulp
    .src(appPath.src.other.i18n)
    .pipe(gulp.dest(appPath.dist.other.i18n));
});

gulp.task("copy-mocks", function() {
  return gulp
    .src(appPath.src.other.mocks)
    .pipe(gulp.dest(appPath.dist.other.mocks));
});

gulp.task("copy-libs", function() {
  return gulp
    .src(appPath.src.other.libs)
    .pipe(gulp.dest(appPath.dist.other.libs));
});

gulp.task("copy-rootItems", function() {
  return gulp
    .src(appPath.src.other.rootItems)
    .pipe(gulp.dest(appPath.dist.other.rootItems));
});

gulp.task("copy-scripts-html", function() {
  return gulp
    .src(appPath.src.scripts.html)
    .pipe(gulp.dest(appPath.dist.scripts.html));
});

gulp.task("copy-scripts-external", function() {
  return gulp
    .src(appPath.src.scripts.external)
    .pipe(gulp.dest(appPath.dist.scripts.external));
});

gulp.task("copy-404-html", function() {
  return gulp.src(appPath.src.html404).pipe(gulp.dest(appConfig.dist));
});

// Copy minified images in dist
gulp.task("images", function() {
  return gulp
    .src(appPath.src.images)
    .pipe(
      plugins.imagemin({
        progressive: true,
        svgoPlugins: [{ removeViewBox: false }],
        use: [pngquant()],
        inteerlaced: true
      })
    )
    .pipe(gulp.dest(appPath.dist.images));
});

// Create index.html to work in develope mode or index-tmpl.html in dist folder
gulp.task("index-html:dev", function() {
  return gulp
    .src(appConfig.app + "/index-gulp.html")
    .pipe(rename("index.html"))
    .pipe(gulp.dest(appConfig.app));
});

gulp.task("index-html:prod", function() {
  return gulp
    .src(appConfig.app + "/index-gulp.html")
    .pipe(processhtml())
    .pipe(rename("index-tmpl.html"))
    .pipe(
      plugins.htmlmin({
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true,
        removeOptionalTags: true
      })
    )
    .pipe(gulp.dest(appConfig.dist));
});

gulp.task("index-html:test", function() {
  return gulp
    .src(appConfig.app + "/index-gulp.html")
    .pipe(processhtml())
    .pipe(rename("index.html"))
    .pipe(
      plugins.htmlmin({
        collapseWhitespace: true,
        conservativeCollapse: true,
        collapseBooleanAttributes: true,
        removeCommentsFromCDATA: true,
        removeOptionalTags: true
      })
    )
    .pipe(gulp.dest(appConfig.dist));
});

// Compile less to css (dev) minify css (prod)
gulp.task("styles:dev", function() {
  return (gulp
      .src(appPath.src.less)
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.less())
      .on("error", function(err) {
        console.error("Error!", err.message);
      })
      .pipe(
        plugins.autoprefixer({
          browsers: ["last 3 versions"],
          cascade: false
        })
      )
      // .pipe(plugins.cssmin())
      .pipe(rename("main.css"))
      .pipe(plugins.sourcemaps.write())
      .pipe(gulp.dest(appPath.src.tmp))
      .pipe(browserSync.stream()) );
});

gulp.task("styles:prod", function() {
  return gulp
    .src(appPath.src.less)
    .pipe(plugins.less())
    .on("error", function(err) {
      console.error("Error!", err.message);
    })
    .pipe(
      plugins.autoprefixer({
        browsers: ["last 3 versions"],
        cascade: false
      })
    )
    .pipe(plugins.cssmin())
    .pipe(rename("main.css"))
    .pipe(gulp.dest(appPath.dist.cssProd));
});

gulp.task("styles-vendor:dev", function() {
  return gulp
    .src(appPath.src.vendorCss)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.importCss())
    .pipe(plugins.cssmin())
    .pipe(plugins.concat("vendor.css"))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest(appPath.src.tmp));
});

gulp.task("styles-vendor:prod", function() {
  return gulp
    .src(appPath.src.vendorCss)
    .pipe(plugins.importCss())
    .pipe(plugins.cssmin())
    .pipe(plugins.concat("vendor.css"))
    .pipe(gulp.dest(appPath.dist.cssProd));
});

gulp.task("js-vendor:dev", function() {
  return (gulp
      .src(appPath.src.js.vendorScripts)
      .pipe(plugins.sourcemaps.init())
      // .pipe(plugins.uglify())
      .pipe(plugins.concat("vendor.js"))
      .pipe(plugins.sourcemaps.write("."))
      .pipe(gulp.dest(appPath.src.tmp)) );
});

gulp.task("js-vendor:prod", function() {
  return gulp
    .src(appPath.src.js.vendorScripts)
    .pipe(plugins.uglify())
    .pipe(plugins.concat("vendor.js"))
    .pipe(gulp.dest(appPath.dist.js.vendorsPath));
});

gulp.task("js-app:dev", function() {
  return gulp
    .src(appPath.src.js.appScripts)
    .pipe(plugins.babel({ presets: ["es2015"] }))
    .on("error", function(e) {
      console.error(e);
      this.emit("end");
    })
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.concat("scripts.js"))
    .pipe(plugins.sourcemaps.write("."))
    .pipe(gulp.dest(appPath.src.tmp))
    .pipe(browserSync.stream());
});

gulp.task("js-app:prod", function() {
  return gulp
    .src(appPath.src.js.appScripts)
    .pipe(plugins.babel({ presets: ["es2015"] }))
    .on("error", function(e) {
      console.error(e);
      this.emit("end");
    })
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.concat("scripts.js"))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(appPath.dist.js.vendorsPath));
});

// Renaming main js and css files to exclude caching
gulp.task("caching", function() {
  runSequence("revision", "replace", "replace-clean");
});

gulp.task("caching:test", function() {
  runSequence("revision", "replace:test", "replace-clean");
});

gulp.task("revision", function() {
  var jsFilter = filter("**/*.js"), cssFilter = filter("**/*.css");

  var revFiles = gulp.src(appPath.dist.revision).pipe(rev());

  return gulp
    .src(appPath.dist.revision)
    .pipe(rev())
    .pipe(jsFilter)
    .pipe(gulp.dest(appConfig.dist + "/scripts"))
    .pipe(revFiles)
    .pipe(cssFilter)
    .pipe(gulp.dest(appConfig.dist + "/styles"))
    .pipe(revFiles)
    .pipe(rev.manifest())
    .pipe(gulp.dest(appConfig.dist));
});

gulp.task("replace", function() {
  var manifest = gulp.src(appConfig.dist + "/rev-manifest.json");

  return gulp
    .src(appConfig.dist + "/index-tmpl.html")
    .pipe(revReplace({ manifest: manifest }))
    .pipe(gulp.dest(appConfig.dist));
});

gulp.task("replace:test", function() {
  var manifest = gulp.src(appConfig.dist + "/rev-manifest.json");

  return gulp
    .src(appConfig.dist + "/index.html")
    .pipe(revReplace({ manifest: manifest }))
    .pipe(gulp.dest(appConfig.dist));
});

gulp.task("replace-clean", function() {
  return del(appPath.dist.replaceClean);
});

// Use Browser-sync instead of Livereload
// Browser-sync watchs for less, js and index-gulp.html
gulp.task("browser-sync", function() {
  browserSync.init({
    server: "./app",
    port: 8000,
    middleware: [historyApiFallback()]
  });

  gulp.watch(appConfig.app + "/styles/**/*.less", ["styles:dev"]);
  gulp.watch(appConfig.app + "/scripts/**/*.js", ["js-app:dev"]);
  gulp.watch("./bower.json", ["index-html:dev"]);
  gulp.watch(appConfig.app + "/index-gulp.html", ["index-html:dev"]);
  gulp.watch(appConfig.app + "/index.html").on("change", browserSync.reload);
  gulp
    .watch(appConfig.app + "/scripts/**/*.html")
    .on("change", browserSync.reload);
});

gulp.task("browser-sync:test", function() {
  browserSync.init({
    open: false,
    server: "./dist",
    port: 8000,
    middleware: [historyApiFallback()]
  });
});

// Lint js files in "app/scripts"
// to lint js files you should type "gulp js-hint" in command line
gulp.task("js-hint", function() {
  return gulp
    .src(appPath.src.js.appScripts)
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("jshint-stylish", { beep: true }));
});

// Run unit-test with Karma
function runTests(singleRun, done) {
  var testFiles = appPath.src.js.vendorScripts
    .concat(["./node_modules/angular-mocks/angular-mocks.js"])
    .concat(appPath.src.js.appScripts)
    .concat(["./app/tests/**/*.test.js", "./app/scripts/**/*.html"]);

  gulp
    .src(testFiles)
    .pipe(
      plugins.karma({
        configFile: "karma.conf.js",
        action: singleRun ? "run" : "watch"
      })
    )
    .on("error", function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
}

// Run unit tests
gulp.task("unit-tests", function(done) {
  runTests(true /*singleRun*/, done);
});
gulp.task("unit-tests:auto", function(done) {
  runTests(false /*singleRun*/, done);
});

// Downloads the selenium webdriver
gulp.task(
  "webdriver_update",
  webdriver_update({
    browsers: ["ignore_ssl"]
  })
);

// Start the standalone selenium server
gulp.task("webdriver_standalone", webdriver_standalone);

gulp.task(
  "protractor-go",
  ["clean:test-reports", "clean:test-screenshots", "webdriver_update"],
  function(cb) {
    gulp
      .src([])
      .pipe(
        protractor({
          configFile: "./app/tests/e2e/e2e-conf.js"
        })
      )
      .on("error", function(e) {
        console.log(e);
      })
      .on("end", cb);
  }
);

// Main build task, create dist folder
// Type "gulp build" in command line
gulp.task("build", function() {
  runSequence(
    "clean:prod",
    "config:prod",
    [
      "copy-all",
      "styles:prod",
      "styles-vendor:prod",
      "images",
      "js-app:prod",
      "js-vendor:prod"
    ],
    "index-html:prod",
    "caching"
  );
});

gulp.task("develop", function() {
  runSequence(
    "clean:dev",
    "clean-fonts:dev",
    "config:dev",
    "copy-fonts:dev",
    ["styles:dev", "styles-vendor:dev", "js-app:dev", "js-vendor:dev"],
    "index-html:dev",
    "browser-sync"
  );
});

gulp.task("develop-doc", function() {
  runSequence(
    "clean:dev",
    "clean-fonts:dev",
    "config:dev",
    "copy-fonts:dev",
    ["styles:dev", "styles-vendor:dev", "js-app:dev", "js-vendor:dev"],
    "index-html:dev"
  );
});

gulp.task("e2e-test", function() {
  runSequence(
    "clean:prod",
    "config:dev",
    [
      "copy-all",
      "styles:prod",
      "styles-vendor:prod",
      "images",
      "js-app:prod",
      "js-vendor:prod"
    ],
    "index-html:test",
    "caching:test",
    "browser-sync:test",
    "protractor-go"
  );
});

// Main task, start develop proccess.
// Type "gulp" in command line
gulp.task("default", ["develop"]);
