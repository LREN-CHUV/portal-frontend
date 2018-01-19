"use strict";

// Module dependencies
var gulp = require("gulp"),
  rimraf = require("rimraf"),
  runSequence = require("run-sequence"),
  gulpLoadPlugins = require("gulp-load-plugins"),
  plugins = gulpLoadPlugins(),
  wiredep = require("wiredep").stream,
  pngquant = require("imagemin-pngquant"),
  processhtml = require("gulp-processhtml"),
  browserSync = require("browser-sync").create(),
  historyApiFallback = require("connect-history-api-fallback"),
  jshint = require("gulp-jshint"),
  filter = require("gulp-filter"),
  rev = require("gulp-rev"),
  revReplace = require("gulp-rev-replace"),
  del = require("del"),
  rename = require("gulp-rename");

// Application's main directories constants
var appConfig = {
  app: require("./bower.json").appPath || "app",
  dist: "dist"
};

// Application's srtucture paths
var appPath = {
  src: {
    html: appConfig.app + "/*.html",
    html404: appConfig.app + "/404.html",
    scripts: {
      html: [appConfig.app + "/scripts/!(external)/**/*.html"],
      external: [appConfig.app + "/scripts/external/**/*"]
    },
    less: appConfig.app + "/styles/less/styles.less",
    js: {
      app: [
        appConfig.app + "/scripts/app/app.js",
        appConfig.app + "/scripts/app/app.config.js",
        appConfig.app + "/scripts/app/**/**.module.js",
        appConfig.app + "/scripts/components/**/**.module.js",
        appConfig.app + "/scripts/app/**/**.js",
        appConfig.app + "/scripts/components/**/**.js"
      ],
      appScripts: [
        appConfig.app + "/scripts/app/app.js",
        appConfig.app + "/scripts/app/app.config.js",
        appConfig.app + "/scripts/components/hightlight/hightlight.filter.js",
        appConfig.app + "/scripts/app/header/header.module.js",
        appConfig.app + "/scripts/app/header/header.controller.js",
        appConfig.app + "/scripts/app/home/home.module.js",
        appConfig.app + "/scripts/app/home/home.router.js",
        appConfig.app + "/scripts/app/home/home.controller.js",
        appConfig.app + "/scripts/app/home/tos.controller.js",
        appConfig.app + "/scripts/app/hbpapps/hbpapps.module.js",
        appConfig.app + "/scripts/app/hbpapps/hbpapps.controller.js",
        appConfig.app + "/scripts/app/articles/articles.module.js",
        appConfig.app + "/scripts/app/articles/articles.service.js",
        appConfig.app + "/scripts/app/articles/articles.controller.js",
        appConfig.app + "/scripts/app/users/users.module.js",
        appConfig.app + "/scripts/app/users/users.controller.js",
        appConfig.app + "/scripts/app/users/users.service.js",
        appConfig.app + "/scripts/app/requests/requests.module.js",
        appConfig.app + "/scripts/app/requests/requests.service.js",
        appConfig.app + "/scripts/app/requests/requests.controller.js",
        appConfig.app + "/scripts/app/models/model.module.js",
        appConfig.app + "/scripts/app/models/model.router.js",
        appConfig.app + "/scripts/app/models/model.controller.js",
        appConfig.app + "/scripts/app/models/model.service.js",
        appConfig.app +
          "/scripts/app/models/variable_exploration/exploration.controller.js",
        appConfig.app +
          "/scripts/app/models/variable_exploration/variable_selection.directives.js",
        appConfig.app + "/scripts/app/models/review/review.controller.js",
        appConfig.app + "/scripts/app/models/review/chart.controller.js",
        appConfig.app +
          "/scripts/app/models/review/configuration.controller.js",
        appConfig.app + "/scripts/app/models/review/criteria.controller.js",
        appConfig.app + "/scripts/app/models/review/dataset.controller.js",
        appConfig.app + "/scripts/app/models/review/estimation.controller.js",
        appConfig.app + "/scripts/app/models/review/footer.controller.js",
        appConfig.app + "/scripts/components/criteria/criteria.module.js",
        appConfig.app + "/scripts/components/criteria/criteria.service.js",
        appConfig.app + "/scripts/components/criteria/groups.service.js",
        appConfig.app + "/scripts/components/criteria/datasets.service.js",
        appConfig.app + "/scripts/components/criteria/variables.service.js",
        appConfig.app +
          "/scripts/components/criteria/chained-select.directive.js",
        appConfig.app + "/scripts/components/util/util-module.js",
        appConfig.app + "/scripts/components/util/chart-util.service.js",
        appConfig.app + "/scripts/components/util/modal-util.service.js",
        appConfig.app + "/scripts/components/header/header-module.js",
        appConfig.app + "/scripts/components/header/header-scroll.js",
        appConfig.app + "/scripts/app/experiments/experiments.module.js",
        appConfig.app + "/scripts/app/experiments/experiments.controller.js",
        appConfig.app + "/scripts/app/experiments/experiments.services.js",
        appConfig.app + "/scripts/app/experiments/experiments.directives.js",
        appConfig.app +
          "/scripts/app/experiments/results/results.directives.js",
        appConfig.app + "/scripts/components/button/button-module.js",
        appConfig.app + "/scripts/components/button/button-rounded.js",
        appConfig.app + "/scripts/components/button/carrousel-button.js",
        appConfig.app + "/scripts/components/checkbox/checkbox-module.js",
        appConfig.app + "/scripts/components/checkbox/icheckbox.js",
        appConfig.app + "/scripts/components/date/from-now.filter.js",
        appConfig.app + "/scripts/components/carrousel/carrousel-module.js",
        appConfig.app + "/scripts/components/carrousel/carrousel.js",
        appConfig.app +
          "/scripts/components/notifications/notifications-module.js",
        appConfig.app + "/scripts/components/notifications/notifications.js",
        appConfig.app + "/scripts/app/mydata/mydata.module.js",
        appConfig.app + "/scripts/app/mydata/mydata.controller.js",
        appConfig.app + "/scripts/app/profile/profile.module.js",
        appConfig.app + "/scripts/app/profile/profile.controller.js",
        appConfig.app + "/scripts/components/scrollbar/scrollbar-module.js",
        appConfig.app + "/scripts/components/scrollbar/scrollbar.js",
        appConfig.app + "/scripts/app/intro/intro.module.js",
        appConfig.app + "/scripts/app/intro/intro.controller.js",
        appConfig.app + "/scripts/components/widget/widget.module.js",
        appConfig.app + "/scripts/components/widget/widget.service.js",
        appConfig.app + "/scripts/components/toolbar/toolbar.module.js",
        appConfig.app + "/scripts/components/toolbar/toolbar.js"
      ]
    },
    images: appConfig.app + "/images/**/*",
    tmp: appConfig.app + "/../.tmp",
    other: {
      font: appConfig.app + "/font/**/*",
      fonts: [
        appConfig.app + "/bower_components/bootstrap/dist/fonts/**/*",
        appConfig.app + "/bower_components/themify-icons/fonts/**/*",
        appConfig.app + "/bower_components/font-awesome/fonts/**/*",
        appConfig.app + "/bower_components/font-awesome/fonts/**/*"
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
    }
  },
  dist: {
    scripts: {
      html: appConfig.dist + "/scripts",
      external: appConfig.dist + "/scripts/external"
    },
    cssDev: appConfig.app + "/styles/css",
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

// Wiredep module options, wiredep includes bower components into index.html(dev) or index-tmpl.html(prod)
var wiredepOptions = {
  ignorePath: /\.\.\//,
  exclude: [
    /angular-gridster/,
    /less/,
    /SHA-1/,
    /ng-csv/,
    /doT/,
    /jquery-extendext/,
    /jquery-mousewheel/,
    /jquery.ui.draggable.js/,
    /jquery.ui.resizable.js/
  ] //exclude libraries, wich wasn't in Grunt
};

// Cleaning .tmp(dev) or dist(prod)
gulp.task("clean:dev", function(cb) {
  return rimraf(appPath.src.tmp, cb);
});

gulp.task("clean:prod", function(cb) {
  return rimraf(appConfig.dist, cb);
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
    .pipe(wiredep(wiredepOptions))
    .pipe(
      plugins.inject(gulp.src(appPath.src.js.appScripts, { read: false }), {
        ignorePath: "app"
      })
    )
    .pipe(rename("index.html"))
    .pipe(gulp.dest(appConfig.app));
});

gulp.task("index-html:prod", function() {
  return gulp
    .src(appConfig.app + "/index-gulp.html")
    .pipe(wiredep(wiredepOptions))
    .pipe(
      plugins.inject(gulp.src(appPath.src.js.appScripts, { read: false }), {
        ignorePath: "app"
      })
    )
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

// Compile less to css (dev) minify css (prod)
gulp.task("styles:dev", function() {
  return (gulp
      .src(appPath.src.less)
      .pipe(plugins.less())
      .pipe(
        plugins.autoprefixer({
          browsers: ["last 3 versions"],
          cascade: false
        })
      )
      // .pipe(plugins.cssmin())
      .pipe(gulp.dest(appPath.dist.cssDev))
      .pipe(browserSync.stream()) );
});

gulp.task("styles:prod", function() {
  return gulp
    .src(appPath.src.less)
    .pipe(plugins.less())
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

gulp.task("styles-vendor:prod", function() {
  return gulp
    .src(require("wiredep")(wiredepOptions).css)
    .pipe(plugins.importCss())
    .pipe(plugins.cssmin())
    .pipe(plugins.concat("vendor.css"))
    .pipe(gulp.dest(appPath.dist.cssProd));
});

// Concatenate js and copy it in dist folder
gulp.task("js-vendor:prod", function() {
  var jsArr = require("wiredep")(wiredepOptions).js;
  jsArr.push(appConfig.app + "/styles/plugins/wijets/wijets.js");

  return gulp
    .src(jsArr)
    .pipe(plugins.uglify())
    .pipe(plugins.concat("vendor.js"))
    .pipe(gulp.dest(appPath.dist.js.vendorsPath));
});

gulp.task("js-app:prod", function() {
  return gulp
    .src(appPath.src.js.appScripts)
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.concat("scripts.js"))
    .pipe(plugins.uglify())
    .pipe(gulp.dest(appPath.dist.js.vendorsPath));
});

// Renaming main js and css files for browser caching
gulp.task("caching", function() {
  runSequence("revision", "replace", "replace-clean");
});

gulp.task("revision", function() {
  var htmlFilter = filter("*.html"),
    jsFilter = filter("**/*.js"),
    cssFilter = filter("**/*.css");

  var test = gulp.src(appPath.dist.revision).pipe(rev());

  return gulp
    .src(appPath.dist.revision)
    .pipe(rev())
    .pipe(jsFilter)
    .pipe(gulp.dest(appConfig.dist + "/scripts"))
    .pipe(test)
    .pipe(cssFilter)
    .pipe(gulp.dest(appConfig.dist + "/styles"))
    .pipe(test)
    .pipe(htmlFilter)
    .pipe(gulp.dest(appConfig.dist))
    .pipe(test)
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

gulp.task("replace-clean", function() {
  return del(appPath.dist.replaceClean);
});

// Use Browser-sync instead of Livereload
// Browser-sync watchs for less, js and index-gulp.html
gulp.task("browser-sync-reload", function() {
  return browserSync.reload();
});

gulp.task("browser-sync", function() {
  browserSync.init({
    server: "./app",
    port: 8000,
    middleware: [historyApiFallback()]
  });

  gulp.watch(appConfig.app + "/styles/**/*.less", ["styles:dev"]);
  gulp.watch(appConfig.app + "/scripts/**/*.js", ["index-html:dev"]);
  gulp
    .watch(appConfig.app + "/scripts/**/*.js")
    .on("change", browserSync.reload);
  gulp.watch("./bower.json", ["index-html:dev"]);
  gulp.watch(appConfig.app + "/index-gulp.html", ["index-html:dev"]);
  gulp.watch(appConfig.app + "/index.html").on("change", browserSync.reload);
  gulp.watch(appConfig.app + "/scripts/**/*.html").on("change", browserSync.reload);
});

// Lint js files in "app/scripts"
// to lint js files you should type "gulp js-hint" in command line
gulp.task("js-hint", function() {
  return gulp
    .src(appPath.src.js.appScripts)
    .pipe(jshint(".jshintrc"))
    .pipe(jshint.reporter("jshint-stylish", { beep: true }));
});

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
    "config:dev",
    ["index-html:dev", "styles:dev"],
    "browser-sync"
  );
});

gulp.task("develop-doc", function() {
  runSequence(
    "clean:dev",
    "config:dev",
    ["index-html:dev", "styles:dev"]
  );
});

// Main task, start develop proccess.
// Type "gulp" in command line
gulp.task("default", ["develop"]);
