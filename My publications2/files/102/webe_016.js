(function($){

  var Hero = function($cmp) {
    var that = this;

    that.story = $cmp.closest('.story');
    that.cmp = $cmp;
    that.asset = $cmp.attr('data-asset');
    
    $(window).unbind('resize.storyhero').bind('resize.storyhero', function() {
      that.cmp.trigger('positionHeader', that);
    });

    that.cmp.addClass('is-loading');
    
    that.loadTimer = setTimeout(function() {
      that.cmp.removeClass('is-loading').addClass('is-long-load');
    }, 3000);

    that.cmp.bind('replace.webe-jsload', function() {
      clearTimeout(that.loadTimer);
      that.cmp.removeClass('is-loading');
      that.cmp.trigger('positionHeader', that);
    });
    that.cmp.trigger('positionHero', that);
  };


  Hero.prototype.updateHero = function(asset) {
    var that = this;
    if (typeof asset !== 'undefined') {
      that.asset = asset;
    }
    that.cmp.trigger('positionHero', that);
    clearTimeout(that.loadTimer);
    that.cmp.removeClass('is-loading');
  };



  Webe.Hero = Hero;


  // initialize for Hero components
  if (typeof Webe.storyHero === 'undefined') {
    $('.page-story .component-hero').each(function() {
      Webe.storyHero = new Hero($(this));
    });
  }


})(jQuery);