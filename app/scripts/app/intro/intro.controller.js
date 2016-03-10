angular.module('chuvApp.intro').controller('IntroController', ['$scope', '$translatePartialLoader', '$translate', '$rootScope', '$state', 'User', 'backendUrl',
  function ($scope, $translatePartialLoader, $translate, $rootScope, $state, User, backendUrl) {

    $scope.$watch(
      function () {return User.hasCurrent();},
      function (hasCurrent) {
        if (hasCurrent) {
          $state.go("home")
        }
      }
    );

    $translatePartialLoader.addPart('intro');
    $translate.refresh();

    (function($, win) {
      $.fn.inViewport = function(cb) {
        return this.each(function(i, el) {
          function visPx() {
            var elH = $(el).outerHeight(),
              H = $(win).height(),
              r = el.getBoundingClientRect(), t = r.top, b = r.bottom;
            return cb.call(el, Math.max(0, t > 0 ? Math.min(elH, H - t) : (b < H ? b : H)));
          }

          visPx();
          $(win).on("resize scroll", visPx);
        });
      };
    }(jQuery, window));

    $(".to-animate").inViewport(function(px) {
      if (px) {
        $(this).addClass("animate");

        if ($(this).parent().attr("id") === "block__3") {
          $(".action--next").addClass("hidden");
        }
      }
    });

    $('a[href^="#"]').on('click', function(event) {
      var target = $( $(this).attr('href') );
      var state = $(this).attr('href');
      var chapterNumber = parseInt(state.match(/\d+/),10)+1;
      $("a").prop("href", '#block__'+chapterNumber);
      if( target.length ) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: target.offset().top
        }, 500);
      }
      if(chapterNumber === 5) {
        $(".action--next").addClass("hidden");
      }
    });

    $scope.login = function () {
      window.location.href = backendUrl + '/login/hbp';
    };

  }]
);
